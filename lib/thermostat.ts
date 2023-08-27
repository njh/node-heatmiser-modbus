import Client from './client'

export default class Thermostat {
  readonly client: Client
  readonly id: number
  public name: string

  relayStatus: boolean | undefined
  roomTemperature: number | undefined | null
  floorTemperature: number | undefined | null
  targetTemperature: number | undefined | null
  onOffState: boolean | undefined
  operationMode: string | undefined | null
  temperatureUnits: string | undefined

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

  async holdMode (temperature: number, minutes: number): Promise<any> {
    return await this.client.holdMode(this.id, temperature, minutes)
  }

  async setProgrammePeriods (periods: number): Promise<any> {
    return await this.client.setProgrammePeriods(this.id, periods)
  }

  async setTargetTemperature (temperature: number): Promise<any> {
    return await this.client.setTargetTemperature(this.id, temperature)
  }

  async setFrostProtectTemperature (temperature: number): Promise<any> {
    return await this.client.setFrostProtectTemperature(this.id, temperature)
  }

  async setFloorLimitTemperature (temperature: number): Promise<any> {
    return await this.client.setFloorLimitTemperature(this.id, temperature)
  }

  async setSwitchingDifferential (temperature: number): Promise<any> {
    return await this.client.setSwitchingDifferential(this.id, temperature)
  }

  async setOutputDelay (minutes: number): Promise<any> {
    return await this.client.setOutputDelay(this.id, minutes)
  }

  async setUpDownLimit (limit: number): Promise<any> {
    return await this.client.setUpDownLimit(this.id, limit)
  }

  async getTemperatureUnits (): Promise<any> {
    if (this.temperatureUnits === undefined) {
      return await this.readTemperatureUnits()
        .then((units) => {
          this.temperatureUnits = units
          return this.temperatureUnits
        })
    } else {
      return await Promise.resolve(this.temperatureUnits)
    }
  }

  async readTemperatureUnits (): Promise<string> {
    return await this.client.readTemperatureUnits(this.id)
  }

  async setTemperatureUnits (units: string): Promise<any> {
    return await this.client.setTemperatureUnits(this.id, units)
  }

  async setTime (time?: Date): Promise<any> {
    return await this.client.setTime(this.id, time)
  }

  async setAutoDST (enabled: boolean): Promise<any> {
    return await this.client.setAutoDST(this.id, enabled)
  }

  async setKeylock (pin: number | null): Promise<any> {
    return await this.client.setKeylock(this.id, pin)
  }

  async readFirmwareVersion (): Promise<number> {
    return await this.client.readFirmwareVersion(this.id)
  }

  async factoryReset (): Promise<any> {
    return await this.client.factoryReset(this.id)
  }
}
