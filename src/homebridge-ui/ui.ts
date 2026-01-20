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

function translateSchema(strings: Translation) {
  const tags = ['span', 'label', 'legend', 'option', 'p'];
  const elements = Array.from(
    window.parent.document.querySelectorAll(tags.join(',')),
  ).sort((a, b) => {
    return tags.indexOf(a.tagName.toLowerCase()) - tags.indexOf(b.tagName.toLowerCase());
  });

  const regex = /\$\{config\.(title|description|enumNames)\.([^}]+)\}/g;

  elements.forEach(element => {
    const walker = window.parent.document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

    while (walker.nextNode()) {
      const textNode = walker.currentNode as Text;
      const original = textNode.nodeValue || '';
      const replaced = original.replace(regex, (match, type: keyof typeof strings.config, key) => {
        if (
          strings.config[type] &&
          typeof strings.config[type] === 'object' &&
          key in (strings.config[type] as Record<string, string>)
        ) {
          return (strings.config[type] as Record<string, string>)[key];
        }
        return match;
      });

      if (original !== replaced) {
        textNode.nodeValue = replaced;
      }
    }
  });
}

function showSettings(strings: Translation) {
  document.getElementById('pageIntro')!.style.display = 'none';
  document.getElementById('support')!.style.display = 'block';

  const observer = new MutationObserver(() => {
    translateSchema(strings);
  });

  observer.observe(
    window.parent.document.body,
    { childList: true, subtree: true },
  );

  homebridge.showSchemaForm();
  homebridge.hideSpinner();
};

function showIntro(strings: Translation) {
  const introContinue = document.getElementById('introContinue') as HTMLButtonElement;
  introContinue.addEventListener('click', async () => {
    showSettings(strings);
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
    showSettings(strings);
  } else {
    await homebridge.updatePluginConfig([{ name: strings.general.brand }]);
    showIntro(strings);
  }
})();