node-modbus-heatmiser
=====================

node.js library for controlling Heatmiser Modbus Thermostats


Command Line Tool
-----------------

```
Usage: hmmb [options] [command]

Tool for controlling Heatmiser Modbus Thermostats

Options:
  -V, --version           output the version number
  -d, --device <port>     The serial port device to connect to (eg /dev/ttyUSB0)
  -i, --id <num>          The Communications ID of the device to control (1-32) (default: 1)
  -h, --help              display help for command

Commands:
  get-status              Display thermostat status (including current temperatures)
  turn-on                 Turn on the thermostat
  turn-off                Turn off the thermostat
  set-temperature <temp>  Set the target room temperature
  set-units <units>       Set the temperature units used by the thermostat
  set-time                Sync the system clock to the thermostat
  set-keylock <pin>       Set a PIN to lock the keypad with
  factory-reset           Restore thermostat to the default factory settings
  help [command]          display help for command
```

