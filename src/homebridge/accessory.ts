import { Characteristic, Formats, HAP, LogLevel, Perms, PlatformAccessory, Service } from 'homebridge';

import { FlumePlatform } from './platform.js';

import { strings } from '../i18n/i18n.js';

import { Device } from '../model/device.js';
import { VolumeUnits } from '../model/types.js';

import getVersion from '../tools/version.js';

class CustomCharacteristic {
  constructor(readonly uuid: string, readonly name: string) {
  }
}

const TODAY_USAGE = new CustomCharacteristic('f25cc272-83cb-46a7-915a-259fa17364ed', strings.customChar.todayUsage);
const MONTH_USAGE = new CustomCharacteristic('580e224d-edf2-4c23-af79-cdbebfc509c5', strings.customChar.monthUsage);
const LAST_MONTH_USAGE = new CustomCharacteristic('69129d54-bdb8-46a1-a93b-f7e8d16d32a8', strings.customChar.lastMonth);

export class FlumeAccessory {
  private readonly HAP: HAP;
  private readonly Characteristic: typeof Characteristic;
  private readonly Service: typeof Service;

  private readonly leakService: Service;

  private isLeakDetected: boolean = false;
  private isBatteryLow: boolean = false;
  private isDisconnected: boolean = true;

  private readonly charLeakDetected: typeof Characteristic.LeakDetected;
  private readonly charStatusLowBattery: typeof Characteristic.StatusLowBattery;
  private readonly charStatusFault: typeof Characteristic.StatusFault;

  private readonly todayUsageChar: Characteristic;
  private readonly monthUsageChar: Characteristic;
  private readonly lastMonthUsageChar: Characteristic;

  constructor(
    private readonly platform: FlumePlatform, 
    private readonly accessory: PlatformAccessory,
    private readonly device: Device,
    private readonly name: string | null | undefined,
    private readonly units: VolumeUnits,
    private readonly disableLogging: boolean,
  ) {

    this.HAP = platform.api.hap;
    this.Characteristic = this.HAP.Characteristic;
    this.Service = this.HAP.Service;

    accessory.getService(this.Service.AccessoryInformation)!
      .setCharacteristic(this.Characteristic.Name, name ?? strings.general.brand)
      .setCharacteristic(this.Characteristic.ConfiguredName, name ?? strings.general.brand)
      .setCharacteristic(this.Characteristic.Manufacturer, strings.general.brand)
      .setCharacteristic(this.Characteristic.SerialNumber, device.id)
      .setCharacteristic(this.Characteristic.Model, device.productName)
      .setCharacteristic(this.Characteristic.FirmwareRevision, getVersion());

    this.charLeakDetected = this.Characteristic.LeakDetected;
    this.charStatusLowBattery = this.Characteristic.StatusLowBattery;
    this.charStatusFault = this.Characteristic.StatusFault;

    this.leakService = this.accessory.getService(this.HAP.Service.LeakSensor)
      || this.accessory.addService(this.HAP.Service.LeakSensor);

    this.isLeakDetected = this.leakService.getCharacteristic(this.charLeakDetected).value === this.charLeakDetected.LEAK_DETECTED;
    this.isBatteryLow = this.leakService.getCharacteristic(this.charStatusLowBattery).value === this.charStatusLowBattery.BATTERY_LEVEL_LOW;
    this.isDisconnected = this.leakService.getCharacteristic(this.charStatusFault).value === this.charStatusFault.GENERAL_FAULT;

    this.clearCustomCharacteristics();

    this.todayUsageChar = this.attachCustomCharacteristic(TODAY_USAGE);
    this.monthUsageChar = this.attachCustomCharacteristic(MONTH_USAGE);
    this.lastMonthUsageChar = this.attachCustomCharacteristic(LAST_MONTH_USAGE);

    device.setOnUpdateCallback(this.handleUpdate.bind(this));

    this.updateCharacteristics();
  }

  private handleUpdate(id: string): void {
    if (id === this.device.id) {
      this.updateCharacteristics();
    }
  }

  private updateCharacteristics(): void {

    if (this.device.isLeakDetected !== this.isLeakDetected) {
      this.isLeakDetected = this.device.isLeakDetected;
      const value = this.isLeakDetected ? this.charLeakDetected.LEAK_DETECTED : this.charLeakDetected.LEAK_NOT_DETECTED;
      this.leakService.updateCharacteristic(this.charLeakDetected, value);
      this.logState(this.isLeakDetected ? LogLevel.ERROR : LogLevel.INFO, this.isLeakDetected ? strings.status.leakDetected : strings.status.leakNotDetected);
    }

    if (this.device.isBatteryLow !== this.isBatteryLow) {
      this.isBatteryLow = this.device.isBatteryLow;
      const value  = this.isBatteryLow ? this.charStatusLowBattery.BATTERY_LEVEL_LOW : this.charStatusLowBattery.BATTERY_LEVEL_NORMAL;
      this.leakService.updateCharacteristic(this.charStatusLowBattery, value);
      this.logState(this.isBatteryLow ? LogLevel.WARN : LogLevel.INFO, this.isBatteryLow ? strings.status.batteryLow : strings.status.batteryNormal);
    }

    if (this.device.isDisconnected !== this.isDisconnected) {
      this.isDisconnected = this.device.isDisconnected;
      const value = this.isDisconnected ? this.charStatusFault.GENERAL_FAULT : this.charStatusFault.NO_FAULT;
      this.leakService.updateCharacteristic(this.charStatusFault, value);
      this.logState(this.isDisconnected ? LogLevel.WARN : LogLevel.INFO,
        this.isDisconnected ? strings.status.connectionFault : strings.status.connectionNormal);
    }

    this.todayUsageChar.updateValue(this.device.usageToday);
    this.monthUsageChar.updateValue(this.device.usageMonth);
    this.lastMonthUsageChar.updateValue(this.device.usageLastMonth);
  }

  private stringForUnits(): string {
    switch(this.units) {
    case VolumeUnits.GALLONS: return strings.config.enumNames.gallons;
    case VolumeUnits.LITERS: return strings.config.enumNames.liters;
    case VolumeUnits.CUBIC_FEET: return strings.config.enumNames.cubicFeet;
    case VolumeUnits.CUBIC_METERS: return strings.config.enumNames.cubicMeters;
    }
  }

  private clearCustomCharacteristics() {

    const allowedUUIDs = new Set([
      this.charLeakDetected.UUID,
      this.charStatusLowBattery.UUID,
      this.charStatusFault.UUID,
    ]);

    const charsToRemove = this.leakService.characteristics.filter(char => !allowedUUIDs.has(char.UUID));
    charsToRemove.forEach(char => {
      this.leakService.removeCharacteristic(char);
    });
  }

  private attachCustomCharacteristic(char: CustomCharacteristic): Characteristic {
    let result: Characteristic;

    if (this.leakService.testCharacteristic(char.name)) {
      result = this.leakService.getCharacteristic(char.name)!;
    } else {

      const unitsString = this.stringForUnits();
      const customCharacteristic = class TodayUsage extends this.Characteristic {
        constructor() {
          super(char.name, char.uuid, {
            format: Formats.UINT32,
            perms: [ Perms.PAIRED_READ, Perms.NOTIFY ],
            unit: unitsString,
          });
          this.value = this.getDefaultValue();
        }
      };
      result = this.leakService.addCharacteristic(customCharacteristic);
      result.UUID = char.uuid;
    }

    return result;
  }

  private logState(level: LogLevel, message: string) {

    if (this.disableLogging) {
      return;
    }

    if (this.name) {
      this.platform.log.log(level, '[%s] %s', this.name, message);
    } else {
      this.platform.log.log(level, message);
    }
  }
}
