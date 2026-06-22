import { AxiosResponse } from 'axios';
import { PlatformConfig } from 'homebridge';

export const SENSITIVE_KEYS = ['access_token', 'address', 'address_2', 'bridge_id', 'id', 'refresh_token', 'user_id'];

export enum VolumeUnits {
  GALLONS = 'GALLONS',
  LITERS = 'LITERS',
  CUBIC_FEET = 'CUBIC_FEET',
  CUBIC_METERS = 'CUBIC_METERS',
}

export enum NotificationType {
  USAGE_ALERT = 1,
  BUDGET = 2,
  GENERAL = 4,
  HEARTBEAT = 8,
  BATTERY = 16,
}

export interface FlumeResponse<T> extends AxiosResponse {
  data: T[];
}

export enum SensorType {
  ContactSensor = 'ContactSensor',
  LeakSensor = 'LeakSensor',
  MotionSensor = 'MotionSensor',
  OccupancySensor = 'OccupancySensor',
}

export enum CharacteristicType {
  ContactDetected = 'ContactSensorState',
  LeakDetected = 'LeakDetected',
  MotionDetected = 'MotionDetected',
  OccupancyDetected = 'OccupancyDetected',
}

export type FlumeConfig = PlatformConfig & {
  username: string,
  password: string,
  clientId: string,
  clientSecret: string,
  refreshInterval: number,
  useNotifications: boolean,
  units?: VolumeUnits,
  excludeDevices?: string[],
  disableDeviceLogging: boolean,
  verbose: boolean,
}

export type TokenData = {
  token_type: string;
  access_token: string;
  expires_in: number;
  refresh_token: string;
};

export type LocationData = {
  id: string;
  name: string;
}

export type NotificationData = {
  type: NotificationType,
  read: boolean,
}

export type DeviceData = {
  id: string;
  bridge_id: string;
  location_id: string;
  product: string;
  battery_level: string;
  connected: boolean;
};

export type LeakData = {
  active: boolean;
};

export type UsageData = {
  today: {value: number}[];
  month: {value: number}[];
  lastMonth: {value: number}[];
};

export type JwtPayload = {
  user_id: string;
};
