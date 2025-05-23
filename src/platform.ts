import fs from 'fs';
import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig } from 'homebridge';
import path from 'path';
import { fileURLToPath } from 'url';

import { FlumeAccessory } from './accessory.js';

import strings from './lang/en.js';

import { FlumeAPI } from './model/api.js';
import { PLATFORM_ALIAS } from './index.js';
import { Device } from './model/device.js';

const PLUGIN_NAME = 'homebridge-flume';

export class FlumePlatform implements DynamicPlatformPlugin {

  private isBeta: boolean = false;
  private flumeAPI: FlumeAPI | null = null;

  private readonly accessories: Map<string, PlatformAccessory> = new Map();

  constructor(
    readonly log: Logger,
    readonly config: PlatformConfig,
    readonly api: API,
  ) {

    const packageVersion = this.packageVersion;
    this.isBeta = this.packageVersion.includes('beta');

    this.log.info(
      'v%s | System %s | Node %s | HB v%s | HAPNodeJS v%s',
      packageVersion,
      process.platform,
      process.version,
      api.serverVersion,
      api.hap.HAPLibraryVersion(),
    );

    if (this.isBeta) {
      const divide = '*'.repeat(strings.beta.length);
      this.log.warn(`\n${divide}\n${strings.beta}\n${divide}`);
    }

    this.api.on('didFinishLaunching', () => this.didFinishLaunching());
    this.api.on('shutdown', () => this.shutdown());
  }

  async didFinishLaunching(): Promise<void> {

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
      this.log,
      this.isBeta,
    );

    const devices = this.flumeAPI.devices;
    if (devices.length === 0) {
      this.accessories.forEach((accessory) => this.removeAccessory(accessory));
      this.log.warn(strings.noDevices);
      this.shutdown();
      return;
    }

    devices.forEach((device) => {
      this.initializeDevice(device);
    });

    // Remove any stale accessories that don't appear in the device list
    this.accessories.forEach((accessory) => {
      const findID = accessory.context.deviceId;
      if (!devices.find((test) => findID === test.id)) {
        this.removeAccessory(accessory);
      }
    });

    const randIndex = Math.floor(Math.random() * strings.welcomeMessages.length);
    this.log.info(strings.complete, strings.welcomeMessages[randIndex]);
  }

  shutdown(): void {
    this.flumeAPI?.teardown();
  }

  initializeDevice(device: Device): void {

    const uuid = this.api.hap.uuid.generate(device.id);

    let accessory = this.accessories.get(uuid);
    if (accessory) {
      new FlumeAccessory(this, accessory, device);
      return;
    }

    this.log.info(strings.newDevice, device.id);

    accessory = new this.api.platformAccessory(strings.brand, uuid);
    accessory.context.deviceId = device.id;

    new FlumeAccessory(this, accessory, device);

    this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_ALIAS, [accessory]);
    this.accessories.set(uuid, accessory);
  }

  configureAccessory(accessory: PlatformAccessory): void {
    this.log.info(strings.restoringDevice, accessory.context.deviceId);
    this.accessories.set(accessory.UUID, accessory);
  }
  
  removeAccessory(accessory: PlatformAccessory): void {
    this.log.info(strings.removeDevice, accessory.context.deviceId);
    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_ALIAS, [accessory]);
    this.accessories.delete(accessory.UUID);
  }

  get packageVersion(): string {
    try {
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const packageJSONPath = path.join(__dirname, '../package.json');
      const packageJSON = JSON.parse(fs.readFileSync(packageJSONPath, { encoding: 'utf8' }));
      return packageJSON.version;
    } catch (error) {
      return '0.0.0'; 
    }
  }
}
