import { useState, useEffect } from 'react';
import { X, CaretDown } from '@phosphor-icons/react';
import navigation from '../../data/navigation.json';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsOpen((prev) => !prev);
    document.addEventListener('toggle-mobile-nav', handler);
    return () => document.removeEventListener('toggle-mobile-nav', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const shopItem = navigation.main.find((i) => i.label === 'Shop');

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[998]"
        onClick={() => setIsOpen(false)}
      />

      {/* Slide-out panel */}
      <div className="fixed top-0 right-0 h-full w-[300px] max-w-[85vw] bg-white z-[999] shadow-2xl overflow-y-auto animate-slide-in">
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2"
          aria-label="Close menu"
        >
          <X size={24} />
        </button>

        {/* Branding */}
        <div className="px-6 pt-8 pb-4 border-b border-gray-100">
          <p className="text-lg" style={{ fontFamily: "'Pacifico', cursive" }}>
            The best in Praiano
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Family running ceramic shop. Fine quality goods. Quality service.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Praiano, Piazzetta Gennaro Gagliano 108
            <br />
            tel: +39 338 361 2306
          </p>
        </div>

        {/* Nav links */}
        <nav className="px-6 py-4">
          <ul className="space-y-1">
            {navigation.main.map((item) => (
              <li key={item.label}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => setShopOpen(!shopOpen)}
                      className="flex items-center justify-between w-full py-3 text-base font-medium"
                    >
                      <a href={item.href} onClick={(e) => e.stopPropagation()}>
                        {item.label}
                      </a>
                      <CaretDown size={16} className={`transition-transform ${shopOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {shopOpen && (
                      <ul className="pl-4 space-y-1 pb-2">
                        {item.children.map((child) => (
                          <li key={child.label}>
                            {child.children ? (
                              <div>
                                <button
                                  onClick={() => setCollectionsOpen(!collectionsOpen)}
                                  className="flex items-center justify-between w-full py-2 text-sm text-gray-600"
                                >
                                  {child.label}
                                  <CaretDown size={12} className={`transition-transform ${collectionsOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {collectionsOpen && (
                                  <ul className="pl-4 space-y-1">
                                    {child.children.map((sub) => (
                                      <li key={sub.label}>
                                        <a
                                          href={sub.href}
                                          className="block py-1.5 text-sm text-gray-500 hover:text-primary"
                                          onClick={() => setIsOpen(false)}
                                        >
                                          {sub.label}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ) : (
                              <a
                                href={child.href}
                                className="block py-2 text-sm text-gray-600 hover:text-primary"
                                onClick={() => setIsOpen(false)}
                              >
                                {child.label}
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <a
                    href={item.href}
                    className="block py-3 text-base font-medium hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
