#!/usr/bin/env node

import { Command, Option } from 'commander'
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
      return await thermostat.readStatus()
        .then(() => {
          // FIXME: how can this be more concise (and keep eslint happy)
          let relayStatus = thermostat.relayStatus
          if (relayStatus != null) {
            relayStatus = (relayStatus ?? false) ? 'On 🔥' : 'Off'
          }
          console.log('Relay Status: ', relayStatus)
          console.log('Room Temperature: ', thermostat.roomTemperature)
          console.log('Floor Temperature: ', thermostat.floorTemperature)
          console.log('Target Temperature: ', thermostat.targetTemperature)
          let onOffState = thermostat.onOffState
          if (onOffState != null) {
            onOffState = (onOffState ?? false) ? 'On' : 'Off'
          }
          console.log('On/Off State: ', onOffState)
          console.log('Operation Mode: ', thermostat.operationMode)
          console.log('Firmware version:', thermostat.firmwareVersion)
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
