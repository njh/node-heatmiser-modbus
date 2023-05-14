import Client from './client'

export default class Thermostat {
  readonly client: Client
  readonly id: number
  public name: string

  firmwareVersion: number | undefined
  relayStatus: boolean | undefined
  roomTemperature: number | undefined | null
  floorTemperature: number | undefined | null
  targetTemperature: number | undefined | null
  onOffState: boolean | undefined
  operationMode: string | undefined | null

  constructor (client: Client, id: number, name?: string) {
    this.client = client
    this.id = id
    this.name = name ?? `Thermostat #${id}`
  }

  async readStatus (): Promise<any> {
    return await this.client.readStatus(this)
  }

  async turnOn (): Promise<any> {
    return await this.client.turnOn(this.id)
  }

  async turnOff (): Promise<any> {
    return await this.client.turnOff(this.id)
  }

  async setTargetTemperature (temperature: number): Promise<any> {
    return await this.client.setTargetTemperature(this.id, temperature)
  }

  async setTime (time?: Date): Promise<any> {
    return await this.client.setTime(this.id, time)
  }

  async setKeylock (pin: number | null): Promise<any> {
    return await this.client.setKeylock(this.id, pin)
  }
}
