#!/bin/sh
#
# This shell script demonstrates how to configure
# a thermostat using the hmmb command line tool
#

export HMMB_DEVICE=/dev/ttyUSB0
export HMMB_ID=1

hmmb set-time                        # Synchronise the system clock to the thermostat
hmmb set-auto-dst on                 # Enable switching to/from DST automatically

hmmb set-units 'C'                   # Set the temperature units to Celsius
hmmb set-switching-differential 1.0  # Set the switching to 1°C
hmmb set-output-delay 0              # Disable the output delay
hmmb set-up-down-limit 0             # Disable up-down temperature buttons limit
hmmb set-floor-limit 28              # Maximum allowed temperature for the floor sensor
hmmb set-sensors 0                   # 0 = Built in Sensor and optional Remote Air
hmmb set-programme-mode none         # Disable schedule/programme mode

hmmb get-status
