# Ceramiche Da Mario

A complete e-commerce showcase website for **Ceramiche Da Mario** — a family-run ceramics shop in Praiano, on the Amalfi Coast, Italy. Founded in 1960, the shop sells handmade and hand-painted Vietri ceramics, one of the most iconic Italian craft traditions.

This is not a transactional storefront but a beautiful product catalog and brand showcase, designed to let visitors explore the collection and request quotes directly from the shop.

## The Migration

This project is a **full migration from WordPress/WooCommerce to Astro** — a modern static site generator. The original WordPress site with its WooCommerce catalog (133 products, 16 categories, 190+ product images, blog posts, testimonials, and all site content) was migrated into a fully static, blazing-fast Astro build.

A custom Node.js migration script (`scripts/migrate-data.mjs`) was built to extract and transform all WooCommerce product data, categories, blog posts, and media assets into Astro's content collections and optimized image pipeline.

## What's Inside

| Content | Count |
|---|---|
| Products | 133 |
| Product categories | 16 |
| Product images | 190+ |
| Blog posts | 4 |
| Site pages | 9 |
| Components | 25 |

### Pages

- **Home** — Hero slider with Ken Burns animation and ring progress indicators, category grid, product carousel, testimonials, craftsmen section, quote block, Instagram CTA
- **Shop** — Full product catalog with category filtering
- **Product pages** — Individual pages for all 133 products with galleries, descriptions, meta info, related products, and "Request a Quote" CTA
- **About** — The story of Don Mario and three generations of ceramic artistry
- **News** — Blog with 4 posts
- **Contact** — Contact form with Formspree integration
- **404** — Custom error page

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Astro 6](https://astro.build) (static output) |
| UI Islands | [React 19](https://react.dev) (interactive components) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| Slider | [Swiper](https://swiperjs.com) (hero, testimonials, product carousel) |
| Icons | [Phosphor Icons](https://phosphoricons.com) (React) |
| Images | Astro Image with [Sharp](https://sharp.pixelplumbing.com) optimization |
| Sitemap | @astrojs/sitemap |
| Fonts | Google Fonts — DM Sans, DM Mono, Pacifico, Poppins |

## Design System

### Typography

- **DM Sans** — Primary body font
- **Pacifico** — Accent/heading font (cursive). Never bold, never italic — only weight 400 normal
- **DM Mono** — Monospace font for eyebrow labels
- **Poppins** — Slider subtitle font

### Styles

- **Eyebrow labels** — Monospace uppercase text (15px, DM Mono) used for section labels like "Opinion's Important", "Words to live by"
- **Accent underline** — Half-height background highlight used on key words (e.g., "ceramics", "speaking")
- **Hero titles** — Large Pacifico headings with staggered fade-in animation
- **Gradient text** — Orange gradient for emphasis headings

### Colors

| Name | Value | Usage |
|---|---|---|
| Primary | `#1440e0` | Links, buttons, CTAs |
| Gold/Accent | `#FFB526` | Footer, testimonials background, accent underlines |
| Orange | `#f77f00` | Accents, hover states |
| Heading Blue | `#273a80` | Main heading color |
| Dark | `#272729` | Quote section background |

## Key Features

- **Fully static** — Pre-rendered at build time, no server needed. 159 pages generated in ~4 seconds
- **Image optimization** — All 190+ product images automatically processed through Sharp with WebP/AVIF generation and responsive `srcset`
- **SEO-ready** — JSON-LD structured data (Product, LocalBusiness, BreadcrumbList), Open Graph tags, semantic HTML, auto-generated sitemap
- **Responsive** — Mobile-first design with slide-out mobile navigation
- **Hero slider** — Ken Burns zoom effect, crossfade transitions, animated ring progress indicators, staggered text entrance animations
- **Testimonials** — Auto-playing carousel with decorative ceramic tile background
- **Category grid** — Bento-style layout with atmospheric lifestyle photography and Phosphor Icons
- **Product carousel** — Horizontal scrollable product showcase
- **Contact form** — Client-side validation, honeypot spam protection, pre-filled product inquiries from product pages

## Project Structure

```
src/
├── assets/images/       # All images (190+ products, site photos)
├── components/
│   ├── home/            # Homepage sections (Hero, Categories, Testimonials, etc.)
│   ├── layout/          # Header, Footer, Layout, MobileNav
│   ├── shop/            # ProductCard, CategoryFilter, PriceDisplay
│   ├── blog/            # PostCard
│   └── ui/              # Button, ContactForm, GradientText, HighlightedText
├── content/
│   ├── products/        # 133 product JSON files
│   ├── categories/      # 16 category JSON files
│   └── posts/           # 4 blog post markdown files
├── data/                # Site config, navigation, testimonials, slides
├── pages/               # 9 route pages
├── styles/              # Global CSS with Tailwind
└── utils/               # Image loading utilities
```

## Getting Started

```bash
npm install
npm run dev       # Start dev server at localhost:4321
npm run build     # Build static site to dist/
npm run preview   # Preview production build
```

## About Ceramiche Da Mario

> *"The reason is that we want visitors and travellers to purchase a real souvenir, something that will remind you of this place forever."*

Ceramiche Da Mario is a shop born in 1960 in Piazzetta Gagliano, Praiano. Founded by Don Mario — a tailor turned ceramics merchant who saw the beauty in connecting Amalfi Coast visitors with authentic Vietri craftsmanship. Now run by his daughters, the shop carries forward his legacy: every piece is handmade and hand-painted by skilled local artisans, making each one unique and unrepeatable.

---

Built with Astro, React, and Tailwind CSS. Migrated from WordPress/WooCommerce.
