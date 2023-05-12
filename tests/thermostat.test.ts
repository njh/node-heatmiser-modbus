import Client from '../lib/client'
import Thermostat from '../lib/thermostat'

jest.mock('../lib/client')
const client = new Client('/dev/ttyS0')

describe(Thermostat, function () {
  describe('constructing a thermostat', function () {
    it('with no name', function () {
      const therm = new Thermostat(client, 1)
      expect(therm.id).toBe(1)
      expect(therm.name).toBe('Thermostat #1')
    })

    it('with a name', function () {
      const therm = new Thermostat(client, 1, 'Bedroom 1')
      expect(therm.id).toBe(1)
      expect(therm.name).toBe('Bedroom 1')
    })
  })
})
