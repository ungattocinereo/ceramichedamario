import { useState, useEffect } from 'react';
import {
  X,
  CaretRight,
  ArrowLeft,
  InstagramLogo,
  WhatsappLogo,
  FacebookLogo,
  MapPin,
  GlobeHemisphereWest,
  Flower,
  ForkKnife,
  FlowerLotus,
  Storefront,
  Rainbow,
  CirclesFour,
  Crown,
  Scroll,
  PottedPlant,
  Fish,
  Star,
  SunHorizon,
  Mountains,
  LampPendant,
  Umbrella,
  Lamp,
  FrameCorners,
} from '@phosphor-icons/react';

const iconMap: Record<string, any> = {
  Flower, ForkKnife, FlowerLotus, Storefront,
  Rainbow, CirclesFour, Crown, Scroll,
  PottedPlant, Fish, Star, SunHorizon,
  Mountains, LampPendant, Umbrella, Lamp, FrameCorners,
};

interface NavItem {
  label: string;
  href: string;
  megaMenu?: boolean;
  categories?: { label: string; href: string; icon: string }[];
  collections?: { label: string; href: string; icon: string }[];
}

interface Language {
  code: string;
  label: string;
  flag: string;
  href: string;
  active: boolean;
}

interface Props {
  navigation: { main: NavItem[] };
  languages: Language[];
  categoriesLabel: string;
  collectionsLabel: string;
  languageLabel: string;
  backLabel: string;
  homeHref: string;
}

type View = 'main' | 'shop';

export default function MobileNav({
  navigation,
  languages,
  categoriesLabel,
  collectionsLabel,
  languageLabel,
  backLabel,
  homeHref,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>('main');

  useEffect(() => {
    const handler = () => setIsOpen((prev) => !prev);
    document.addEventListener('toggle-mobile-nav', handler);
    return () => document.removeEventListener('toggle-mobile-nav', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    if (!isOpen) setCurrentView('main');
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const shopItem = navigation.main.find((i) => i.megaMenu);
  const close = () => setIsOpen(false);

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 text-white overflow-y-auto">
      {/* Header row */}
      <div className="flex items-center justify-between px-6 py-5">
        <a href={homeHref} onClick={close} aria-label="Home">
          <img src="/logo-sign-white.svg" alt="" className="h-[36px] w-auto brightness-0 invert" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </a>
        <button onClick={close} className="p-2 text-white/80 hover:text-white" aria-label="Close menu">
          <X size={28} weight="bold" />
        </button>
      </div>

      {/* Main view */}
      {currentView === 'main' && (
        <nav className="px-8 pt-4 animate-fade-in">
          <ul className="space-y-1">
            {navigation.main.map((item) => (
              <li key={item.label}>
                {item.megaMenu ? (
                  <button
                    onClick={() => setCurrentView('shop')}
                    className="flex items-center justify-between w-full py-4 text-2xl font-medium text-white/90 hover:text-white transition-colors"
                  >
                    {item.label}
                    <CaretRight size={20} className="text-white/50" />
                  </button>
                ) : (
                  <a
                    href={item.href}
                    className="block py-4 text-2xl font-medium text-white/90 hover:text-white transition-colors"
                    onClick={close}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>

          {/* Bottom info */}
          <div className="mt-10 pt-8 border-t border-white/10 space-y-4">
            <a href="https://www.instagram.com/ceramichedamariopraiano/" target="_blank" rel="noopener" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
              <InstagramLogo size={20} weight="bold" />
              <span className="text-sm">Instagram</span>
            </a>
            <a href="https://www.facebook.com/ceramichedamario" target="_blank" rel="noopener" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
              <FacebookLogo size={20} weight="bold" />
              <span className="text-sm">Facebook</span>
            </a>
            <a href="https://wa.me/393383612306" target="_blank" rel="noopener" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
              <WhatsappLogo size={20} weight="bold" />
              <span className="text-sm">+39 338 361 2306</span>
            </a>
            <div className="flex items-center gap-3 text-white/50">
              <MapPin size={20} weight="bold" />
              <span className="text-sm">Praiano, Amalfi Coast</span>
            </div>

            {/* Language switcher */}
            <div className="pt-4">
              <div className="flex items-center gap-2 text-white/40 mb-3">
                <GlobeHemisphereWest size={16} weight="bold" />
                <span className="text-xs font-bold uppercase tracking-wider">{languageLabel}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <a
                    key={lang.code}
                    href={lang.href}
                    onClick={close}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                      lang.active
                        ? 'bg-white/15 text-white'
                        : 'text-white/50 hover:text-white/80'
                    }`}
                  >
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Shop view */}
      {currentView === 'shop' && (
        <div className="px-8 pt-4 animate-fade-in">
          <button
            onClick={() => setCurrentView('main')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">{backLabel}</span>
          </button>

          {/* Categories */}
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">{categoriesLabel}</h3>
          <ul className="space-y-1 mb-8">
            {shopItem?.categories?.map((cat) => {
              const Icon = iconMap[cat.icon];
              return (
                <li key={cat.label}>
                  <a
                    href={cat.href}
                    className="flex items-center gap-3 py-3 text-lg font-medium text-white/90 hover:text-white transition-colors"
                    onClick={close}
                  >
                    {Icon && <Icon size={22} className="text-white/50" />}
                    {cat.label}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Collections */}
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">{collectionsLabel}</h3>
          <ul className="space-y-0.5">
            {shopItem?.collections?.map((col) => {
              const Icon = iconMap[col.icon];
              return (
                <li key={col.label}>
                  <a
                    href={col.href}
                    className="flex items-center gap-3 py-2.5 text-base text-white/75 hover:text-white transition-colors"
                    onClick={close}
                  >
                    {Icon && <Icon size={18} className="text-white/40" />}
                    {col.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}
