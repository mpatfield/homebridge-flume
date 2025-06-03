import type { API } from 'homebridge';

import { FlumePlatform, PLATFORM_ALIAS } from './platform.js';

export default (api: API) => {
  api.registerPlatform(PLATFORM_ALIAS, FlumePlatform);
};
