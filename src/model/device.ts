import { DeviceData, LeakData, UsageData } from './types';

const BATTERY_LEVEL_LOW = 'low';

export class Device {

  readonly id: string;
  readonly productName: string;

  isBatteryLow: boolean;
  isDisconnected: boolean;

  isLeakDetected: boolean = false;
  
  usageToday: number = 0;
  usageMonth: number = 0;
  usageLastMonth: number = 0;

  private _onUpdateCallback: ((id: string) => void) | null = null;

  constructor(data: DeviceData) {
    this.id = data.id;
    this.productName = data.product;
    this.isDisconnected = !data.connected;
    this.isBatteryLow = data.battery_level === BATTERY_LEVEL_LOW;
  }

  setOnUpdateCallback(callback: (serialNumber: string) => void): void {
    this._onUpdateCallback = callback;
  }

  update(deviceData: DeviceData | null, leakData: LeakData | null, usageData: UsageData | null) {

    if (deviceData) {
      this.isBatteryLow = deviceData.battery_level === BATTERY_LEVEL_LOW;
      this.isDisconnected = !deviceData.connected;
    }

    if (leakData) {
      this.isLeakDetected = leakData.active;
    }

    if (usageData) {
      this.usageToday = usageData.today[0]?.value || 0;
      this.usageMonth = usageData.month[0]?.value || 0;
      this.usageLastMonth = usageData.lastMonth[0]?.value || 0;
    }

    if (this._onUpdateCallback) {
      this._onUpdateCallback(this.id);
    }
  }
}