import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const products = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/products' }),
  schema: z.object({
    id: z.number(),
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    excerpt: z.string(),
    price: z.number().nullable(),
    regularPrice: z.number().nullable(),
    salePrice: z.number().nullable(),
    sku: z.string().nullable(),
    stockStatus: z.string(),
    weight: z.string().nullable(),
    categories: z.array(z.object({
      name: z.string(),
      slug: z.string(),
    })),
    featuredImage: z.string().nullable(),
    galleryImages: z.array(z.string()),
    seoTitle: z.string(),
    seoDescription: z.string(),
    date: z.string(),
  }),
});

const categories = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/categories' }),
  schema: z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    count: z.number(),
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.string(),
    featuredImage: z.string(),
    seoTitle: z.string(),
    seoDescription: z.string(),
  }),
});

export const collections = { products, categories, posts };
