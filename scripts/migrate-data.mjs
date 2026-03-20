/**
 * Data migration script: WordPress export → Astro content collections
 * Reads from /Users/greg/Documents/sandbox/ceramichedamario/export/
 * Writes to src/content/ and src/assets/images/
 */

import fs from 'fs';
import path from 'path';

const EXPORT_DIR = '/Users/greg/Documents/sandbox/ceramichedamario/export';
const UPLOADS_DIR = path.join(EXPORT_DIR, 'media/uploads');
const PROJECT_DIR = '/Users/greg/Documents/Code/ceramichedamario';
const CONTENT_DIR = path.join(PROJECT_DIR, 'src/content');
const IMAGES_DIR = path.join(PROJECT_DIR, 'src/assets/images');

// Ensure output directories exist
for (const dir of [
  `${CONTENT_DIR}/products`,
  `${CONTENT_DIR}/categories`,
  `${CONTENT_DIR}/posts`,
  `${IMAGES_DIR}/products`,
  `${IMAGES_DIR}/site`,
  `${IMAGES_DIR}/posts`,
]) {
  fs.mkdirSync(dir, { recursive: true });
}

// ──────────────────────────────────────────────────────────────
// Load export data
// ──────────────────────────────────────────────────────────────

const imageMap = JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, 'woocommerce/image_map.json'), 'utf-8'));
const categoryMap = JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, 'woocommerce/product_category_map.json'), 'utf-8'));
const galleries = JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, 'woocommerce/product_galleries.json'), 'utf-8'));
const productCategories = JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, 'taxonomies/product_categories.json'), 'utf-8'));
const seoData = JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, 'woocommerce/seo_data.json'), 'utf-8'));
const productsFull = JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, 'woocommerce/products_full.json'), 'utf-8'));

// Build lookup maps
const imageById = new Map();
for (const img of imageMap) {
  imageById.set(String(img.ID), img.file_path);
}

const categoryByProductId = new Map();
for (const entry of categoryMap) {
  const pid = String(entry.product_id);
  if (!categoryByProductId.has(pid)) {
    categoryByProductId.set(pid, []);
  }
  categoryByProductId.get(pid).push({
    name: entry.category,
    slug: entry.category_slug,
  });
}

const galleryByProductId = new Map();
for (const g of galleries) {
  galleryByProductId.set(String(g.product_id), g.gallery_ids.split(',').map(id => id.trim()));
}

const seoById = new Map();
for (const s of seoData) {
  seoById.set(String(s.ID), s);
}

// products_full has CSV artifacts — build a SAFE lookup by ID (only valid entries)
const priceById = new Map();
for (const p of productsFull) {
  const id = String(p.ID).trim();
  if (!id || id.includes('-') || id.includes('\r') || !/^\d+$/.test(id)) continue;
  priceById.set(id, {
    price: cleanPrice(p.price),
    regularPrice: cleanPrice(p.regular_price),
    salePrice: cleanPrice(p.sale_price),
    sku: cleanNull(p.sku),
    stockStatus: p.stock_status || 'instock',
    weight: cleanNull(p.weight),
  });
}

function cleanNull(val) {
  if (!val || val === 'NULL' || val.trim() === '') return null;
  return val.trim();
}

function cleanPrice(val) {
  if (!val || val === 'NULL' || val.trim() === '') return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

// Regex to detect WordPress thumbnails: filename-{W}x{H}.ext
const THUMB_RE = /-\d+x\d+\.\w+$/;

function isOriginal(filename) {
  return !THUMB_RE.test(filename);
}

// Resolve image ID → local relative path (for Astro assets)
function resolveImagePath(mediaId, destSubdir = 'products') {
  const filePath = imageById.get(String(mediaId));
  if (!filePath) return null;
  const basename = path.basename(filePath);
  return `/src/assets/images/${destSubdir}/${basename}`;
}

// Copy an image file from uploads to assets (only originals)
function copyImage(mediaId, destSubdir = 'products') {
  const filePath = imageById.get(String(mediaId));
  if (!filePath) return null;
  const basename = path.basename(filePath);
  if (!isOriginal(basename)) return null;

  const src = path.join(UPLOADS_DIR, filePath);
  const dest = path.join(IMAGES_DIR, destSubdir, basename);

  if (!fs.existsSync(src)) {
    console.warn(`  [WARN] Source not found: ${src}`);
    return null;
  }
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
  }
  return `/src/assets/images/${destSubdir}/${basename}`;
}

// ──────────────────────────────────────────────────────────────
// 1. Migrate Products
// ──────────────────────────────────────────────────────────────

console.log('=== Migrating Products ===');

const productsDir = path.join(EXPORT_DIR, 'products');
const productFiles = fs.readdirSync(productsDir).filter(f => f.endsWith('.json') && f !== '_all_products.json');

let productCount = 0;
const copiedImages = new Set();

for (const file of productFiles) {
  const product = JSON.parse(fs.readFileSync(path.join(productsDir, file), 'utf-8'));
  const id = String(product.id);
  const slug = product.slug;

  // Get price data from products_full
  const priceData = priceById.get(id) || {};

  // Get categories
  const cats = categoryByProductId.get(id) || [];

  // Get gallery image IDs
  const galleryIds = galleryByProductId.get(id) || [];

  // Copy featured image
  const featuredImagePath = copyImage(product.featured_media, 'products');
  if (featuredImagePath) copiedImages.add(featuredImagePath);

  // Copy gallery images
  const galleryPaths = [];
  for (const gid of galleryIds) {
    const gpath = copyImage(gid, 'products');
    if (gpath) {
      galleryPaths.push(gpath);
      copiedImages.add(gpath);
    }
  }

  // Clean description: strip VC shortcodes if any leaked in
  let description = product.content_html || '';
  description = description.replace(/\[vc_[^\]]*\]/g, '').replace(/\[\/vc_[^\]]*\]/g, '').trim();

  const productData = {
    id: parseInt(id),
    title: product.title,
    slug,
    description,
    excerpt: product.excerpt || '',
    price: priceData.price ?? null,
    regularPrice: priceData.regularPrice ?? null,
    salePrice: priceData.salePrice ?? null,
    sku: priceData.sku ?? null,
    stockStatus: priceData.stockStatus ?? 'instock',
    weight: priceData.weight ?? null,
    categories: cats,
    featuredImage: featuredImagePath,
    galleryImages: galleryPaths,
    seoTitle: product.seo_title || `${product.title} - Ceramiche Da Mario`,
    seoDescription: product.seo_description || product.excerpt || '',
    date: product.date,
  };

  fs.writeFileSync(
    path.join(CONTENT_DIR, 'products', `${slug}.json`),
    JSON.stringify(productData, null, 2)
  );
  productCount++;
}

console.log(`  Migrated ${productCount} products`);
console.log(`  Copied ${copiedImages.size} product images`);

// ──────────────────────────────────────────────────────────────
// 2. Migrate Categories
// ──────────────────────────────────────────────────────────────

console.log('\n=== Migrating Categories ===');

let catCount = 0;
for (const cat of productCategories) {
  // Skip empty categories
  if (cat.count === 0) continue;

  const catData = {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: (cat.description || '').replace(/&amp;/g, '&'),
    count: cat.count,
  };

  fs.writeFileSync(
    path.join(CONTENT_DIR, 'categories', `${cat.slug}.json`),
    JSON.stringify(catData, null, 2)
  );
  catCount++;
}

console.log(`  Migrated ${catCount} categories (skipped empty ones)`);

// ──────────────────────────────────────────────────────────────
// 3. Migrate Blog Posts
// ──────────────────────────────────────────────────────────────

console.log('\n=== Migrating Blog Posts ===');

const postsExportDir = path.join(EXPORT_DIR, 'posts');
const postFiles = fs.readdirSync(postsExportDir).filter(f => f.endsWith('.md'));

// Manually craft clean content since posts have VC shortcodes
const postContentMap = {
  'christmas-is-coming': {
    title: 'Christmas is Coming',
    content: `Christmas is approaching and so is Black Friday! We have many items on sale including the beautiful Ceramiche Capodimonte.

Do not hesitate to contact us for price inquiries.

For those who cannot reach us, we will be happy to deliver purchases to your home or ship them to you! We will update you in the coming days with more photos! Don't miss out on our offers to make super original Christmas gifts!`,
  },
  'black-friday': {
    title: 'Black Friday',
    content: `## 30% off on the finest porcelain of Capodimonte for your Black Friday

We ship worldwide!

Capodimonte is the most outstanding factory for early Italian porcelain!

An exclusive offer for all visitors of our website. We ship worldwide!`,
  },
  'look-at-this-wall-goals': {
    title: 'Look at this Wall Goals',
    content: `Do you like our decor for this lovely vacation rental? [Follow us on Facebook](https://www.facebook.com/ceramichedamario) to know more!`,
  },
  '6028': {
    title: 'Hand painted wall plate portrays the beautiful Village of Praiano',
    content: `A beautiful hand-painted wall plate that portrays the scenic Village of Praiano on the Amalfi Coast. Each piece is unique and crafted by skilled artisans from Vietri sul Mare.`,
  },
};

let postCount = 0;
for (const file of postFiles) {
  const raw = fs.readFileSync(path.join(postsExportDir, file), 'utf-8');

  // Parse frontmatter
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) continue;

  const fm = {};
  for (const line of fmMatch[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();
    // Remove quotes
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    fm[key] = val;
  }

  const slug = fm.slug || path.basename(file, '.md');
  const postContent = postContentMap[slug] || postContentMap[fm.slug];

  // Copy featured image
  let featuredImagePath = null;
  if (fm.featured_media) {
    featuredImagePath = copyImage(fm.featured_media, 'posts');
  }

  // Clean seo_description — strip VC shortcodes
  let seoDesc = fm.seo_description || '';
  if (seoDesc.includes('[vc_')) {
    seoDesc = '';
  }

  const frontmatter = [
    '---',
    `title: "${(postContent?.title || fm.title || '').replace(/"/g, '\\"')}"`,
    `slug: "${slug}"`,
    `date: "${fm.date || ''}"`,
    `featuredImage: "${featuredImagePath || ''}"`,
    `seoTitle: "${(fm.seo_title || '').replace(/"/g, '\\"')}"`,
    `seoDescription: "${seoDesc.replace(/"/g, '\\"')}"`,
    '---',
    '',
  ].join('\n');

  const content = postContent?.content || 'Content coming soon.';

  fs.writeFileSync(
    path.join(CONTENT_DIR, 'posts', `${slug}.md`),
    frontmatter + content + '\n'
  );
  postCount++;
}

console.log(`  Migrated ${postCount} blog posts`);

// ──────────────────────────────────────────────────────────────
// 4. Copy Site Images
// ──────────────────────────────────────────────────────────────

console.log('\n=== Copying Site Images ===');

// Key site images referenced in spec
const siteImages = {
  // Hero slides
  'foto-main-new-ceramica.jpg': '2020/12/foto-main-new-ceramica.jpg',
  'shop-praiano-ceramiche.jpg': '2021/05/shop-praiano-ceramiche.jpg',
  '3-foto-main-new-ceramica.jpg': '2020/12/3-foto-main-new-ceramica.jpg',
  // Logos
  'logo-black-ceramica-da-mario.png': '2020/12/logo-black-ceramica-da-mario.png',
  'logo-white-ceramica-da-mario.png': '2020/12/logo-white-ceramica-da-mario.png',
  'ceramicadamariologo-big.png': '2020/12/ceramicadamariologo-big.png',
  // OG image
  '3Linea-Praia-pesci.jpg': '2020/12/3Linea-Praia-pesci.jpg',
};

// Also find images by media ID for specific sections
const siteMediaIds = {
  // Testimonials photo (ID 6149)
  '6149': 'site',
  // Naturarte (ID 6014)
  '6014': 'site',
  // About page (ID 6122)
  '6122': 'site',
  // Photo mosaic IDs
  '6003': 'site',
  '6010': 'site',
  '6002': 'site',
  '6011': 'site',
  '6004': 'site',
};

let siteImageCount = 0;

// Copy named site images
for (const [name, relativePath] of Object.entries(siteImages)) {
  const src = path.join(UPLOADS_DIR, relativePath);
  const dest = path.join(IMAGES_DIR, 'site', name);
  if (fs.existsSync(src) && !fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
    siteImageCount++;
  } else if (!fs.existsSync(src)) {
    console.warn(`  [WARN] Site image not found: ${src}`);
  }
}

// Copy site images by media ID
for (const [mediaId, destSubdir] of Object.entries(siteMediaIds)) {
  const result = copyImage(mediaId, destSubdir);
  if (result) siteImageCount++;
}

console.log(`  Copied ${siteImageCount} site images`);

// ──────────────────────────────────────────────────────────────
// Summary
// ──────────────────────────────────────────────────────────────

console.log('\n=== Migration Complete ===');
console.log(`  Products: ${productCount}`);
console.log(`  Categories: ${catCount}`);
console.log(`  Blog posts: ${postCount}`);
console.log(`  Product images: ${copiedImages.size}`);
console.log(`  Site images: ${siteImageCount}`);

// Verify counts
const productJsons = fs.readdirSync(path.join(CONTENT_DIR, 'products')).filter(f => f.endsWith('.json'));
const categoryJsons = fs.readdirSync(path.join(CONTENT_DIR, 'categories')).filter(f => f.endsWith('.json'));
const postMds = fs.readdirSync(path.join(CONTENT_DIR, 'posts')).filter(f => f.endsWith('.md'));

console.log('\n=== Verification ===');
console.log(`  Product JSONs in content: ${productJsons.length}`);
console.log(`  Category JSONs in content: ${categoryJsons.length}`);
console.log(`  Post MDs in content: ${postMds.length}`);

const allProductImages = fs.readdirSync(path.join(IMAGES_DIR, 'products'));
const allSiteImages = fs.readdirSync(path.join(IMAGES_DIR, 'site'));
const allPostImages = fs.readdirSync(path.join(IMAGES_DIR, 'posts'));
console.log(`  Product images: ${allProductImages.length}`);
console.log(`  Site images: ${allSiteImages.length}`);
console.log(`  Post images: ${allPostImages.length}`);
