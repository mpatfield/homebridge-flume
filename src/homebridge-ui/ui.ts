import { IHomebridgePluginUi } from '@homebridge/plugin-ui-utils/ui.interface';

declare const homebridge: IHomebridgePluginUi;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let strings: any = { __I18N_REPLACE__ : '' };

function translateHtml() {
  document.querySelectorAll('[i18n]').forEach(element => {
    const key = element.getAttribute('i18n') as string;
    element.innerHTML = strings[key];
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
  strings = (language in strings) ? strings[language] : strings.en;
  translateHtml();

  const config = await homebridge.getPluginConfig();
  if (config.length) {
    showSettings();
  } else {
    await homebridge.updatePluginConfig([{ name: 'Flume' }]);
    showIntro();
  }
})();