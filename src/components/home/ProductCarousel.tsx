import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

interface Product {
  slug: string;
  title: string;
  price: number | null;
  imageSrc: string;
  href?: string;
}

interface Props {
  products: Product[];
  priceOnRequestLabel?: string;
}

function formatPrice(price: number | null, label = 'Price on request'): string {
  if (price === null || price === undefined) return label;
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export default function ProductCarousel({ products, priceOnRequestLabel = 'Price on request' }: Props) {
  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            480: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          className="product-carousel"
        >
          {products.map((product) => (
            <SwiperSlide key={product.slug}>
              <a href={product.href || `/shop/${product.slug}`} className="block group">
                <div className="rounded-[10px] overflow-hidden bg-gray-50 aspect-square mb-3">
                  <img
                    src={product.imageSrc}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-sm font-medium mb-1 group-hover:text-primary transition-colors line-clamp-2">
                  {product.title}
                </h3>
                <p className="text-sm text-muted">{formatPrice(product.price, priceOnRequestLabel)}</p>
              </a>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style>{`
        .product-carousel .swiper-button-next,
        .product-carousel .swiper-button-prev {
          color: #1440e0;
          --swiper-navigation-size: 32px;
        }
      `}</style>
    </section>
  );
}
