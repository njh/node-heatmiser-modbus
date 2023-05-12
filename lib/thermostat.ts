import Client from './client'

export default class Thermostat {
  readonly client: Client
  readonly id: number
  public name: string

  constructor (client: Client, id: number, name?: string) {
    this.client = client
    this.id = id
    this.name = name ?? `Thermostat #${id}`
  }

  async turnOn (): Promise<any> {
    return await this.client.turnOn(this.id)
  }

  async turnOff (): Promise<any> {
    return await this.client.turnOff(this.id)
  }

  async setTime (time?: Date): Promise<any> {
    return await this.client.setTime(this.id, time)
  }
}
