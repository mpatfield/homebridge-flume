import type { API } from 'homebridge';

import { FlumePlatform } from './platform.js';
import { PLATFORM_ALIAS } from './settings.js';

export default (api: API) => {
  api.registerPlatform(PLATFORM_ALIAS, FlumePlatform);
};
