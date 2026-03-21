import { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Star } from '@phosphor-icons/react';
import 'swiper/css';
import 'swiper/css/pagination';

interface Testimonial {
  name: string;
  location: string;
  lang?: string;
  text: string;
  rating: number;
}

interface Props {
  testimonials: Testimonial[];
  photoSrc?: string;
  eyebrow?: string;
  headingStart?: string;
  headingHighlight?: string;
  headingEnd?: string;
  googleReviewsLabel?: string;
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={18} weight={i < count ? 'fill' : 'regular'} className="text-black/80" />
      ))}
    </div>
  );
}

const langLabels: Record<string, string> = {
  EN: 'English',
  IT: 'Italiano',
  FR: 'Français',
  DE: 'Deutsch',
  ES: 'Español',
};

export default function Testimonials({
  testimonials,
  photoSrc,
  eyebrow = "Opinion\u2019s important",
  headingHighlight = 'speaking',
  googleReviewsLabel = 'Google Reviews',
}: Props) {
  const iconRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = iconRef.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight;
      const progress = 1 - (rect.top + rect.height / 2) / viewH;
      const rotation = progress * 40;
      el.style.transform = `translateY(-50%) rotate(${rotation}deg)`;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section
      className="relative py-16 lg:py-24 overflow-hidden"
      style={{ background: 'linear-gradient(to right, #ffbd3a, #f29900)' }}
    >
      {/* Background decorative icon */}
      {photoSrc && (
        <img
          ref={iconRef}
          src={photoSrc}
          alt=""
          aria-hidden="true"
          className="hidden lg:block absolute top-1/2 right-8 w-[47%] max-w-[555px] pointer-events-none transition-transform duration-100 ease-out"
          style={{ transform: 'translateY(-50%)' }}
          loading="lazy"
        />
      )}

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="max-w-2xl">
          <h5 className="eyebrow mb-2 text-black/70">
            {eyebrow}
          </h5>
          <h2
            className="text-[clamp(36px,5vw,55px)] font-normal mb-4 text-black"
            style={{ fontFamily: "'Pacifico', cursive", lineHeight: 1.3 }}
          >
            Costumers <span className="underline-pacifico-accent--white">{headingHighlight}</span> about us
          </h2>

          <div className="mt-10" />

          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 9000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            loop
            className="testimonial-swiper"
          >
            {testimonials.map((t, idx) => (
              <SwiperSlide key={idx}>
                <blockquote className="pb-14">
                  {/* Google rating badge + stars */}
                  <div className="flex items-center gap-3 mb-4">
                    <svg width="16" height="16" viewBox="0 0 24 24" className="shrink-0">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span className="text-xs font-bold text-black/70">{googleReviewsLabel}</span>
                    <span className="text-black/15">|</span>
                    <Stars count={t.rating} />
                  </div>
                  <p className="text-[17px] leading-relaxed mb-5 text-black/85 font-medium">
                    "{t.text}"
                  </p>
                  <footer className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center text-sm font-bold text-black/60">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-black text-sm">{t.name}</p>
                      <p className="text-xs text-black/60 flex items-center gap-2">
                        <span>{t.location}</span>
                        {t.lang && (
                          <>
                            <span className="text-black/20">|</span>
                            <span className="inline-flex items-center gap-1 bg-black/8 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                              {t.lang === 'IT' ? '🇮🇹' : t.lang === 'FR' ? '🇫🇷' : t.lang === 'DE' ? '🇩🇪' : t.lang === 'ES' ? '🇪🇸' : '🇬🇧'}
                              {' '}{langLabels[t.lang] || t.lang}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </footer>
                </blockquote>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <style>{`
        .testimonial-swiper .swiper-pagination {
          text-align: left;
          bottom: 0;
        }
        .testimonial-swiper .swiper-pagination-bullet {
          background: #000;
          opacity: 0.3;
          width: 8px;
          height: 8px;
        }
        .testimonial-swiper .swiper-pagination-bullet-active {
          opacity: 0.8;
        }
      `}</style>
    </section>
  );
}
