Heatmiser Edge Settings
=======================

These settings are described in the Heatmiser Edge Manual.


| Feature | Modbus Address | Description                | Setting                               |
| ------- | -------------- | -------------------------- | ------------------------------------- |
| 01      | 21             | Temperature Format         | 00=°C, 01=°F                          |
| 02      | 22             | Switching Differential     | 0.5°C, 1.0°C, 2.0°C, 3.0°C            |
| 03      | 23             | Output Delay               | 00 - 15 Minutes                       |
| 04      | 24             | Up/Down Temperature Limit  | 00° - 10°C                            |
| 05      | 25             | Sensor Selection           | 00 = Built in plus wireless sensor    |
| 06      | 26             | Floor Temperature Limit    | 20°C - 45°C (28°C Default)            |
| 07      | 27             | Optimum Start              | 00 = Disabled                         |
| 08      | 13             | Rate of Change             | Information Only                      |
| 09      | 29             | Programme Mode             | 00=5/2, 01=7 Day, 02=24 Hour, 03=None |
| 10      | 30             | Automatic DST Switching    | 00=Disabled, 01=Enabled               |
| 11      | 31             | Communications ID (Modbus) | 01-32, 00=Disabled                    |
| 12      | 28             | Programme Type             | 00=4 Periods (Default), 01=6 Periods  |


Sensor Selection
----------------

| Value | Description                                        |
| ----- | -------------------------------------------------- | 
| 00    | Built in Sensor with optional Remote Air (Default) |
| 01    | Remoter Air Only                                   |
| 02    | Floor Sensor Only                                  |
| 03    | Built in + Floor Sensor + optional Remote Air      |
| 04    | Remote Air & Floor Sensor Only                     |
