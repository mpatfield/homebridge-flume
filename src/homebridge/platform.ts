import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig } from 'homebridge';

import { FlumeAccessory } from './accessory.js';
import { PLATFORM_ALIAS, PLUGIN_NAME, PROJECT_HOMEPAGE } from './settings.js';

import { setLanguage, strings } from '../i18n/i18n.js';

import { FlumeAPI } from '../model/api.js';
import { Device } from '../model/device.js';
import { VolumeUnits } from '../model/types.js';

import getVersion from '../tools/version.js';

export class FlumePlatform implements DynamicPlatformPlugin {

  private flumeAPI: FlumeAPI | null = null;

  private readonly accessories: Map<string, PlatformAccessory> = new Map();

  constructor(
    readonly log: Logger,
    readonly config: PlatformConfig,
    readonly api: API,
  ) {

    const userLang = Intl.DateTimeFormat().resolvedOptions().locale.split('-')[0];
    setLanguage(userLang);

    this.log.info(
      'v%s | %s | Node %s | HB v%s | HAP v%s | Lang %s',
      getVersion(),
      process.platform,
      process.version,
      api.serverVersion,
      api.hap.HAPLibraryVersion(),
      userLang,
    );

    this.api.on('didFinishLaunching', () => this.didFinishLaunching());
    this.api.on('shutdown', () => this.shutdown());
  }

  private async didFinishLaunching(): Promise<void> {

    if (
      !this.config.username ||
      !this.config.password ||
      !this.config.clientId ||
      !this.config.clientSecret ||
      !this.config.refreshInterval
    ) {
      this.log.error(strings.errors.badConfig, PROJECT_HOMEPAGE);
      return;
    }

    this.flumeAPI = await FlumeAPI.connect(
      this.config.username,
      this.config.password,
      this.config.clientId,
      this.config.clientSecret,
      this.config.refreshInterval,
      this.config.units ?? VolumeUnits.GALLONS,
      this.api.user.persistPath(),
      this.log,
      this.config.verbose,
    );

    const keepDevices = new Set<string>();
    const excludeDevices = new Set(this.config.excludeDevices ?? []);
    const devices = this.flumeAPI.devices.filter((device: Device) => !excludeDevices.has(device.id));
    if (devices.length === 0) {
      this.accessories.forEach((accessory) => this.removeAccessory(accessory));
      this.log.warn(strings.errors.noDevices);
      this.shutdown();
      return;
    }

    devices.forEach((device) => {
      keepDevices.add(device.id);
      this.initializeAccessory(device);
    });

    this.accessories.forEach((accessory) => {
      if (!keepDevices.has(accessory.context.deviceId)) {
        this.removeAccessory(accessory);
      }
    });

    const randIndex = Math.floor(Math.random() * strings.startup.welcome.length);
    this.log.info(strings.startup.complete, strings.startup.welcome[randIndex]);
  }

  private shutdown(): void {
    this.flumeAPI?.teardown();
  }

  private initializeAccessory(device: Device): void {

    const uuid = this.api.hap.uuid.generate(device.id);
    const name = this.flumeAPI?.locationNames.get(device.locationId);

    let accessory = this.accessories.get(uuid);
    if (!accessory) {

      if (name) {
        this.log.info('%s %s [%s]', strings.startup.newDevice, name, device.id);
      } else {
        this.log.info('%s [%s]', strings.startup.newDevice, device.id);
      }

      accessory = new this.api.platformAccessory(strings.general.brand, uuid);
      accessory.context.deviceId = device.id;
      accessory.context.deviceName = name;

      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_ALIAS, [accessory]);
      this.accessories.set(uuid, accessory);
    
    } else if (!accessory.context.deviceName) {
      accessory.context.deviceName = name;
      this.api.updatePlatformAccessories([accessory]);
    }

    const units = this.config.units ?? VolumeUnits.GALLONS;
    new FlumeAccessory(this, accessory, device,  name, units, this.config.disableDeviceLogging);
  }

  configureAccessory(accessory: PlatformAccessory): void {
    this.log.info(strings.startup.restoringDevice, accessory.context.deviceName ?? accessory.context.deviceId);
    this.accessories.set(accessory.UUID, accessory);
  }
  
  private removeAccessory(accessory: PlatformAccessory): void {
    this.log.info(strings.startup.removeDevice, accessory.context.deviceName ?? accessory.context.deviceId);
    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_ALIAS, [accessory]);
    this.accessories.delete(accessory.UUID);
  }
}
