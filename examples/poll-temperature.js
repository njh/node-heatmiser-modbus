#!/usr/bin/env node

const { Client } = require('heatmiser-modbus')

// Create a new client with path to the serial port device
const client = new Client('/dev/ttyUSB0')

// Add a thermostat with Communications ID = 1
const thermostat = client.addThermostat(1)

function displayTemperature () {
  thermostat.readStatus()
    .then(() => {
      // Display temperature when data comes back
      console.log('Room temperature: ', thermostat.roomTemperature)
    })
}

client.connect()
  .then(
    // Read and display temperature every second
    () => setInterval(displayTemperature, 1000)
  )
  .catch((err) => {
    console.error('Error!', err)
  })
