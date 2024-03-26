node-heatmiser-modbus
=====================

node.js library and command line tool for controlling [Heatmiser] Modbus Thermostats.

It has been tested with the following devices:
* [Heatmiser Edge]
* [Heatmiser Touch-E v2]


Installation
------------

To install in your local project:
```sh
npm install heatmiser-modbus
```

Or to install globally and make easy use of the `hmmb` command line tool:
```sh
npm install -g heatmiser-modbus
```


Wiring
------

To connect a Heatmiser Modbus Thermostat to a computer, you need a RS-485 adaptor.

<img src="docs/usb-to-heatmiser-edge.png" alt="Heatmiser Edge Connected to USB using RS-485 wiring" height="480" />

I initially had some trouble with connecting using a short (1m) cable during testing, until I discovered that the termination resistor in the Heatmiser Edge had to be switched *off* for short distances.

The following RS-485 interfaces have been tested with:
* [Waveshare USB to RS485 Bidirectional Converter](https://www.waveshare.com/product/iot-communication/wired-comm-converter/usb-to-rs485.htm)
* [Waveshare USB to RS232/485/TTL Converter](https://www.waveshare.com/product/iot-communication/wired-comm-converter/usb-to-rs232-uart-fifo/usb-to-rs232-485-ttl.htm?sku=15817)

There are some very expensive industrial RS-485 interfaces out there.
But I have found [Waveshare](https://www.waveshare.com/) to be a good balance between cost and quality.

To connect everything together, I used a 1 pair Screened 24-AWG RS-485 Cable:

https://cpc.farnell.com/CB21472

As the Heatmiser devices do not have a RS-485 signal ground terminal, I left them disconnected.
But I looped the shielding through between devices and connected the ground on the Waveshare adaptor.


Command Line Tool
-----------------

The `hmmb` command line tool is provided to configure and control thermostats, without having to write any JavaScript.

Two things are required to use the tool:
* The path to the serial port, that the modbus devices are connected to
* The Unit Identifier (aka Communications ID) of the thermostat to talk to

These can be provided as command line options, or via environment variables.
If the Modbus Unit Identifier is not given, it defaults to 1.

```
Usage: hmmb [options] [command]

Tool for controlling Heatmiser Modbus Thermostats

Options:
  -V, --version                      output the version number
  -d, --device <port>                The serial port device to connect to (eg /dev/ttyUSB0) (env: HMMB_DEVICE)
  -i, --id <num>                     The Communications ID of the device to control (1-32) (default: 1, env: HMMB_ID)
  -h, --help                         display help for command

Commands:
  get-status                         Display thermostat status (including current temperatures)
  turn-on                            Turn on the thermostat
  turn-off                           Turn off the thermostat
  hold <temp> <hours:mins>           Set a different temperature for a desired duration
  set-temperature <temp>             Set the target room temperature
  set-floor-limit <temp>             Set the temperature limit for the floor sensor
  set-frost-temperature <temp>       Set the frost protection temperature (7-17 °C)
  set-switching-differential <temp>  Set the thermostat switching differential (in °C)
  set-output-delay <minutes>         Set time in minutes to delay output switching by
  set-up-down-limit <limit>          Set a limit on the use of the up and down keys
  set-sensors <mode>                 Set the sensor selection mode. See extended help for values.
  set-programme-periods <periods>    Set the number of programme periods for each day
  set-programme-mode <mode>          Set the type of programme / schedule mode. See extended help for details.
  set-units <units>                  Set the temperature units used by the thermostat
  set-time                           Sync the system clock to the thermostat
  set-auto-dst <on or off>           Enable or disable automatic adjustment for Daylight Saving Time
  set-keylock <pin>                  Set a PIN to lock the keypad with
  factory-reset                      Restore thermostat to the default factory settings
  help [command]                     display help for command
```


Some of the commands have additional help text, for example:
```
$ hmmb help set-programme-mode
Usage: hmmb set-programme-mode [options] <mode>

Set the type of programme / schedule mode. See extended help for details.

Arguments:
  mode        the programme mode number or name

Options:
  -h, --help  display help for command

Programme modes:
  0   5day_2day   One schedule for weekdays, another for weekends (Default)
  1   7day        Different schedule for each day of the week
  2   24hour      Same schedule every day
  3   none        Non-Programmable - temperature control only
```



JavaScript Example
------------------

```
const {Client} = require('heatmiser-modbus')

// Create a new client with path to the serial port device
const client = new Client('/dev/ttyUSB0')

// Add a thermostat with Communications ID = 1
const thermostat = client.addThermostat(1)

// Connect to the serial port
client.connect()
  .then(() => {
    // Once connected, send a modbus command to set the temperature
    const target = 20.5
    console.log("Setting temperature to: ", target)
    return thermostat.setTargetTemperature(target)
  })
  .then(() => {
    // If successful
    console.log("Done.")
  })
  .catch((err) => {
    // If there was an error
    console.error('Error!', err)
  })
  .finally(() => {
    // Always close the serial port afterwards
    client.close()
  })
```


JavaScript API Overview
-----------------------

Methods on the `Client` class:

| Function              | Return type | Description                                       |
|-----------------------|-------------| --------------------------------------------------|
| `constructor (port: string)` |  | Creates a new Client with the specified serial port device |
| `addThermostat (id: number, name?: string)` | `Thermostat` | Add a thermostat to the client |
| `getThermostat (id: number)` | `Thermostat` | Get an thermostat object |
| `deleteThermostat (id: number)` | `void` | Deregister / delete a thermosta |
| `getThermostats ()` | `Thermostat[]` | Get an array of all the thermostats |
| `async readStatus (thermostat: Thermostat)` | `Promise<any>` | Read the status of a thermostat |
| `async readTemperatureUnits (id: number)` | `Promise<string>` | Get the temperature units (C/F) |
| `async connect ()` | `Promise<any>` | Start a connection to the modbus serial port |
| `close ()` | `void` | Close a connection to the modbus serial port |


Methods on the `Thermostat` class:

| Function              | Return type | Description                                       |
|-----------------------|-------------| --------------------------------------------------|
| `turnOn()` | `Promise<any>` | Turn On the thermostat |
| `turnOff()` | `Promise<any>` | Turn Off the thermostat |
| `holdMode (temperature: number, minutes: number)` | `Promise<any>` | Set thermostat to a temporary temperature of N minutes |
| `setProgrammePeriods (periods: number)` | `Promise<any>` | Configure the number of heating periods on the thermostat  |
| `setProgrammeMode (mode: number \| string)` | `Promise<any>` | Set the type of programme / schedule mode (0 / 1 / 2 / 3) |
| `setTargetTemperature (temperature: number)` | `Promise<any>` | Set the target room temperature |
| `setFrostProtectTemperature (temperature: number)` | `Promise<any>` | Set the frost protection temperature (7-17 °C) |
| `setSensorSelection (mode: number)` | `Promise<any>` | Set the sensor selection mode |
| `setFloorLimitTemperature (temperature: number)` | `Promise<any>` | Set the temperature limit for the floor sensor |
| `setSwitchingDifferential (temperature: number)` | `Promise<any>` | Set the thermostat switching differential (in °C) |
| `setOutputDelay (minutes: number)` | `Promise<any>` | Set time in minutes to delay output switching by |
| `setUpDownLimit (limit: number)` | `Promise<any>` | Set a limit on the use of the up and down keys |
| `setTemperatureUnits (units: string)` | `Promise<any>` | Set the temperature units used by the hermostat (C/F) |
| `setTime (time: Date = new Date())` | `Promise<any>` | Set the time. If no date is  given, use the current time. |
| `setAutoDST (enabled: boolean)` | `Promise<any>` | Enable/disable auto Daylight Saving Time mode |
| `setKeylock (pin: number \| null)` | `Promise<any>` | Set a PIN number for the therostat |
| `readFirmwareVersion ()` | `Promise<number>` | Get the firmware version number of the thermostat |
| `factoryReset ()` | `Promise<any>` | Perform a factory reset of the thermostat - warning this switches off Modbus |


Limitations
-----------

There are a number of limitations to the current version of this library, including:

- Turning frost mode on and off
- No support for setting or getting schedules
- Wireless Sensors are not tested
- Setting Holiday / Away Mode
- Optimum Start

These may be features that are added in the future.


License
-------

`node-heatmiser-modbus` is licensed under the terms of the MIT license.
See the file [LICENSE](/LICENSE.md) for details.

This software is independently written and maintained and is not supported by Heatmiser UK Limited.


Contact
-------

* Author:    Nicholas J Humfrey


[Heatmiser]:             https://www.heatmiser.com/
[Heatmiser Edge]:        https://www.heatmiser.com/en/modbus-thermostat-series/
[Heatmiser Touch-E v2]:  https://www.heatmiser.com/en/touchscreen-series/
