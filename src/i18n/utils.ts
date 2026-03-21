import { defaultLocale, locales, type Locale } from './config';
import en from './translations/en';
import it from './translations/it';
import de from './translations/de';
import es from './translations/es';
import zh from './translations/zh';

const translations: Record<Locale, typeof en> = { en, it, de, es, zh };

/** Resolve a dot-separated key path on any object. */
function getNestedValue(obj: unknown, path: string): string | undefined {
  const val = path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
  return typeof val === 'string' ? val : undefined;
}

/**
 * Returns a `t(key)` function bound to the given locale.
 * Falls back to the default locale (English) when the key is missing.
 */
export function useTranslations(locale: Locale) {
  const dict = translations[locale] ?? translations[defaultLocale];
  return function t(key: string): string {
    return (
      getNestedValue(dict, key) ??
      getNestedValue(translations[defaultLocale], key) ??
      key
    );
  };
}

/** Get the raw translation object for a locale. */
export function getTranslations(locale: Locale): typeof en {
  return translations[locale] ?? translations[defaultLocale];
}

/** Extract the locale from the current URL pathname. */
export function getLocaleFromUrl(url: URL): Locale {
  const [, segment] = url.pathname.split('/');
  if ((locales as readonly string[]).includes(segment)) return segment as Locale;
  return defaultLocale;
}

/** Prefix a path with the locale slug (skip for default locale). */
export function localizedPath(locale: Locale, path: string): string {
  // Strip any existing locale prefix
  const clean = path.replace(new RegExp(`^/(${locales.join('|')})(/|$)`), '/') || '/';
  if (locale === defaultLocale) return clean;
  return `/${locale}${clean === '/' ? '' : clean}`;
}

/** Strip locale prefix from a path to get the canonical (English) path. */
export function stripLocaleFromPath(path: string): string {
  return path.replace(new RegExp(`^/(${locales.join('|')})(/|$)`), '/') || '/';
}

/** Generate static paths for all locales (for pages without other dynamic params). */
export function getLocaleStaticPaths() {
  return locales.map((locale) => ({
    params: { locale: locale === defaultLocale ? undefined : locale },
    props: { locale },
  }));
}
