#!/usr/bin/env node

import { Command, Option } from 'commander'
import Client from '../lib/index'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageVersion = require('../package.json').version

const program = new Command()

program
  .version(packageVersion)
  .description('Tool for controlling Heatmiser Modbus Thermostats')
  .addOption(new Option('-d, --device <port>', 'The serial port device to connect to (eg /dev/ttyUSB0)').makeOptionMandatory())
  .addOption(new Option('-i, --id <num>', 'The Communications ID of the device to control (1-32)').default(1))

program
  .command('turn-on')
  .description('Turn on the thermostat')
  .action(() => {
    const options = program.opts()
    console.log('Turning On')
    const client = new Client(options.device)
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    client.connect(() => { client.turnOn(options.id).then(() => client.close()) })
  })

program
  .command('turn-off')
  .description('Turn off the thermostat')
  .action(() => {
    const options = program.opts()
    console.log('Turning Off')
    const client = new Client(options.device)
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    client.connect(() => { client.turnOff(options.id).then(() => client.close()) })
  })

program
  .command('set-time')
  .description('Sync the system clock to the thermostat')
  .action(() => {
    const options = program.opts()
    const now = new Date()
    console.log('Setting time to: ', now)
    const client = new Client(options.device)
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    client.connect(() => { client.setTime(options.id, now).then(() => client.close()) })
  })

program.parse()
