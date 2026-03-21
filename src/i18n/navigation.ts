import type { Locale } from './config';
import { useTranslations, localizedPath } from './utils';
import navData from '../data/navigation.json';

export interface NavItem {
  label: string;
  href: string;
  megaMenu?: boolean;
  categories?: { label: string; href: string; icon: string }[];
  collections?: { label: string; href: string; icon: string }[];
}

export function getLocalizedNavigation(locale: Locale): { main: NavItem[] } {
  const t = useTranslations(locale);
  return {
    main: navData.main.map((item: any) => ({
      label: t(item.key),
      href: localizedPath(locale, item.href),
      ...(item.megaMenu && {
        megaMenu: true,
        categories: item.categories?.map((cat: any) => ({
          label: t(cat.key),
          href: localizedPath(locale, cat.href),
          icon: cat.icon,
        })),
        collections: item.collections?.map((col: any) => ({
          label: t(col.key),
          href: localizedPath(locale, col.href),
          icon: col.icon,
        })),
      }),
    })),
  };
}
