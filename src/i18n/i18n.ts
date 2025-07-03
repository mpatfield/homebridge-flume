import de from './de.js';
import en from './en.js';

export enum Language {
  DE = 'de',
  EN = 'en',
}

const Translations: Record<Language, Translation> = {
  [Language.DE]: de,
  [Language.EN]: en,
};

export type Translation = typeof en;

let currentLanguage: Language = Language.EN;

export function getLanguage() {
  return currentLanguage;
}

export function setLanguage(i18nLang: string) {

  let language = Language.EN;
  switch(i18nLang) {
  case Language.DE:
    language = Language.DE;
    break;
  case Language.EN:
    language = Language.EN;
    break;
  }

  currentLanguage = Translations[language] ? language : Language.EN;
}

export function getAllTranslations(): Translation {
  return Translations[currentLanguage];
}

const translations = new Proxy({} as Translation, {
  get(_target, prop: string) {
    return (
      Translations[currentLanguage][prop as keyof Translation] ??
      Translations[Language.EN][prop as keyof Translation]
    );
  },
});

export { translations as strings };