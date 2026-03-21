import { useEffect, useRef, useState, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-fade';

interface Slide {
  title: string[];
  subtitle: string;
  imageSrc: string;
}

interface Props {
  slides: Slide[];
}

const SLIDE_DURATION = 8000;

function RingIndicator({
  total,
  activeIndex,
  duration,
  onClickRing,
}: {
  total: number;
  activeIndex: number;
  duration: number;
  onClickRing: (i: number) => void;
}) {
  const R = 14;
  const STROKE = 2.5;
  const C = 2 * Math.PI * R;
  const SIZE = (R + STROKE) * 2;

  return (
    <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4">
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i === activeIndex;
        return (
          <button
            key={i}
            onClick={() => onClickRing(i)}
            className="relative block cursor-pointer"
            style={{ width: SIZE, height: SIZE }}
            aria-label={`Go to slide ${i + 1}`}
          >
            {/* Background ring */}
            <svg
              width={SIZE}
              height={SIZE}
              className="absolute inset-0"
              style={{ transform: 'rotate(-90deg)' }}
            >
              <circle
                cx={R + STROKE}
                cy={R + STROKE}
                r={R}
                fill="none"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth={STROKE}
              />
              {/* Progress ring */}
              <circle
                cx={R + STROKE}
                cy={R + STROKE}
                r={R}
                fill="none"
                stroke="white"
                strokeWidth={STROKE}
                strokeDasharray={C}
                strokeDashoffset={isActive ? 0 : C}
                strokeLinecap="round"
                style={
                  isActive
                    ? {
                        transition: `stroke-dashoffset ${duration}ms linear`,
                        strokeDashoffset: 0,
                        animation: `ringFill ${duration}ms linear forwards`,
                      }
                    : { strokeDashoffset: C }
                }
                className={isActive ? 'hero-ring-active' : ''}
              />
            </svg>
            {/* Center dot */}
            <span
              className="absolute rounded-full bg-white transition-transform duration-300"
              style={{
                width: 5,
                height: 5,
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) scale(${isActive ? 1 : 0.6})`,
                opacity: isActive ? 1 : 0.5,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function HeroSlider({ slides }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [ringKey, setRingKey] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setActiveIndex(swiper.realIndex);
    setRingKey((k) => k + 1);
  }, []);

  const handleClickRing = useCallback((i: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideToLoop(i);
    }
  }, []);

  return (
    <section className="relative h-screen">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: SLIDE_DURATION, disableOnInteraction: false }}
        loop
        speed={1200}
        className="h-full hero-swiper"
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        onSlideChange={handleSlideChange}
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={idx}>
            <div className="relative h-full overflow-hidden">
              {/* Ken Burns image */}
              <div
                className="absolute inset-0 bg-cover bg-center hero-ken-burns"
                style={{ backgroundImage: `url(${slide.imageSrc})` }}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-[#0a0a0a]/50" />
              {/* Content */}
              <div className="relative h-full flex items-center">
                <div className="max-w-7xl mx-auto px-6 w-full">
                  <div>
                    <h2 className="hero-title text-white mb-4">
                      {slide.title.map((line, i) => (
                        <span
                          key={i}
                          className="hero-text-line block"
                          style={{ animationDelay: `${0.3 + i * 0.2}s` }}
                        >
                          {line}
                        </span>
                      ))}
                    </h2>
                    <p
                      className="hero-text-line text-white/90 text-lg leading-relaxed max-w-lg"
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 500,
                        animationDelay: `${0.3 + slide.title.length * 0.2 + 0.15}s`,
                      }}
                    >
                      {slide.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Ring indicators — right side, vertically centered */}
      <RingIndicator
        key={ringKey}
        total={slides.length}
        activeIndex={activeIndex}
        duration={SLIDE_DURATION}
        onClickRing={handleClickRing}
      />

      <style>{`
        /* Ken Burns zoom on background */
        @keyframes kenBurns {
          0% { transform: scale(1); }
          100% { transform: scale(1.12); }
        }
        .hero-ken-burns {
          animation: kenBurns 10s ease-out forwards;
          will-change: transform;
        }
        .swiper-slide-active .hero-ken-burns {
          animation: kenBurns 10s ease-out forwards;
        }

        /* Text entrance */
        @keyframes heroTextIn {
          0% {
            opacity: 0;
            transform: translateY(30px);
            filter: blur(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }
        .hero-text-line {
          opacity: 0;
          will-change: opacity, transform, filter;
        }
        .swiper-slide-active .hero-text-line {
          animation: heroTextIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .swiper-slide:not(.swiper-slide-active) .hero-text-line {
          animation: none;
          opacity: 0;
        }

        /* Ring progress animation */
        @keyframes ringFill {
          0% { stroke-dashoffset: ${2 * Math.PI * 14}; }
          100% { stroke-dashoffset: 0; }
        }

        /* Hide default pagination */
        .hero-swiper .swiper-pagination {
          display: none;
        }
      `}</style>
    </section>
  );
}
