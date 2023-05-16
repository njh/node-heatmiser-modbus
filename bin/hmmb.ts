#!/usr/bin/env node

import { Command, Option } from 'commander'
import pc from 'picocolors'
import { Client, Thermostat } from '../lib/index'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageVersion = require('../package.json').version

function runClient (program: Command, callback: (thermostat: Thermostat) => Promise<any>): void {
  const options = program.opts()
  const client = new Client(options.device)
  const thermostat = client.addThermostat(options.id)

  client.connect()
    .then(async () => {
      return await callback(thermostat)
    })
    .then(() => {
      client.close()
    })
    .catch((err) => {
      console.error(err)
    })
}

const program = new Command()

program
  .version(packageVersion)
  .description('Tool for controlling Heatmiser Modbus Thermostats')
  .addOption(new Option('-d, --device <port>', 'The serial port device to connect to (eg /dev/ttyUSB0)').makeOptionMandatory())
  .addOption(new Option('-i, --id <num>', 'The Communications ID of the device to control (1-32)').default(1))

program
  .command('get-status')
  .description('Display thermostat status (including current temperatures)')
  .action(() => {
    runClient(program, async (thermostat) => {
      let units = ''
      return await thermostat.getTemperatureUnits()
        .then(async (result) => {
          units = result
          return await thermostat.readStatus()
        })
        .then((status) => {
          const relayStatus = thermostat.relayStatus == null
            ? 'n/a'
            : thermostat.relayStatus ? 'on 🔥' : 'off'
          console.log(`      Relay Status: ${pc.bold(relayStatus)}`)
          console.log(`  Room Temperature: ${pc.bold(thermostat.roomTemperature)} °${units}`)
          console.log(` Floor Temperature: ${pc.bold(thermostat.floorTemperature)} °${units}`)
          console.log(`Target Temperature: ${pc.bold(thermostat.targetTemperature)} °${units}`)
          const onOffState = thermostat.onOffState == null
            ? 'n/a'
            : thermostat.onOffState ? 'on' : 'off'
          console.log(`      On/Off State: ${pc.bold(onOffState)}`)
          console.log(`    Operation Mode: ${pc.bold(thermostat.operationMode)}`)
        })
    })
  })

program
  .command('turn-on')
  .description('Turn on the thermostat')
  .action(() => {
    runClient(program, async (thermostat) => {
      console.log('Turning on: ' + thermostat.name)
      return await thermostat.turnOn()
    })
  })

program
  .command('turn-off')
  .description('Turn off the thermostat')
  .action(() => {
    runClient(program, async (thermostat) => {
      console.log('Turning off: ' + thermostat.name)
      return await thermostat.turnOff()
    })
  })

program
  .command('set-temperature')
  .argument('<temp>', 'the target temperature', parseFloat)
  .description('Set the target room temperature')
  .action((temp) => {
    runClient(program, async (thermostat) => {
      console.log('Setting target temperature to: ', temp)
      return await thermostat.setTargetTemperature(temp)
    })
  })

program
  .command('set-temperature-units')
  .argument('<units>', 'the temperature units (C or F)')
  .description('Set the temperature units used by the thermostat')
  .action((units) => {
    runClient(program, async (thermostat) => {
      const initial = units[0].toUpperCase()
      console.log('Setting temperature units to: ', initial)
      return await thermostat.setTemperatureUnits(initial)
    })
  })

program
  .command('set-time')
  .description('Sync the system clock to the thermostat')
  .action(() => {
    runClient(program, async (thermostat) => {
      const now = new Date()
      console.log('Setting time to: ', now)
      return await thermostat.setTime(now)
    })
  })

program
  .command('set-keylock')
  .argument('<pin>', 'a 4-digit pin', parseInt)
  .description('Set a PIN to lock the keypad with')
  .action((pin) => {
    runClient(program, async (thermostat) => {
      if (isNaN(pin)) {
        pin = null
      }
      console.log('Setting keylock pin to: ', pin)
      return await thermostat.setKeylock(pin)
    })
  })

program.parse()
