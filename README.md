<p align="center">
<img src="https://raw.githubusercontent.com/mpatfield/homebridge-flume/refs/heads/latest/img/banner.png" width="600">
</p>

<span align="center">

# homebridge-flume

Homebridge plugin to integrate Flume devices into Apple HomeKit

[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)
[![hoobs-certified](https://badgen.net/badge/HOOBS/certified/yellow)](https://plugins.hoobs.org/plugin/homebridge-flume)\
[![npm](https://img.shields.io/npm/dw/homebridge-flume)](https://www.npmjs.com/package/homebridge-flume)
[![npm](https://img.shields.io/npm/dt/homebridge-flume)](https://www.npmjs.com/package/homebridge-flume)\
[![Discord](https://img.shields.io/discord/432663330281226270?color=728ED5&logo=discord&label=discord)](https://discord.com/channels/432663330281226270/1406799028565311518)

</span>

## Disclaimer

This plugin is independently developed and is not in any way affiliated with or endorsed by Flume. Any issues or damage resulting from use of this plugin are not the fault of the developer. Use at your own risk.

## What does this plugin do?

Once you have completed [Configuration](https://github.com/mpatfield/homebridge-flume#configuration) you will see a new leak sensor pop up in your Home app. If the sensor detetcs a leak, you will receive a HomeKit notification and can setup automations to react to state changes.

<img src="https://raw.githubusercontent.com/mpatfield/homebridge-flume/refs/heads/latest/img/screenshot_1.png"> <img src="https://raw.githubusercontent.com/mpatfield/homebridge-flume/refs/heads/latest/img/screenshot_2.png">

If you use a more advanced HomeKit app like [Eve](https://apps.apple.com/us/app/eve-for-matter-homekit/id917695792) or [Controller for Homekit](https://apps.apple.com/us/app/controller-for-homekit/id1198176727), you will see some additional information about your water use. Unfortunately, Apple currently doesn't offer a way to display this in the Home app.

<img src="https://raw.githubusercontent.com/mpatfield/homebridge-flume/refs/heads/latest/img/screenshot_3.png">

## Configuration

You'll need to get your API Access Client ID and Client Secret from the [Flume portal](https://portal.flumetech.com).

[This guide](https://flumetech.readme.io/reference/accessing-the-api) provides step-by-step instructions.

Using the Homebridge Config UI is the easiest way to set up this plugin. However, if you wish to do things manually then you will need to add the following to your Homebridge `config.json`:

```json
{
  "name": "Flume",
  "platform": "Flume",
  "username": "[username]",
  "password": "[password]",
  "clientId": "1234567890ABCD",
  "clientSecret": "1234567890ABCDEFGHIJ",
  "refreshInterval": 1,
  "units": "GALLONS",
  "disableDeviceLogging": false,
  "verbose": false,
  "excludeDevices": ["1234567890", "9876543210"]
}
```

- `username` - (Required) Flume username
- `password` - (Required) Flume password
- `clientId`/`clientSecret` - (Required) Flume Client ID, found at [https://portal.flumetech.com](https://portal.flumetech.com)
- `refreshInterval` - (Required) number of minutes between updates; must be `1` or more
- `useNotifications` - (Optional) if true, an unread usage alert notification will be considered a leak
  - To clear leaks, mark notifications as `read` in the Flume app.
- `units` - (Required) the type of units to use for custom characteristics
- `disableDeviceLogging` - (Optional) if true, then accessory status changes will not be logged
- `verbose` - (Optional) if true, there will be additional logging for debugging purposes
- `excludeDevices` - (Optional) a list of devices to exclude; look for `Adding new device: [Device ID]` in the logs

## Credits

[@LexifOder](https://github.com/sponsors/LexifOder) for German translations

[Keryan Belahcene](https://www.instagram.com/keryan.me) for creating the [Flume](https://github.com/homebridge-plugins/homebridge-flume) header logo

[@bwp91](https://github.com/sponsors/bwp91) for creating and maintaining this plugin for years despite not even owning a Flume device

@weallknowwhoisatfaulthere for earlier work done [homebridge-flume-water-sensor](https://www.npmjs.com/package/homebridge-flume-water-sensor)

And to the amazing creators/contributors of [Homebridge](https://homebridge.io) who made this plugin possible!