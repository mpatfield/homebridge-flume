import { AxiosResponse } from 'axios';

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

export type DeviceResponse = {
  data: DeviceData[];
};

export type DeviceData = {
  id: string;
  bridge_id: string;
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
