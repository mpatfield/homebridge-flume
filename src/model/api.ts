import axios, { AxiosResponse, AxiosRequestConfig, isAxiosError } from 'axios';
import { Logger, LogLevel } from 'homebridge';
import { jwtDecode } from 'jwt-decode';

import { Auth } from './auth.js';
import { Device } from './device.js';
import * as Types from './types.js';

import strings from '../lang/en.js';
import { MINUTE, SECOND } from '../tools/time.js';

const URL_AUTH = 'https://api.flumetech.com/oauth/token';
const URL_GET_LOCATIONS = 'https://api.flumewater.com/users/%s/locations';
const URL_GET_DEVICES = 'https://api.flumetech.com/users/%s/devices?list_shared=true';
const URL_GET_DEVICE = 'https://api.flumetech.com/users/%s/devices/%s';
const URL_WATER_USAGE = 'https://api.flumetech.com/users/%s/devices/%s/query';
const URL_LEAK_INFO = 'https://api.flumetech.com/users/%s/devices/%s/leaks/active';

const HTTP_TIMEOUT = 10 * SECOND;

const HTTP_RETRY_CODES = [
  'ERR_NETWORK',  // General network error in Axios
  'ETIMEDOUT',    // Request timed out
  'ECONNREFUSED', // Connection refused by server
  '429',          // Too Many Requests (rate limit)
  '500',          // Internal Server Error
  '502',          // Bad Gateway
  '503',          // Service Unavailable
  '504',          // Gateway Timeout
];

const FULL_REFRESH_INTERVAL = 15 * MINUTE;

const RETRY_INTERVALS = [1, 2, 5, 10, 15, 30, 60];

export class FlumeAPI {
  private _auth?: Auth | null;
  private userId?: string;

  readonly locationNames: Map<string, string> = new Map();
  private readonly _devices: Map<string, Device> = new Map();

  private retryIndex: number = 0;

  private syncTimer: NodeJS.Timeout | null = null;
  private lastFullRefresh: number = 0;

  private constructor(
    private readonly username: string,
    private readonly password: string,
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly refreshInterval: number,
    private readonly units: Types.VolumeUnits,
    private storagePath: string,
    private readonly log: Logger,
    private readonly verbose: boolean,
  ) {
    this.auth = Auth.load(this.storagePath, this.clientId);
  }

  static async connect(
    username: string,
    password: string,
    clientId: string,
    clientSecret: string,
    refreshInterval: number,
    units: Types.VolumeUnits,
    storagePath: string,
    log: Logger,
    verbose: boolean,
  ): Promise<FlumeAPI> {
    const api = new FlumeAPI(username, password, clientId, clientSecret, refreshInterval, units, storagePath, log, verbose);

    let shouldContinue = true;
    if (!api.auth) {
      shouldContinue = await api.authenticate();
    }

    if (shouldContinue) {
      await api.getLocations();
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
    shouldReturnArray: boolean,
    shouldRetry: boolean,
    url: string, 
    ...parameters: (string|undefined)[]
  ):  Promise<T | null> {

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

      let res: AxiosResponse<Types.FlumeResponse<T>>;
      if (data) {
        res = await axios.post(url, data, config);
      } else {
        res = await axios.get(url, config);
      }

      if (!res.data || !res.data.data || !res.data.data[0]) {
        this.logHTTP(LogLevel.DEBUG, caller, JSON.stringify(res.data));
        throw new Error(strings.noDataReceived);
      }

      const returnValue = shouldReturnArray ? res.data.data as T : res.data.data[0];

      this.logIfVerbose(caller, res.data);
      this.retryIndex = 0;

      return returnValue;

    } catch (err: unknown) {
      if (shouldRetry) {
        return this.retryIfPossible<T>(err, caller, () => this.do<T>(caller, data, shouldReturnArray, shouldRetry, url, ...parameters));
      } else {
        this.logHTTP(LogLevel.WARN, caller, (err as Error).message);
        return null;
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async retryIfPossible<T = any>(err: unknown, caller: string, retry: () => (Promise<T | null>)): Promise<T | null> {

    if (!isAxiosError(err)) {
      this.logHTTP(LogLevel.WARN, caller, (err as Error).message);
      return null;
    }
  
    const errorCode = err.code || err.response?.status?.toString() || 'UNKNOWN';

    if (!HTTP_RETRY_CODES.includes(errorCode) || this.retryIndex >= RETRY_INTERVALS.length) {
      this.logHTTP(LogLevel.WARN, caller, err.message);
      return null;
    }
    
    this.log.warn(strings.httpRetry, RETRY_INTERVALS[this.retryIndex]);
    await new Promise(resolve => setTimeout(resolve, RETRY_INTERVALS[this.retryIndex] * MINUTE));

    this.retryIndex += 1;

    return await retry();
  }

  private get auth(): Auth | null {
    return this._auth ?? null;
  }
  
  private set auth(value: Auth | null) {
    this._auth = value;

    if (this._auth) {
      this._auth.save(this.storagePath, this.clientId);
      this.userId = (jwtDecode(this._auth.token) as Types.JwtPayload).user_id;
    }
  }

  private async authenticate(): Promise<boolean> {

    const data = {
      grant_type: 'password',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      username: this.username,
      password: this.password,
    };
 
    const tokenData = await this.do<Types.TokenData>(this.authenticate.name, data, false, true, URL_AUTH);

    if (!tokenData) {
      return false;
    } 
    
    this.auth = new Auth(tokenData);

    return true;
  }

  private async authRefresh(): Promise<boolean> {

    if (!this.auth?.refresh) {
      this.logHTTP(LogLevel.DEBUG, this.authRefresh.name, strings.noRefreshToken);
      return await this.authenticate();
    }

    const data = {
      grant_type: 'refresh_token',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: this.auth.refresh,
    };
    
    const tokenData = await this.do<Types.TokenData>(this.authRefresh.name, data, false, true, URL_AUTH);

    if (!tokenData) {
      return false;
    } 
    
    this.auth = new Auth(tokenData);

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

  private async getLocations(): Promise<boolean> {

    await this.refreshAuthIfNecessary();

    const locationDatum = await this.do<Types.LocationData[]>(this.getLocations.name, null, true, true, URL_GET_LOCATIONS, this.userId);

    if (!locationDatum) {
      return false;
    }

    locationDatum.forEach(locationData => {
      this.locationNames.set(locationData.id, locationData.name);
    });

    return true;
  }

  private async getDevices(): Promise<boolean> {

    await this.refreshAuthIfNecessary();

    const deviceDatum = await this.do<Types.DeviceData[]>(this.getDevices.name, null, true, true, URL_GET_DEVICES, this.userId);
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
    const deviceData = await this.do<Types.DeviceData>(this.getDeviceData.name, null, false, false, URL_GET_DEVICE, this.userId, deviceId);

    if (!deviceData) {
      return null;
    }

    return deviceData;
  }

  async getLeakData(deviceId: string): Promise<Types.LeakData | null> {

    const leakData = await this.do<Types.LeakData>(this.getLeakData.name, null, false, false, URL_LEAK_INFO, this.userId, deviceId);

    if (!leakData) {
      return null;
    }

    return leakData;
  }

  private async getUsageData(deviceId: string): Promise<Types.UsageData | null> {

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
          units: this.units,
        },
        {
          request_id: 'month',
          bucket: 'MON',
          since_datetime: startOfCurrMonth,
          operation: 'SUM',
          units: this.units,
        },
        {
          request_id: 'lastMonth',
          bucket: 'MON',
          since_datetime: startOfLastMonth,
          until_datetime: startOfCurrMonth,
          operation: 'SUM',
          units: this.units,
        },
      ],
    };

    const usageData = await this.do<Types.UsageData>(this.getUsageData.name, data, false, false, URL_WATER_USAGE, this.userId, deviceId);

    if (!usageData) {
      return null;
    }

    return usageData;
  }

  private async synchronizeData(): Promise<void> {

    await this.refreshAuthIfNecessary();

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
  private logIfVerbose(caller: string, data: any) {

    if (!this.verbose) {
      return;
    }

    let message = JSON.stringify(data);

    Types.SENSITIVE_KEYS.forEach(key => {
      const regex = new RegExp(`"${key}"\\s*:\\s*(".*?"|\\d+|true|false|null)`, 'gi');
      message = message.replace(regex, `"${key}": "${strings.redacted}"`);
    });

    this.logHTTP(LogLevel.INFO, caller, message);
  }
}
