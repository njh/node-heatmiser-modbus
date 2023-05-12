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

  async setTemperature (id: number, temperature: number): Promise<any> {
    this.modbus.setID(id)
    return await this.modbus.writeRegister(31, 1)
  }

  async turnOn (id: number): Promise<any> {
    this.modbus.setID(id)
    return await this.modbus.writeRegister(31, 1)
  }

  async turnOff (id: number): Promise<any> {
    this.modbus.setID(id)
    return await this.modbus.writeRegister(31, 0)
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
}
