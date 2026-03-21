import { useState, useEffect } from 'react';

const CONSENT_KEY = 'cdm_cookie_consent';

type ConsentState = 'accepted' | 'rejected' | null;

interface Labels {
  message: string;
  accept: string;
  reject: string;
  privacyPolicy: string;
  privacyHref: string;
}

interface Props {
  labels?: Labels;
}

const defaultLabels: Labels = {
  message: 'This site uses technical cookies and localStorage to function properly. We load fonts from Google Fonts, which connects to external servers. No profiling or advertising cookies are used.',
  accept: 'Accept',
  reject: 'Reject',
  privacyPolicy: 'Privacy Policy',
  privacyHref: '/privacy',
};

export default function CookieBanner({ labels: labelsProp }: Props) {
  const l = { ...defaultLabels, ...labelsProp };
  const [consent, setConsent] = useState<ConsentState>('accepted');

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === 'accepted' || stored === 'rejected') {
      setConsent(stored);
    } else {
      setConsent(null);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setConsent('accepted');
  }

  function handleReject() {
    localStorage.setItem(CONSENT_KEY, 'rejected');
    setConsent('rejected');
  }

  if (consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-[9999] bg-[#272729] text-white px-4 py-4 sm:px-6 sm:py-5 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm leading-relaxed text-white/80 flex-1">
          {l.message}{' '}
          <a
            href={l.privacyHref}
            className="underline text-white hover:text-[#f5b749] transition-colors"
          >
            {l.privacyPolicy}
          </a>
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={handleReject}
            className="text-sm px-4 py-2 rounded border border-white/30 text-white/70 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            {l.reject}
          </button>
          <button
            onClick={handleAccept}
            className="text-sm px-5 py-2 rounded bg-[#f5b749] text-[#272729] font-bold hover:bg-[#f1bc1a] transition-all cursor-pointer"
          >
            {l.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
