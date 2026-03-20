import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

interface Testimonial {
  name: string;
  location: string;
  text: string;
}

interface Props {
  testimonials: Testimonial[];
  photoSrc?: string;
}

export default function Testimonials({ testimonials, photoSrc }: Props) {
  return (
    <section
      className="relative py-16 lg:py-24 overflow-hidden"
      style={{ backgroundColor: '#FFB526' }}
    >
      {/* Background decorative image */}
      {photoSrc && (
        <img
          src={photoSrc}
          alt=""
          aria-hidden="true"
          className="hidden lg:block absolute top-0 right-0 w-[40%] h-full object-cover object-center pointer-events-none"
          loading="lazy"
        />
      )}

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="max-w-2xl">
          <h5 className="eyebrow mb-2 text-black/70">
            Opinion's important
          </h5>
          <h2
            className="text-[clamp(36px,5vw,55px)] font-normal mb-8 text-black"
            style={{ fontFamily: "'Pacifico', cursive", lineHeight: 1.3 }}
          >
            Costumers <span className="underline-pacifico-accent--white">speaking</span> about us
          </h2>

          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 9000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            loop
            className="testimonial-swiper"
          >
            {testimonials.map((t, idx) => (
              <SwiperSlide key={idx}>
                <blockquote className="pb-12">
                  <p className="text-lg leading-relaxed mb-4 text-black/90 font-medium">
                    "{t.text}"
                  </p>
                  <footer className="font-bold text-black">
                    — {t.name}, <span className="font-normal text-black/70">{t.location}</span>
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
        }
        .testimonial-swiper .swiper-pagination-bullet-active {
          opacity: 0.8;
        }
      `}</style>
    </section>
  );
}
