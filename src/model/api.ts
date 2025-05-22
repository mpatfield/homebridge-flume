import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Logger, LogLevel } from 'homebridge';

import { Auth } from './auth.js';
import { Device } from './device.js';
import * as Types from './types.js';

import { MINUTE, SECOND } from '../utils.js';
import strings from '../lang/en.js';
import { FlumeResponse } from './types.js';

const URL_AUTH = 'https://api.flumetech.com/oauth/token';
const URL_GET_DEVICES = 'https://api.flumetech.com/users/%s/devices?list_shared=true';
const URL_GET_DEVICE = 'https://api.flumetech.com/users/%s/devices/%s';
const URL_WATER_USAGE = 'https://api.flumetech.com/users/%s/devices/%s/query';
const URL_LEAK_INFO = 'https://api.flumetech.com/users/%s/devices/%s/leaks/active';

const HTTP_TIMEOUT = 10 * SECOND;

const HTTP_RETRY_CODES = ['ENOTFOUND', 'ETIMEDOUT', 'EAI_AGAIN', 'ECONNABORTED'];

const FULL_REFRESH_INTERVAL = 15 * MINUTE;

const RETRY_INTERVAL = 30 * SECOND;

export class FlumeAPI {
  private auth?: Auth;
  private userId?: string;

  private readonly _devices: Map<string, Device> = new Map();

  private syncTimer: NodeJS.Timeout | null = null;
  private lastFullRefresh: number = 0;

  private constructor(
    private readonly username: string,
    private readonly password: string,
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly refreshInterval: number,
    private readonly log: Logger,
    private readonly isBeta: boolean,
  ) {
  }

  static async login(
    username: string,
    password: string,
    clientId: string,
    clientSecret: string,
    refreshInterval: number,
    log: Logger,
    isBeta: boolean,
  ): Promise<FlumeAPI> {
    const api = new FlumeAPI(username, password, clientId, clientSecret, refreshInterval, log, isBeta);
    if (await api.login()) {
      await api.getDevices();
      await api.synchronizeData();    
      api.startSyncTimer();
    }
    return api;
  }

  get devices(): Device[] {
    return Array.from(this._devices.values());
  }

  teardown() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async do<T = any>(
    caller: string, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any | null, 
    shouldRetry: boolean,
    url: string, 
    ...parameters: (string|undefined)[]
  ):  Promise<T[] | null> {

    parameters.forEach(param => {
      url = url.replace('%s', param ?? '');
    });

    let config: AxiosRequestConfig;
    if (this.auth) {
      config = { headers: { Authorization: `Bearer ${this.auth.token}` }, timeout: HTTP_TIMEOUT };
    } else {
      config = { timeout: HTTP_TIMEOUT };
    }

    try {

      let res: AxiosResponse<FlumeResponse<T>>;
      if (data) {
        res = await axios.post(url, data, config);
      } else {
        res = await axios.get(url, config);
      }

      if (!res.data || !res.data.data || !res.data.data[0]) {
        this.logHTTP(LogLevel.DEBUG, caller, JSON.stringify(res.data));
        throw new Error(strings.noDataReceived);
      }

      this.logIfBeta(caller, res.data);

      return res.data.data;

    } catch (err: unknown) {
      if (shouldRetry) {
        return this.retryIfPossible<T>(err, caller, () => this.do<T>(caller, data, shouldRetry, url, ...parameters));
      }
    }

    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async retryIfPossible<T = any>(err: unknown, name: string, retry: () => (Promise<T[] | null>)): Promise<T[] | null> {

    const error = err as { code?: string; message: string };
    this.logHTTP(LogLevel.DEBUG, name, error.message);

    if (!error.code || !HTTP_RETRY_CODES.includes(error.code)) {
      return null;
    }
    
    this.log.warn(strings.httpRetry, RETRY_INTERVAL / SECOND);

    const sleep = (ms: number): Promise<void> => {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    };

    // Retry if another attempt could be successful
    await sleep(RETRY_INTERVAL);

    return await retry();
  }

  private async login(): Promise<boolean> {

    const data = {
      grant_type: 'password',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      username: this.username,
      password: this.password,
    };
 
    const tokenData = await this.do<Types.TokenData>(this.login.name, data, true, URL_AUTH);

    if (!tokenData) {
      return false;
    } 
    
    this.auth = new Auth(tokenData[0]);
    this.userId = (jwtDecode(this.auth.token) as Types.JwtPayload).user_id;

    return true;
  }

  private async authRefresh(): Promise<boolean> {

    if (!this.auth?.refresh) {
      this.logHTTP(LogLevel.DEBUG, this.authRefresh.name, strings.noRefreshToken);
      return await this.login();
    }

    const data = {
      grant_type: 'refresh_token',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: this.auth.refresh,
    };
    
    const tokenData = await this.do<Types.TokenData>(this.authRefresh.name, data, true, URL_AUTH);

    if (!tokenData) {
      return false;
    } 
    
    this.auth = new Auth(tokenData[0]);

    return true;
  }

  private async refreshAuthIfNecessary(): Promise<void> {
    if (Date.now() > (this.auth?.expiry ?? 0)) {
      await this.authRefresh();
    }
  }

  private startSyncTimer() {
    this.teardown();

    // Note the Flume API has a limit of 120 requests per hour
    this.syncTimer = setInterval(() => {
      this.synchronizeData();
    }, MINUTE * this.refreshInterval);
  }

  private async getDevices(): Promise<boolean> {

    const deviceDatum = await this.do<Types.DeviceData>(this.getDevices.name, null, true, URL_GET_DEVICES, this.userId);
    if (!deviceDatum) {
      return false;
    }

    deviceDatum.forEach(deviceData => {
      if (deviceData.bridge_id) {
        const device = new Device(deviceData);
        this._devices.set(device.id, device);
      }
    });

    return true;
  }

  private async getDeviceData(deviceId: string): Promise<Types.DeviceData | null> {
    const deviceDatum = await this.do<Types.DeviceData>(this.getDeviceData.name, null, false, URL_GET_DEVICE, this.userId, deviceId);

    if (!deviceDatum) {
      return null;
    }

    return deviceDatum[0];
  }

  async getLeakData(deviceId: string): Promise<Types.LeakData | null> {

    const leakDatum = await this.do<Types.LeakData>(this.getLeakData.name, null, false, URL_LEAK_INFO, this.userId, deviceId);

    if (!leakDatum) {
      return null;
    }

    return leakDatum[0];
  }

  private async getUsageData(deviceId: string): Promise<Types.UsageData | null> {

    // TODO need to make sure this is giving the correct values at the end of the day
    // Generate dates for the query data
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');

    const startOfToday = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} 00:00:00`;
    const startOfCurrMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01 00:00:00`;
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfLastMonth = `${lastMonth.getFullYear()}-${pad(lastMonth.getMonth() + 1)}-01 00:00:00`;

    const data = {
      queries: [
        {
          request_id: 'today',
          bucket: 'DAY',
          since_datetime: startOfToday,
          operation: 'SUM',
          units: 'GALLONS',
        },
        {
          request_id: 'month',
          bucket: 'MON',
          since_datetime: startOfCurrMonth,
          operation: 'SUM',
          units: 'GALLONS',
        },
        {
          request_id: 'lastMonth',
          bucket: 'MON',
          since_datetime: startOfLastMonth,
          until_datetime: startOfCurrMonth,
          operation: 'SUM',
          units: 'GALLONS',
        },
      ],
    };

    const usageDatum = await this.do<Types.UsageData>(this.getUsageData.name, data, false, URL_WATER_USAGE, this.userId, deviceId);

    if (!usageDatum) {
      return null;
    }

    return usageDatum[0];
  }

  private async synchronizeData(): Promise<void> {

    this.refreshAuthIfNecessary();

    for (const device of this._devices.values()) {

      const id = device.id;

      let deviceData: Types.DeviceData | null = null;
      let usageData: Types.UsageData | null = null;

      if (Date.now() - this.lastFullRefresh > FULL_REFRESH_INTERVAL) {
        deviceData = await this.getDeviceData(id);
        usageData = await this.getUsageData(id);
        this.lastFullRefresh = Date.now();
      }

      const leakData = await this.getLeakData(id);

      device.update(deviceData, leakData, usageData);
    };
  }

  private logHTTP(level: LogLevel, caller: string, message: string) {
    this.log.log(level, '[HTTP %s()] %s', caller, message);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private logIfBeta(caller: string, data: any) {

    if (!this.isBeta) {
      return;
    }

    let message = JSON.stringify(data);

    const token = data.data[0]?.access_token ?? this.auth?.token;
    if (token) {
      message = message.replaceAll(token, `**** ${strings.redacted} ****`);
    }

    const refresh = data.data[0]?.refresh_token ?? this.auth?.refresh;
    if (refresh) {
      message = message.replaceAll(refresh, `**** ${strings.redacted} ****`);
    }

    this.logHTTP(LogLevel.INFO, caller, message);
  }
}
