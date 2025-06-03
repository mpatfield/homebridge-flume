import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig } from 'homebridge';
import path from 'path';

import { FlumeAccessory } from './accessory.js';

import strings from '../lang/en.js';

import { FlumeAPI } from '../model/api.js';
import { Device } from '../model/device.js';

import { STORAGE_FILE_NAME } from '../tools/storage.js';
import { VolumeUnits } from '../model/types.js';
import getVersion from '../tools/version.js';

export const PLATFORM_ALIAS = 'Flume';
const PLUGIN_NAME = 'homebridge-flume';

export class FlumePlatform implements DynamicPlatformPlugin {

  private readonly storagePath: string;
  private flumeAPI: FlumeAPI | null = null;

  private readonly accessories: Map<string, PlatformAccessory> = new Map();

  constructor(
    readonly log: Logger,
    readonly config: PlatformConfig,
    readonly api: API,
  ) {

    this.storagePath = path.join(api.user.storagePath(), STORAGE_FILE_NAME);

    this.log.info(
      'v%s | System %s | Node %s | HB v%s | HAPNodeJS v%s',
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
      this.log.error(strings.badConfig);
      return;
    }

    this.flumeAPI = await FlumeAPI.connect(
      this.config.username,
      this.config.password,
      this.config.clientId,
      this.config.clientSecret,
      this.config.refreshInterval,
      this.config.units ?? VolumeUnits.GALLONS,
      this.storagePath,
      this.log,
      this.config.verbose,
    );

    const keepDevices = new Set<string>();
    const excludeDevices = new Set(this.config.excludeDevices ?? []);
    const devices = this.flumeAPI.devices.filter((device: Device) => !excludeDevices.has(device.id));
    if (devices.length === 0) {
      this.accessories.forEach((accessory) => this.removeAccessory(accessory));
      this.log.warn(strings.noDevices);
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

    const randIndex = Math.floor(Math.random() * strings.welcomeMessages.length);
    this.log.info(strings.complete, strings.welcomeMessages[randIndex]);
  }

  private shutdown(): void {
    this.flumeAPI?.teardown();
  }

  private initializeAccessory(device: Device): void {

    const uuid = this.api.hap.uuid.generate(device.id);
    const name = this.flumeAPI?.locationNames.get(device.locationId);

    let accessory = this.accessories.get(uuid);
    if (!accessory) {
      this.log.info(strings.newDevice, name ?? device.id);

      accessory = new this.api.platformAccessory(strings.brand, uuid);
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
    this.log.info(strings.restoringDevice, accessory.context.deviceName ?? accessory.context.deviceId);
    this.accessories.set(accessory.UUID, accessory);
  }
  
  private removeAccessory(accessory: PlatformAccessory): void {
    this.log.info(strings.removeDevice, accessory.context.deviceName ?? accessory.context.deviceId);
    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_ALIAS, [accessory]);
    this.accessories.delete(accessory.UUID);
  }
}
