#!/usr/bin/env node

const { Client } = require('heatmiser-modbus')

// Create a new client with path to the serial port device
const client = new Client('/dev/ttyUSB0')

// Add a thermostat with Communications ID = 1
const thermostat = client.addThermostat(1)

// Connect to the serial port
client.connect()
  .then(() => {
    // Once connected, send a modbus command to set the temperature
    const target = 20.5
    console.log('Setting temperature to: ', target)
    return thermostat.setTargetTemperature(target)
  })
  .then(() => {
    // If successful
    console.log('Done.')
  })
  .catch((err) => {
    // If there was an error
    console.error('Error!', err)
  })
  .finally(() => {
    // Always close the serial port afterwards
    client.close()
  })
