export const defaultLocale = 'en';
export const locales = ['en', 'it', 'de', 'es', 'zh'] as const;
export type Locale = (typeof locales)[number];

export const localeConfig: Record<
  Locale,
  { label: string; flag: string; ogLocale: string; dateLocale: string }
> = {
  en: { label: 'English', flag: '\u{1F1EC}\u{1F1E7}', ogLocale: 'en_US', dateLocale: 'en-US' },
  it: { label: 'Italiano', flag: '\u{1F1EE}\u{1F1F9}', ogLocale: 'it_IT', dateLocale: 'it-IT' },
  de: { label: 'Deutsch', flag: '\u{1F1E9}\u{1F1EA}', ogLocale: 'de_DE', dateLocale: 'de-DE' },
  es: { label: 'Español', flag: '\u{1F1EA}\u{1F1F8}', ogLocale: 'es_ES', dateLocale: 'es-ES' },
  zh: { label: '中文', flag: '\u{1F1E8}\u{1F1F3}', ogLocale: 'zh_CN', dateLocale: 'zh-CN' },
};
