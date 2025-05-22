import type { API } from 'homebridge';

import { FlumePlatform } from './platform.js';

export const PLATFORM_ALIAS = 'Flume';

/**
 * This method registers the platform with Homebridge
 */
export default (api: API) => {
  api.registerPlatform(PLATFORM_ALIAS, FlumePlatform);
};
