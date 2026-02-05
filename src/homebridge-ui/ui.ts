import { IHomebridgePluginUi } from '@homebridge/plugin-ui-utils/ui.interface';
import { Translation } from '../i18n/i18n.js';
import { PROJECT_HOMEPAGE } from '../homebridge/settings.js';

declare const homebridge: IHomebridgePluginUi;

const i18n_replacements = {
  arrow: '&rarr;',
  flume: '<a target="_blank" href="https://portal.flumetech.com/">Flume</a>',
  github: `<a target="_blank" href="${PROJECT_HOMEPAGE}">GitHub</a>`,
};

function translateHtml(strings: Translation) {
  document.querySelectorAll('[i18n]').forEach(element => {

    const key = element.getAttribute('i18n') as keyof typeof strings.config;
    let string = strings.config[key] as string;

    const token = element.getAttribute('i18n_replace') as keyof typeof i18n_replacements;
    if (token) {
      string = string.replace('%s', i18n_replacements[token]);
    }
    element.innerHTML = string;
  });
};

function showSettings() {
  document.getElementById('pageIntro')!.style.display = 'none';
  document.getElementById('support')!.style.display = 'block';

  homebridge.showSchemaForm();
  homebridge.hideSpinner();
};

function showIntro() {
  const introContinue = document.getElementById('introContinue') as HTMLButtonElement;
  introContinue.addEventListener('click', async () => {
    showSettings();
  });
  document.getElementById('pageIntro')!.style.display = 'block';
  homebridge.hideSpinner();
};

(() => {
  homebridge.showSpinner();
})();

(async () => {
  const language = await homebridge.i18nCurrentLang();
  const strings = await homebridge.request('i18n', language);
  translateHtml(strings);

  const config = await homebridge.getPluginConfig();
  if (config.length) {
    showSettings();
  } else {
    await homebridge.updatePluginConfig([{ name: strings.general.brand }]);
    showIntro();
  }
})();