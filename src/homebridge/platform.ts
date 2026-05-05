import { API, DynamicPlatformPlugin, Logger, PlatformAccessory } from 'homebridge';

import { FlumeAccessory } from './accessory.js';
import { PLATFORM_ALIAS, PLUGIN_NAME, PROJECT_HOMEPAGE } from './settings.js';

import { setLanguage, strings } from '../i18n/i18n.js';

import { FlumeAPI } from '../model/api.js';
import { Device } from '../model/device.js';
import { FlumeConfig, VolumeUnits } from '../model/types.js';

import getVersion from '../tools/version.js';

export class FlumePlatform implements DynamicPlatformPlugin {

  private flumeAPI?: FlumeAPI;

  private readonly accessories: Map<string, PlatformAccessory> = new Map();

  constructor(
    readonly log: Logger,
    readonly config: FlumeConfig,
    readonly api: API,
  ) {

    setLanguage(api.user.configPath());

    this.logIfVerbose(
      'v%s | %s | Node %s | HB v%s | HAP v%s',
      getVersion(),
      process.platform,
      process.version,
      api.serverVersion,
      api.hap.HAPLibraryVersion(),
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
      this.config,
      this.api.user.persistPath(),
      this.log,
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

    const name = this.flumeAPI?.locationNames.get(device.locationId) ?? strings.general.brand;

    let accessory = this.accessories.get(device.id);
    if (!accessory) {

      this.log.info('%s %s [%s]', strings.startup.newDevice, name, device.id);

      const uuid = this.api.hap.uuid.generate(device.id);

      accessory = new this.api.platformAccessory(name, uuid);
      accessory.context.deviceId = device.id;

      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_ALIAS, [accessory]);
      this.accessories.set(device.id, accessory);
    }

    if (name !== accessory.displayName) {
      accessory.updateDisplayName(name);
    }

    const units = this.config.units ?? VolumeUnits.GALLONS;
    new FlumeAccessory(this, accessory, device,  name, units, this.config.disableDeviceLogging);
  }

  configureAccessory(accessory: PlatformAccessory): void {
    this.logIfVerbose(strings.startup.restoringDevice, accessory.displayName);
    this.accessories.set(accessory.context.deviceId, accessory);
  }
  
  private removeAccessory(accessory: PlatformAccessory): void {
    this.log.info(strings.startup.removeDevice, accessory.displayName);
    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_ALIAS, [accessory]);
    this.accessories.delete(accessory.context.deviceId);
  }

  private logIfVerbose(message: string, ...parameters: string[]) {
  
    if (!this.config.verbose) {
      return;
    }

    this.log.info(message, ...parameters);
  }  
}
