import { HomebridgePluginUiServer } from '@homebridge/plugin-ui-utils';

import { getAllTranslations, setLanguage } from '../i18n/i18n.js';

class FlumeConfigUiServer extends HomebridgePluginUiServer {
  constructor() {
    super();
    this.onRequest('i18n', this.i18n.bind(this));
    this.ready();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async i18n(language: string): Promise<any> {
    setLanguage(language);
    return getAllTranslations();
  }
}

(() => new FlumeConfigUiServer())();