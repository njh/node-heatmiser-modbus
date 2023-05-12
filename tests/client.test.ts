import Client from '../lib/client'
import Thermostat from '../lib/thermostat'

let client: Client

describe(Client, function () {
  describe('constructing a client', function () {
    it('stores the port of the client', function () {
      client = new Client('/dev/ttyS0')
      expect(client.port).toBe('/dev/ttyS0')
    })
  })

  describe('adding a thermostat', function () {
    beforeEach(() => {
      client = new Client('/dev/ttyS0')
    })

    it('adds a thermostat with id 1 and no name', function () {
      const therm = client.addThermostat(1)
      expect(therm.id).toBe(1)
      expect(therm.name).toBe('Thermostat #1')
    })

    it('adds a thermostat with id 2 and a name', function () {
      const therm = client.addThermostat(2, 'Bedroom 2')
      expect(therm.id).toBe(2)
      expect(therm.name).toBe('Bedroom 2')
    })
  })

  describe('get a thermostat', function () {
    beforeEach(() => {
      client = new Client('/dev/ttyS0')
    })

    it('gets a thermostat that already exists', function () {
      client.addThermostat(1, 'one')
      const therm = client.getThermostat(1)
      expect(therm).not.toBeUndefined()
      expect(therm?.id).toBe(1)
      expect(therm?.name).toBe('one')
    })

    it('gets a thermostat that doesn\'t exist', function () {
      const therm = client.getThermostat(2)
      expect(therm).toBeUndefined()
    })
  })

  describe('getting all thermostats', function () {
    beforeEach(() => {
      client = new Client('/dev/ttyS0')
    })

    it('gets empty array when no thermostats', function () {
      const all = client.getThermostats()
      expect(all.length).toBe(0)
    })

    it('gets one thermostat when only one added', function () {
      client.addThermostat(1, 'one')
      const all = client.getThermostats()
      expect(all.length).toBe(1)
      expect(all[0]).toBeInstanceOf(Thermostat)
      expect(all[0].id).toBe(1)
    })

    it('gets two thermostat when two added', function () {
      client.addThermostat(1, 'one')
      client.addThermostat(2, 'two')
      expect(client.getThermostats().length).toBe(2)
    })
  })

  describe('deleting a thermostat', function () {
    beforeEach(() => {
      client = new Client('/dev/ttyS0')
    })

    it('returns undefined after deleting a thermostat', function () {
      client.addThermostat(1)
      client.addThermostat(2)
      client.deleteThermostat(2)
      const thermo = client.getThermostat(2)
      expect(thermo).toBe(undefined)
    })

    it('returns empty array after deleting a thermostat', function () {
      client.addThermostat(1)
      client.deleteThermostat(1)
      expect(client.getThermostats().length).toBe(0)
    })
  })
})
