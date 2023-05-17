import { isDST } from '../lib/utils'
import Thermostat from './thermostat'
import ModbusRTU from 'modbus-serial'

export default class Client {
  private readonly thermostats: Map<number, Thermostat>
  readonly port: string
  private readonly modbus: ModbusRTU

  constructor (port: string) {
    this.thermostats = new Map<number, Thermostat>()
    this.port = port
    this.modbus = new ModbusRTU()
  }

  addThermostat (id: number, name?: string): Thermostat {
    let thermostat = this.thermostats.get(id)
    if (thermostat === undefined) {
      thermostat = new Thermostat(this, id, name)
      this.thermostats.set(id, thermostat)
    }
    return thermostat
  }

  getThermostat (id: number): Thermostat | undefined {
    return this.thermostats.get(id)
  }

  deleteThermostat (id: number): void {
    this.thermostats.delete(id)
  }

  getThermostats (): Thermostat[] {
    return Array.from(this.thermostats.values())
  }

  private decodeTemperature (temp: number): number | null {
    if (temp >= 0xfffe) {
      return null
    } else {
      return temp / 10.0
    }
  }

  private decodeOperationMode (mode: number): string | null {
    switch (mode) {
      case 0: return 'change_over'
      case 1: return 'schedule'
      case 2: return 'hold'
      case 3: return 'advanced'
      case 4: return 'away'
      case 5: return 'frost_mode'
      default: return null
    }
  }

  async readStatus (thermostat: Thermostat): Promise<any> {
    this.modbus.setID(thermostat.id)
    return await this.modbus.readHoldingRegisters(1, 8)
      .then((result) => {
        const data = result.data
        thermostat.relayStatus = data[0] !== 0
        thermostat.roomTemperature = this.decodeTemperature(data[1])
        thermostat.floorTemperature = this.decodeTemperature(data[2])
        thermostat.targetTemperature = this.decodeTemperature(data[5])
        thermostat.onOffState = data[6] !== 0
        thermostat.operationMode = this.decodeOperationMode(data[7])
        return thermostat
      })
  }

  async readTemperatureUnits (id: number): Promise<string> {
    this.modbus.setID(id)
    return await this.modbus.readHoldingRegisters(20, 1)
      .then((result) => {
        return (result.data[0] === 0 ? 'C' : 'F')
      })
  }

  // FIXME: also provide a callback version of connect() ?
  async connect (): Promise<any> {
    // Open connection to a serial port
    return await this.modbus.connectRTUBuffered(
      this.port,
      { baudRate: 9600, parity: 'none' }
    )
  }

  close (): void {
    this.modbus.close(() => {})
  }

  async turnOn (id: number): Promise<any> {
    this.modbus.setID(id)
    return await this.modbus.writeRegister(31, 1)
  }

  async turnOff (id: number): Promise<any> {
    this.modbus.setID(id)
    return await this.modbus.writeRegister(31, 0)
  }

  async setHoldTemperature (id: number, temperature: number, minutes: number): Promise<any> {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    this.modbus.setID(id)
    return await this.modbus.writeRegister(37, (hours << 8) + mins)
      .then(async () => await this.setTargetTemperature(id, temperature))
  }

  async setTargetTemperature (id: number, temperature: number): Promise<any> {
    this.modbus.setID(id)
    return await this.modbus.writeRegister(33, Math.round(temperature * 10))
  }

  async setFloorLimitTemperature (id: number, temperature: number): Promise<any> {
    this.modbus.setID(id)
    return await this.modbus.writeRegister(25, Math.round(temperature * 10))
  }

  async setTemperatureUnits (id: number, units: string): Promise<any> {
    let value: number
    if (/^[Cc]/.test(units)) {
      value = 0
    } else if (/^[Ff]/.test(units)) {
      value = 1
    } else {
      throw new Error('`units` should be [C]elsius or [F]ahrenheit')
    }
    this.modbus.setID(id)
    return await this.modbus.writeRegister(20, value)
  }

  async setTime (id: number, time: Date = new Date()): Promise<any> {
    this.modbus.setID(id)
    return await this.modbus.writeRegisters(46,
      [
        time.getFullYear(),
        ((time.getMonth() + 1) << 8) + time.getDate(),
        (time.getHours() << 8) + time.getMinutes(),
        time.getSeconds()
      ]

    ).then(async () => {
      const dst = isDST(time) ? 0x01 : 0x00
      return await this.modbus.writeRegister(29, dst)
    })
  }

  async setKeylock (id: number, pin: number | null): Promise<any> {
    this.modbus.setID(id)
    if (pin === null) {
      pin = 0
    }
    return await this.modbus.writeRegister(41, pin)
  }

  async readFirmwareVersion (id: number): Promise<number> {
    this.modbus.setID(id)
    return await this.modbus.readHoldingRegisters(0, 1)
      .then((result) => result.data[0])
  }

  async factoryReset (id: number): Promise<any> {
    this.modbus.setID(id)
    return await this.modbus.writeRegister(45, 1)
  }
}
