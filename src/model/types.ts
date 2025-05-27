import { AxiosResponse } from 'axios';

export const SENSITIVE_KEYS = ['access_token', 'address', 'address_2', 'bridge_id', 'id', 'refresh_token', 'user_id'];

export enum VolumeUnits {
  GALLONS = 'GALLONS',
  LITERS = 'LITERS',
  CUBIC_FEET = 'CUBIC_FEET',
  CUBIC_METERS = 'CUBIC_METERS',
}

export interface FlumeResponse<T> extends AxiosResponse {
  data: T[];
}

export type TokenResponse = {
  data: TokenData[];
};

export type TokenData = {
  token_type: string;
  access_token: string;
  expires_in: number;
  refresh_token: string;
};

export type LocationsResponse = {
  data: LocationData[];
}

export type LocationData = {
  id: string;
  name: string;
}

export type DeviceResponse = {
  data: DeviceData[];
};

export type DeviceData = {
  id: string;
  bridge_id: string;
  location_id: string;
  product: string;
  battery_level: string;
  connected: boolean;
};

export type LeakResponse = {
  data: LeakData[];
}

export type LeakData = {
  active: boolean;
};

export type UsageResponse = {
  data: UsageData[];
}

export type UsageData = {
  today: {value: number}[];
  month: {value: number}[];
  lastMonth: {value: number}[];
};

export type JwtPayload = {
  user_id: string;
};
