import { isDST } from '../lib/utils'
import ModbusRTU from 'modbus-serial'

export default class Client {
  private readonly port: string
  private readonly modbus: ModbusRTU

  constructor (port: string) {
    this.port = port
    this.modbus = new ModbusRTU()
  }

  // FIXME: return a promise?
  connect (callback: () => void): void {
    // Open connection to a serial port
    this.modbus.connectRTUBuffered(
      this.port,
      { baudRate: 9600, parity: 'none' },
      callback
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
