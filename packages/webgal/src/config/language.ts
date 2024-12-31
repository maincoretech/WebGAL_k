/**
 * You can config the languages display in this file.
 * If you want close someone, please add "//" forward that line.
 * If you want to add language, please add the language English abbreviation name into language and languages,
 * also you need to code the name of it show.
 */

import zhCn from '@/translations/zh-cn';
import zhTw from '@/translations/zh-tw';
import en from '@/translations/en';
import jp from '@/translations/jp';
// import fr from '@/translations/fr';
// import de from '@/translations/de';
/*
  Import your translation configs here;
  example:
  import myLang from '@/translations/filename of your config file';
*/

export enum language {
  zhCn,
  zhTw,
  en,
  jp,
  // fr,
  // de,
}

const languages: Record<string, string> = {
  zhCn: '简体中文',
  zhTw: '繁體中文',
  en: 'English',
  jp: '日本語',
  // fr: 'Français',
  // de: 'Deutsch',
};

export const i18nTranslationResources: Record<string, { translation: Record<string, any> }> = {
  zhCn: { translation: zhCn },
  zhTw: { translation: zhTw },
  en: { translation: en },
  jp: { translation: jp },
  // fr: { translation: fr },
  // de: { translation: de },
};

export const defaultLanguage: language = language.zhCn;

export default languages;
