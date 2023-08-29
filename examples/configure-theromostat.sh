#!/bin/sh
#
# This shell script demonstrates how to configure
# a thermostat using the hmmb command line tool
#

export HMMB_DEVICE=/dev/ttyUSB0
export HMMB_ID=1

hmmb set-time
hmmb set-auto-dst on

hmmb set-units 'C'
hmmb set-switching-differential 1.0
hmmb set-output-delay 0
hmmb set-up-down-limit 0
hmmb set-floor-limit 28         # Maximum allowed temperature for the floor sensor
hmmb set-sensors 0              # 0 = Built in Sensor and optional Remote Air
hmmb set-programme-mode none    # Disable schedule/programme mode

hmmb get-status
