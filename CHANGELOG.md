# Change Log

All notable changes to homebridge-flume will be documented in this file.

## 3.1.21 (2026-05-30)

### Changed
- Updated dependencies

### Notes
Please consider giving this plugin a ⭐️ on [GitHub](https://github.com/mpatfield/homebridge-flume) if you're finding it useful!

## 3.1.20 (2026-05-12)

### Fixed
- Potential translation system crash

### Notes
Would you like to see Homebridge Flume in your language? Please consider [getting involved](https://github.com/mpatfield/homebridge-flume/issues/107). No coding experience required!

## 3.1.19 (2026-05-06)

### Changed
- Removed `beta` from `homebridge` dependency
- Reduced noisy startup logging
- Updated dependencies

## 3.1.18 (2026-04-21)

### Changed
- Updated dependencies

## 3.1.17 (2026-03-30)

### Changed
- Updated and cleaned up unnecessary dependencies
- npm audit fix

## 3.1.16 (2026-03-24)

### Changed
- Updated dependencies and fixed npm audit vulnerabilities

## 3.1.15 (2026-03-04)

### Changed
- Reworked translation system for easier maintenance — please [open a ticket](https://github.com/mpatfield/homebridge-flume/issues/new/choose) if you have issues
- Updated dependencies

## 3.1.14 (2026-02-04)

### Changed
- Updated dependencies

## 3.1.13 (2026-01-20)

### Fixed
- Checkboxes in config UI not reflecting correct state in ([#223](https://github.com/mpatfield/homebridge-flume/issues/223))

### Changed
- Updated dependencies

## 3.1.12 (2025-12-06)

### Added
- Traducciones al español. ¡Gracias, [@dcompane](https://github.com/sponsors/dcompane)!

### Changed
- Updated dependencies

## 3.1.11 (2025-11-14)

### Changed
- Updated dependencies

## 3.1.10 (2025-10-30)

### Changed
- ⚠️ Dropped [official support](https://github.com/homebridge/homebridge/wiki/How-To-Update-Node.js) for Node.js v18 and added Node.js v24
- Updated dependencies

## 3.1.9 (2025-10-21)

### Changed
- Updated dependencies

## 3.1.8 (2025-09-24)

### Changed
- Use location name when logging state changes
- Updated dependencies

### Notes
Would you like to see Homebridge Flume in your language? Please consider [getting involved](https://github.com/mpatfield/homebridge-flume/issues/107). No coding experience required!

## 3.1.7 (2025-08-11)

### Fixed
- Broken header image in config UI

### Changed
- Updated dependencies

## 3.1.6 (2025-07-29)

### Changed
- Behavior of `useNotifications` option has changed slightly to use only notifications as indications of leaks 
  - Setting name has changed to "Use Unread Usage Notifications" in the config UI
- Updated dependencies

## 3.1.5 (2025-07-24)

### Fixed
- Try full authentication when refresh fails ([#128](https://github.com/mpatfield/homebridge-flume/issues/128))

### Changed
- Reverted to using `leaks/active` api for leak detection ([#129](https://github.com/mpatfield/homebridge-flume/issues/129))
- Updated dependencies

### Added
- Added `useNotifications` config option to include custom usage alerts in leak detection

## 3.1.4 (2025-07-16)

### Fixed
- Incorrectly logging an error when there are no notifications

### Changed
- Updated developer dependencies

## 3.1.3 (2025-07-14)

### Added
- Deutsche Übersetzungen – Danke, [@LexifOder](https://github.com/sponsors/LexifOder)!

### Fixed
- Config UI in dark mode

### Changed
- Use unread notifications as indication of leaks, low battery, or connection issues
- Updated dependencies
- Force cache miss for ui.js in config UI for each version update

## 3.1.2 (2025-06-22)

### Changed
- Dynamic translations
- Use node-persist for auth token caching

## 3.1.1 (2025-06-02)

### Added
- Fetch device name from Flume locations api

### Changed
- Updated dependencies

## 3.1.0 (2025-05-28)

### Added
- Devices can now be excluded from HomeKit by adding device IDs in config
- Fetch device name from Flume location information
- Volume units for usage data can be changed in config

### Changed
- Persist tokens across launches to avoid unnecessary authentication calls
- Limit the number of http retries with exponential backoff
- Beta versions no longer log unless "verbose" config flag is set to true
- Simplified config settings
- Redact all personal info in logs

### Fixed
- `disableDeviceLogging` actually stops logging accessory changes

## 3.0.5 (2025-05-24)

### Changed
- While there are no new features, this release is a major rewrite to cleanup and modernize a lot of very old code. This will make it much easier to maintain and improve this plugin going forward.

## 3.0.4 (2025-05-19)
- Updating README and other metadata to reflect new plugin ownership
- Getting plugin ready for Homebridge v2

## 3.0.3 (2024-07-23)
- Maintenance release

## 3.0.2 (2023-03-24)

### Fixed
- Debug logging

## 3.0.1 (2023-03-11)

### Fixed
- Put `getLeakInfo()` into debug logging

## 3.0.0 (2023-03-11)

### Breaking
- Remove official support for Node 14
- Remove option to disable plugin - this is now available in the Homebridge UI
- Remove option for debug logging - this will be enabled when using a beta version of the plugin

### Added
- Support for shared devices (thanks [@ssmoss](https://github.com/ssmoss)!)

### Changed
- Fix a potential login issue that might be terminating the process incorrectly
- Bump `node` recommended versions to v16.19.1 or v18.15.0

## 2.0.9 (2023-01-07)

### Changed
- Bump `axios` to v1.2.2
- Bump `homebridge` recommended version to v1.6.0 or v2.0.0-beta
- Bump `node` recommended versions to v14.21.2 or v16.19.0 or v18.13.0

## 2.0.8 (2022-10-16)

### Changed
- Requests for device info will occur less often, meaning requests for leak info can occur more frequently
  - Minimum refresh interval reduced to 1 minute
- Bump `node` recommended versions to v14.20.1 or v16.18.0 or v18.11.0
- Updated `axios` to v1.1.3

## 2.0.7 (2022-09-25)

### Changed
- Bump `node` recommended versions to v14.20.1 or v16.17.1
- Updated dev dependencies

## 2.0.6 (2022-08-23)

### Changed
- Bump `node` recommended versions to v14.20.0 or v16.17.0
- Bump `homebridge` recommended version to v1.5.0

## 2.0.5 (2022-06-26)

### Changed
- Updated dependencies

## 2.0.4 (2022-06-21)

### Changed
- Bump `node` recommended versions to v14.19.3 or v16.15.1

## 2.0.3 (2022-05-28)

### Changed
- More fixes and refactoring

## 2.0.2 (2022-05-28)

### Changed
- Bump `node` recommended versions to v14.19.3 or v16.15.0
- Updated dependencies

## 2.0.1 (2022-04-30)

### Changed
- Bump `axios` to v0.27.2
- Bump `node` recommended versions to v14.19.1 or v16.15.0

## 2.0.0 (2022-04-23)

### Potentially Breaking Changes

⚠️ The minimum required version of Homebridge is now v1.4.0
⚠️ The minimum required version of Node is now v14

### Changed
- Changed to ESM package

## 1.2.7 (2022-04-03)

### Changed
- Bump `axios` to v0.26.1
- Updated dependencies

## 1.2.6 (2022-02-27)

### Changed
- Bump `axios` to v0.26.0
- Bump `node` recommended versions to v14.19.0 or v16.14.0

## 1.2.5 (2022-01-24)

### Changed
- Bump `homebridge` recommended version to v1.4.0
- Bump `axios` to v0.25.0

## 1.2.4 (2022-01-13)

### Changed
- Bump `node` recommended versions to v14.18.3 or v16.13.2

### Fixed
- Plugin crash for older versions of Homebridge

## 1.2.3 (2022-01-03)

### Changed
- HOOBS certified badge on README
- Plugin will log HAPNodeJS version on startup
- Bump `homebridge` recommended version to v1.3.9

## 1.2.2 (2021-12-21)

### Changed
- Some config options rearranged for easier access

## 1.2.1 (2021-12-08)

### Changed
- Bump `homebridge` recommended version to v1.3.8
- Bump `node` recommended versions to v14.18.2 or v16.13.1

## 1.2.0 (2021-12-01)

### Added
- Previous month usage custom characteristic (viewable in HomeKit apps like Eve)

## 1.1.0 (2021-11-30)

### Added
- Daily and monthly usage custom characteristics (viewable in HomeKit apps like Eve)

### Removed
- `threshold` configuration option as unused

## 1.0.0 (2021-11-29)

### Added
- Plugin logo

## 0.7.0 (2021-11-24)

### Added
- `StatusFault` and `StatusLowBattery` characteristics to the `LeakSensor` service

## 0.6.0 (2021-11-24)

### Added
- Leak sensor service

### Changed
- Minimum refresh interval increased to two minutes

## 0.5.0 (2021-11-23)

### Added
- Make use of the debug logging option for HTTP responses

### Changed
- `client_id` and `client_secret` config options changed to `clientId` and `clientSecret` for consistency

## 0.4.0 (2021-11-23)

### Added
- The plugin will remove 'stale' accessories that don't appear in the obtained device list

## 0.3.1 (2021-11-23)

### Fixed
- Some logging references to Thermobit rather than Flume

## 0.3.0 (2021-11-22)

Changed some configuration options

## 0.2.0 (2021-11-22)

Converted from accessory plugin to platform plugin

## 0.1.0 (2021-11-22)

Initial release
