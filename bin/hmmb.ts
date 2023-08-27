#!/usr/bin/env node

import { Argument, Command, Option } from 'commander'
import pc from 'picocolors'
import { Client, Thermostat } from '../lib/index'
import { version } from '../lib/version'

function runClient (program: Command, callback: (thermostat: Thermostat) => Promise<any>): void {
  const options = program.opts()
  const client = new Client(options.device)
  const thermostat = client.addThermostat(options.id)

  client.connect()
    .then(async () => {
      return await callback(thermostat)
    })
    .catch((err) => {
      console.error(err)
    })
    .finally(() => {
      client.close()
    })
}

const program = new Command()

program
  .version(version)
  .description('Tool for controlling Heatmiser Modbus Thermostats')
  .addOption(new Option('-d, --device <port>', 'The serial port device to connect to (eg /dev/ttyUSB0)').env('HMMB_DEVICE').makeOptionMandatory())
  .addOption(new Option('-i, --id <num>', 'The Communications ID of the device to control (1-32)').env('HMMB_ID').default(1))

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
  .command('hold')
  .argument('<temp>', 'temperature for hold period')
  .argument('<hours:mins>', 'time of hold period')
  .description('Set a different temperature for a desired duration')
  .action((temp: number, duration: string) => {
    runClient(program, async (thermostat) => {
      let mins: number
      const matches = duration.match(/^(\d+):(\d+)$/)
      if (matches != null) {
        mins = (parseInt(matches[1]) * 60) + parseInt(matches[2])
      } else {
        mins = parseInt(duration)
      }
      console.log(`Setting temperature to ${temp} for ${mins} minutes`)
      return await thermostat.holdMode(temp, mins)
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
  .command('set-floor-limit')
  .argument('<temp>', 'the temperature limit', parseFloat)
  .description('Set the temperature limit for the floor sensor')
  .action((temp) => {
    runClient(program, async (thermostat) => {
      console.log('Setting floor limit temperature to: ', temp)
      return await thermostat.setFloorLimitTemperature(temp)
    })
  })

program
  .command('set-frost-temperature')
  .argument('<temp>', 'the frost protect temperature', parseFloat)
  .description('Set the frost protection temperature (7-17 °C)')
  .action((temp) => {
    runClient(program, async (thermostat) => {
      console.log('Setting frost protection temperature to: ', temp)
      return await thermostat.setFrostProtectTemperature(temp)
    })
  })

program
  .command('set-switching-differential')
  .addArgument(
    new Argument('<temp>')
      .choices(['0.5', '1.0', '2.0', '3.0'])
  )
  .description('Set the thermostat switching differential (in °C)')
  .action((temp: string) => {
    runClient(program, async (thermostat) => {
      console.log('Setting switching differential to: ', temp)
      return await thermostat.setSwitchingDifferential(parseFloat(temp))
    })
  })

program
  .command('set-output-delay')
  .argument('<minutes>', 'the number of minutes delay by', parseInt)
  .description('Set time in minutes to delay output switching by')
  .action((minutes: number) => {
    runClient(program, async (thermostat) => {
      console.log('Setting output delay to: ', minutes)
      return await thermostat.setOutputDelay(minutes)
    })
  })

program
  .command('set-up-down-limit')
  .argument('<limit>', 'the +/- temperature limit', parseFloat)
  .description('Set a limit on the use of the up and down keys')
  .action((limit) => {
    runClient(program, async (thermostat) => {
      console.log('Setting up/down temperature limit to: ', limit)
      return await thermostat.setUpDownLimit(limit)
    })
  })

program
  .command('set-sensors')
  .argument('<mode>', 'the sensor selection mode number', parseInt)
  .description('Set the sensor selection mode. See extended help for values.')
  .addHelpText('after',
    '\nSensor modes:\n' +
    '  0    Built in Sensor with optional Remote Air (Default)\n' +
    '  1    Remoter Air only\n' +
    '  2    Floor Sensor only\n' +
    '  3    Built in + Floor Sensor + optional Remote Air\n' +
    '  4    Floor Sensor and Remote Air only\n'
  )
  .action((mode) => {
    runClient(program, async (thermostat) => {
      console.log('Setting sensor selection mode to: ', mode)
      return await thermostat.setSensorSelection(mode)
    })
  })

program
  .command('set-programme-periods')
  .addArgument(
    new Argument('<periods>').choices(['4', '6'])
  )
  .description('Set the number of programme periods')
  .action((periods) => {
    const number = parseInt(periods)
    runClient(program, async (thermostat) => {
      console.log('Setting number of programme periods to: ', number)
      return await thermostat.setProgrammePeriods(number)
    })
  })

program
  .command('set-programme-mode')
  .argument('<mode>', 'the programme mode number or name')
  .description('Set the type of programme / schedule mode. See extended help for details.')
  .addHelpText('after',
    '\nProgramme modes:\n' +
    '  0   5day_2day   One schedule for weekdays, another for weekends (Default)\n' +
    '  1   7day        Different schedule for each day of the week\n' +
    '  2   24hour      Same schedule every day\n' +
    '  3   none        Non-Programmable - temperature control only\n'
  )
  .action((mode) => {
    if (mode.match(/^\d$/) !== null) {
      mode = parseInt(mode)
    }
    runClient(program, async (thermostat) => {
      console.log('Setting programme mode to: ', mode)
      return await thermostat.setProgrammeMode(mode)
    })
  })

program
  .command('set-units')
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
      console.log('Setting time to: ', now.toLocaleString())
      return await thermostat.setTime(now)
    })
  })

program
  .command('set-auto-dst')
  .addArgument(
    new Argument('<on or off>')
      .choices(['on', 'off'])
  )
  .description('Enable or disable automatic adjustment for Daylight Saving Time')
  .action((enabled) => {
    runClient(program, async (thermostat) => {
      if (enabled === 'on') {
        console.log('Enabling automatic Daylight Saving Time adjustments')
        return await thermostat.setAutoDST(true)
      } else if (enabled === 'off') {
        console.log('Disabling automatic Daylight Saving Time adjustments')
        return await thermostat.setAutoDST(false)
      }
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

program
  .command('factory-reset')
  .description('Restore thermostat to the default factory settings')
  .action(() => {
    runClient(program, async (thermostat) => {
      console.log('Performing factory reset')
      console.log('NOTE: Modbus support will be disabled after reset')
      return await thermostat.factoryReset()
    })
  })

program.parse()
