import type { ImageMetadata } from 'astro';

const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/**/*.{jpeg,jpg,png,gif,webp}'
);

export async function getImage(path: string): Promise<ImageMetadata | null> {
  if (!path) return null;
  const loader = images[path];
  if (!loader) {
    console.warn(`Image not found: ${path}`);
    return null;
  }
  const mod = await loader();
  return mod.default;
}

export function getImageSync(path: string) {
  return images[path] || null;
}

export function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return 'Price on request';
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(price);
}
