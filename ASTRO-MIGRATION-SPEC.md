# Ceramiche Da Mario — Astro Migration Spec

> Комплексная спецификация для воссоздания сайта ceramichedamario.com на Astro.
> Источник данных: WordPress + WooCommerce export в `./export/`

---

## 1. О бизнесе

- **Название:** Ceramiche Da Mario
- **Слоган:** Fine ceramics of Amalfi coast
- **Основан:** 1960 год, основатель — Марио (портной из Позитано, ставший торговцем керамикой)
- **Текущие владельцы:** дочери Марио — Teresa, Anna, Mariella (семья Rispoli)
- **Адрес:** Piazzetta Gennaro Gagliano 108, 84010 Praiano (SA), Italy
- **Телефон:** +39 338 361 2306
- **Email:** ceramichedamario@hotmail.it
- **Google Maps:** https://g.page/ceramiche-da-mario
- **Instagram:** https://www.instagram.com/ceramichedamariopraiano/
- **Специализация:** ручная роспись керамики Vietri sul Mare, Амальфитанское побережье
- **Валюта:** EUR
- **Страна:** Италия (IT:SA — Salerno)

---

## 2. Структура сайта (Sitemap)

```
/                    — Главная (лендинг)
/about               — О магазине (история семьи)
/shop                — Каталог товаров (без корзины пока, только витрина)
/shop/[category]     — Категория товаров
/shop/[slug]         — Карточка товара
/news                — Блог / новости
/news/[slug]         — Пост блога
/contact             — Контакты + форма обратной связи
```

---

## 3. Навигация (Header)

### Формат хедера
- **Тип:** Centered menu bottom bar (логотип по центру сверху, меню под ним)
- **Логотип:** `logo-black-ceramica-da-mario.png` (основной), `logo-white-ceramica-da-mario.png` (для тёмных фонов)
- **Высота логотипа:** 60px
- **Padding:** 23px

### Пункты меню
```
Home | Shop ▾ | About | News | Contact
               ├── Fine Ceramics
               ├── Kitchen Objects
               ├── Decoration
               ├── Collections ▾
               │   ├── Linea Arcobaleno
               │   ├── Linea Piazzetta
               │   └── Moro's Heads
               └── All Products
```

### Мобильная навигация
- Hamburger-меню (slide-out)
- Текст в slide-out: "The best in Praiano" / "Family running ceramic shop. Fine quality goods. Quality service."
- Адрес: "Praiano, Piazzetta Gennaro Gagliano 108, tel: +39 338 361 2306"

---

## 4. Типографика (Google Fonts)

### Шрифты
| Роль | Шрифт | Вес | Размер | Межстрочный |
|------|--------|-----|--------|-------------|
| **Навигация** | Arimo | 400 | 16px | 16px |
| **Навигация dropdown** | Arimo | 400 | 14px | 18px |
| **Заголовки H1** | Pacifico | 400 | 70px | 83px |
| **Заголовки H2** | Arimo | 700 | 48px | 56px |
| **Заголовки H3** | Arimo | 400 | 18px | 26px |
| **Body текст** | Arimo | 400 | 16px | 22px |
| **Кнопки** | Arimo | 400 | 14px | 25px |
| **Italic / Акценты** | Pacifico | 400 | 14px | 22px |
| **Slider заголовок** | Arimo | 700 | 62px | 70px |
| **Slider подпись** | Poppins | 500 | 18px | 34px |
| **Подзаголовки страниц** | Pacifico | 400 | 55px | 70px |
| **WooCommerce title** | Arimo | 700 | 66px | 56px |
| **Sidebar/Footer** | Arimo | 700 | 16px | 16px |

### Responsive-масштабирование заголовков
| | Desktop | Small Desktop | Tablet | Phone |
|--|---------|---------------|--------|-------|
| H1 | 100% | 75% | 70% | 65% |
| H2 | 100% | 85% | 80% | 70% |
| H3 | 100% | 85% | 80% | 70% |
| H4-H6 | 100% | 100% | 90% | 90% |

### Подключение
```html
<link href="https://fonts.googleapis.com/css2?family=Arimo:ital,wght@0,400;0,700;1,400&family=Pacifico&family=Poppins:wght@500&display=swap" rel="stylesheet">
```

---

## 5. Цветовая палитра

| Имя | HEX | Использование |
|-----|-----|---------------|
| **Accent (Primary)** | `#1440e0` | Ссылки, кнопки по умолчанию |
| **Extra Color 1 (Gold)** | `#f1bc1a` | Акценты, выделения |
| **Extra Color 2 (Orange)** | `#f77f00` | Градиенты, иконки |
| **Extra Color 3 (Dark Orange)** | `#ad3f00` | Градиент accent |
| **Body Text** | `#000000` | Основной текст |
| **Muted Text** | `#7a7a7a` | Вспомогательный текст |
| **Background** | `#ffffff` | Основной фон |
| **Dark Section BG** | `#272729` | Тёмные секции |
| **Hero Overlay** | `#0a0a0a` | Оверлей на слайдере |
| **Highlight Yellow** | `#ffc300` | Подсветка текста |
| **Heading Blue** | `#273a80` | Заголовок на главной |
| **Orange Section** | `#ffae00` / `#ffbd3a` → `#f29900` | Секция отзывов (градиент) |
| **Gold Divider** | `#f5b74a` | Shape divider |
| **Footer BG** | `#f2d379` | Фон футера |
| **Footer Text** | `#000000` | Текст в футере |
| **Footer Secondary** | `#494949` | Вторичный текст футера |

### Градиенты
- **Extra Color Gradient 2:** `#f77f00` → `#ad3f00` (используется в иконках и gradient text)
- **Orange Section:** `#ffbd3a` → `#f29900` (top to bottom)

---

## 6. Стиль компонентов

### Кнопки
- **Стиль:** Slightly rounded with shadow (`border-radius: 4px`, `box-shadow`)
- **Текст:** Capitalize, Arimo 14px
- **Primary:** Accent color (`#1440e0`)
- **Underline CTA:** Текст + подчёркивание (для "To the shop", "Follow us")

### Карточки / Изображения
- **Border radius:** 10px (для featured-изображений)
- **Тени:** x_large_depth shadow на ключевых изображениях
- **Hover:** overlay opacity 0.2 → 0.4

### Формы
- **Input font size:** 14px
- **Стиль полей:** Стандартные с border, focus-state
- **Submit:** Кнопка accent color

---

## 7. Страницы — детальная структура

### 7.1 Главная (`/`)

#### Блок 1: Hero Slider (полноэкранный)
- **Высота:** 785px
- **Анимация:** Ken Burns (zoom) + fade transition
- **Навигация:** Стрелки + bullets (see-through, справа)
- **Автоповорот:** 8 секунд
- **Оверлей:** `#0a0a0a` с opacity
- **Текст:** Light (белый)
- **Выравнивание:** left, middle

**Слайды:**

| # | Заголовок | Подпись | Изображение |
|---|-----------|---------|-------------|
| 1 | Nice and Cosy<br/>Ceramics Shop | We located in Praiano, the Heart of the Amalfi Coast<br/>and sell fine ceramics and quality souvenirs | `foto-main-new-ceramica.jpg` |
| 2 | It is a real<br/>Open-Air Museum | It's Praiano, where art meets nature | `shop-praiano-ceramiche.jpg` |
| 3 | Hand painted<br/>and hand made | Everything is a heart and soul of ancient masters<br/>of Vietri, bring home the authentic Italian craftsmanship | `3-foto-main-new-ceramica.jpg` |

#### Блок 2: Highlighted Text (центр)
- Padding: 4% top, 3% bottom
- Layout: 1/6 | 2/3 | 1/6
- Текст: `"From 1960 we produce best ceramics you can find in Amalfi Coast"` (H2)
- Стиль: Highlight yellow (#ffc300) half-text, цвет текста #273a80
- Italic: "From 1960" и "ceramics" курсивом (Pacifico)

#### Блок 3: Category Grid (Masonry)
- **Тип:** Product Category Grid
- **Категории:** ceramics, decor, kitchen, lights, teste-di-moro, pesci, piatti-murali
- **Колонки:** 4
- **Gap:** 10px
- **Masonry:** Да
- **Стиль:** Content overlaid (текст поверх изображения)
- **Overlay:** `#000000`, opacity 0.2 → 0.4 при hover
- **Текст:** Light, снизу-слева
- **Тени при hover:** Да

#### Блок 4: Отзывы клиентов (оранжевая секция)
- **Фон:** Градиент `#ffbd3a` → `#f29900`
- **Layout:** 3/5 (контент) | 2/5 (фото)
- **Shape divider:** straight_section
- **Заголовок:** "Opinion's important" (H5)
- **Highlighted text:** "Costumers *speaking* about us" (H1, italic Pacifico)
- **Карусель отзывов (Flickity):**
  - Автоповорот: 9 сек
  - Стиль: bold
  - Обтекание: wrap

**Отзывы:**

| Имя | Откуда | Текст (кратко) |
|-----|--------|---------------|
| Anne | USA | "Visited last summer... fell in love with Vietri ceramics... arranged shipment to USA" |
| Timothy | Sydney, Australia | "Discovered shop next to food shop... amazing souvenirs... tiny ceramic cups... ship worldwide" |
| Giulia | Firenze | (итал.) "Нашла через соцсети... быстрая доставка... тарелки красивее чем ожидала" |
| Karl | Germany | "Ciao Teresa, Anna and Mariella! Three sisters running this beautiful shop" |

- **Правая колонка:** Большое фото магазина (image ID 6149), анимация reveal-from-right, высота 100vh

#### Блок 5: Карусель товаров
- **Тип:** WooCommerce Products Carousel (Flickity)
- **Товары:** 8 шт, последние по дате
- **Колонки:** dynamic
- **Управление:** arrows overlaid
- **Обтекание:** wrap
- **Автоповорот:** Да

#### Блок 6: USP секция — "Bring home the Amalfi Coast"
- **Заголовок (split_line):**
  - "Bring home the Amalfi Coast,"
  - "gift an emotion from Praiano."
- **2 колонки с иконками:**

| Иконка | Заголовок | Текст |
|--------|-----------|-------|
| Ship-2 (iconsmind) | SHIPPING WORLDWIDE | "After your order we can talk all the details and will arrange the shipment..." |
| Spring (iconsmind) | TRADITIONAL QUALITY PRODUCTS | "Ceramiche da Mario is located in the heart of Praiano..." |

- **CTA:** "To the shop" (underline style)

#### Блок 7: "Welcome to Praiano" — 2 колонки текста
- **Заголовки (split_line):**
  - "WELCOME TO PRAIANO,"
  - "THE HEART OF THE AMALFI COAST!"
- **Колонка 1:** Описание Praiano (рыбацкая деревня, Li Galli, тишина, виды)
- **Колонка 2:** Capri Faraglioni, Позитано, керамические инсталляции в переулках

#### Блок 8: Naturarte Project
- **Layout:** 1/2 (фото с тенью + border-radius 10px) | 1/2 (текст)
- **Мелкий текст:** "Art works installed around the town are part of the"
- **Заголовок:** "Naturarte Project" (H1, 70px)
- **Описание:** Художники вдохновлялись местными традициями и "street art"
- **Фото:** image ID 6014

#### Блок 9: "Words to live by" (тёмная секция)
- **Фон:** `#272729`, image overlay `rgba(28,28,30,0.93)`
- **Padding:** 15% top, 8% bottom
- **Layout:** 2/3 | 1/3
- **Подзаголовок:** "Words to live by" (H4)
- **Цитата (split_line H3):** "The reason is that we want visitors and travellers to purchase a real souvenir, something that will remind you of this place forever."

#### Блок 10: Gradient Text + описание мастеров
- **Gradient text (H2):** "Our Pieces are hand made by illustrious master craftmen of Vietri sul Mare, where the ceramics tradition was born."
- **Градиент:** extra-color-gradient-2 (diagonal)
- **2 колонки текста:**
  - Цвета вдохновлены природой: синий моря, зелень садов, красный/оранжевый закатов, жёлтый лимонов
  - Мастера используют древние техники: ковка, глазурование, роспись

#### Блок 11: Фотогалерея-мозаика
- **Shape divider:** straight_section, цвет `#f5b74a`, высота 50%
- **Ряд 1:** 1/2 + 1/3 + 1/6 (фото ID: 6003, 6010)
- **Ряд 2:** 1/12 + 1/4 + 1/3 + 1/3 (фото ID: 6002, 6011, 6004)
- **Тени:** x_large_depth на нижнем ряде
- **Анимация:** fade-in

#### Блок 12: Instagram CTA
- **Highlighted text (H1):** "Our *instagram*" (ссылка)
- **CTA:** "Be first to know the news and get deals, Follow" → CeramicheDaMarioPraiano
- **URL:** https://www.instagram.com/ceramichedamariopraiano/

---

### 7.2 О нас (`/about`)

#### Layout
- **Тип:** in_container, column margin 90px
- **Equal height:** yes
- **Content placement:** middle

#### Контент
- **Колонка 1 (50%):** Фоновое изображение (ID: 6122), padding 5%, shadow, border-radius 10px
- **Колонка 2 (50%):** Текст

#### Текст (полный)
**История:**
"Ceramiche da Mario is a shop born in 1960, whose name was chosen by the person who started this activity: Mario, a lovable, sweet and respectful person who knew how to enter everyone's heart. 'Don Mario' was short in stature but with a big heart, which is still remembered today by those who knew him.

He began to work as a tailor in Positano, but, having his own premises in Piazzetta Gagliano in Praiano, he decided to move and set up his own shop. Initially the shop had a slightly different image from the current one and 'Don Mario' immediately, alongside the sale of clothes, also included that of porcelain and terracotta objects, and then a few years later turned to Vietri ceramics, full of bright and cheerful colours.

The transition from clothes to ceramics for Mario was natural because at that time the Amalfi Coast was beginning to be an increasingly popular destination for tourists from abroad, especially from Germany and Mario self-taught conversed with these with properties of language just as if he were one of them.

After Mario's untimely death, the inheritance passed to his daughters, who proudly carried and continue to carry on the business that their father had left them, investing precisely in the Vietri ceramics which still today occupies almost the entire collection of the shop, rigorously produced and hand painted by skilled local artisans, making it accessible anywhere in the world."

**Подзаголовок:** "Quality Over Quantity"
**Девиз:** "Committed to quality. Committed to you."

---

### 7.3 Контакты (`/contact`)

#### Форма обратной связи
**Поля:**

| Поле | Тип | Обязательное | Ширина |
|------|-----|-------------|--------|
| Your name | text (40 chars) | Нет | 1/3 |
| Email | email | Да | 1/3 |
| Phone | tel | Да* | 1/3 |
| Your message | textarea (10 rows, max 2000) | Нет | Full |
| Submit | button | — | Auto |

**Защита:** reCAPTCHA v3
**Текст кнопки:** "Send your request"

#### Контактная информация (оранжевый блок)
- **Фон:** `rgba(255,144,0,0.95)` с тенью
- **Адрес:** Piazzetta Gennaro Gagliano 108, 84010 Praiano (SA)
- **Телефон:** +39 338 361 2306
- **CTA:** "Or you can place your order here in case if you saw something it is not on our website or you want to ask if there are colours and sizes available"
- **Ссылка на карту:** https://g.page/ceramiche-da-mario

---

### 7.4 Каталог (`/shop`)

#### Sidebar (фильтры)
- Фильтр по цене (range)
- Фильтр по цвету (AJAX)
- Сброс фильтров
- Категории товаров (иерархические)

#### Категории товаров (21)

| Категория | Slug | Кол-во | Описание |
|-----------|------|--------|----------|
| Kitchen | kitchen | 53 | Kitchen & Table Furniture |
| Ceramics | ceramics | 42 | — |
| Wall Plates | piatti-murali | 24 | Get Inspired for a wall plate decor |
| Decoration | decor | 12 | Objects and decorations |
| Piazzetta Collection | linea-piazzetta | 11 | Traditional Amalfi Coast pattern with lemons. Dark Blue and Yellow ceramics |
| Moro's Heads | teste-di-moro | 9 | Sculptural ceramic heads |
| Table Lamps | lampadine | 8 | — |
| Praiano Collection | praiano-collection | 8 | — |
| Cachepot | cachepot | 7 | Hand decorated ceramic saucers |
| Vietri Collection | vietri-collection | 7 | — |
| Umbrella Stands | handmade-ceramic-umbrella-stand | 6 | Hand-decorated ceramic umbrella stands |
| Fishes Decor | pesci | 5 | — |
| Arcobaleno Collection | arcobaleno | 5 | Colourful ceramic pattern |
| Barocco Collection | barocco | 4 | — |
| Abat-jour | abat-jour | 2 | — |
| Praia Collection | praia | 1 | — |

#### Данные товара
- **Всего:** 133 товара (+ 118 вариаций = 345 записей)
- **Диапазон цен:** EUR 11.50 — EUR 600.00
- **Средняя цена:** EUR 91.33
- **Единицы:** вес — kg, размеры — cm

#### Карточка товара (данные из export)
```
- ID, slug, title
- Описание (HTML)
- Excerpt (краткое описание)
- Цена: regular_price, sale_price, price
- SKU
- stock_status (instock / outofstock)
- Вес (weight)
- Thumbnail image + gallery images
- Категории
- SEO title + description (Yoast)
```

**Файлы данных:**
- `export/products/*.json` — 133 файла (данные из REST API)
- `export/woocommerce/products_full.json` — 345 записей с ценами и мета (из БД)
- `export/woocommerce/product_galleries.json` — галереи (24 записи)
- `export/woocommerce/product_category_map.json` — маппинг товар→категория (204 записи)
- `export/woocommerce/image_map.json` — ID изображения → URL/путь (375 записей)

---

### 7.5 Новости / Блог (`/news`)

#### Layout
- **Тип:** Masonry blog с sidebar
- **Стиль:** auto_meta_overlaid_spaced
- **Gap:** 4px
- **Сортировка:** DESC по дате

#### Посты (4)

| Заголовок | Дата | Slug |
|-----------|------|------|
| Hand painted wall plate portrays the beautiful Village of Praiano | 2020-12-22 | 6028 |
| Look at this Wall Goals | 2020-12-19 | look-at-this-wall-goals |
| Black Friday — 30% off Capodimonte porcelain | 2020-11-25 | black-friday |
| Christmas is Coming | 2020-11-20 | christmas-is-coming |

**Файлы:** `export/posts/*.md`

---

## 8. Footer

### Текущий footer (минимальный — нужно улучшить)
- **Фон:** `#f2d379` (золотистый)
- **Текст:** `#000000`
- **Вторичный текст:** `#494949`
- **Колонок:** 1
- **Copyright layout:** centered
- **Copyright text:** "© 2020-2021. Visual & some photos..."
- **Footer area 1:** Только Product Categories widget

### Новый footer (рекомендация)

```
┌──────────────────────────────────────────────────────────────────────┐
│  FOOTER BG: #f2d379 (gold)                                          │
│                                                                      │
│  ┌─── Col 1 ───┐  ┌─── Col 2 ───┐  ┌─── Col 3 ───┐  ┌── Col 4 ──┐│
│  │              │  │              │  │              │  │            ││
│  │  [LOGO]      │  │  SHOP        │  │  INFO        │  │  CONTACT   ││
│  │              │  │  Kitchen     │  │  About Us    │  │            ││
│  │  Ceramiche   │  │  Wall Plates │  │  Our Story   │  │  📍 Via... ││
│  │  Da Mario    │  │  Decoration  │  │  News        │  │  📞 +39.. ││
│  │              │  │  Heads       │  │  Shipping    │  │  📧 email  ││
│  │  Fine        │  │  Lamps       │  │  Returns     │  │            ││
│  │  ceramics    │  │  Collections │  │              │  │  [Google   ││
│  │  since 1960  │  │  All Products│  │              │  │   Maps]    ││
│  │              │  │              │  │              │  │            ││
│  │  [Instagram] │  │              │  │              │  │            ││
│  │  [Facebook]  │  │              │  │              │  │            ││
│  │              │  │              │  │              │  │            ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘│
│                                                                      │
│  ─────────────────────────────────────────────────────────────────── │
│  © 2020-2026 Ceramiche Da Mario. Praiano, Amalfi Coast, Italy.      │
│  P.IVA: [номер]                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Колонки:**
1. **Бренд:** Логотип (тёмная версия), слоган "Fine ceramics since 1960", соцсети (Instagram, Facebook)
2. **Каталог:** Ссылки на основные категории товаров
3. **Информация:** About Us, Our Story, News, Shipping Info, Returns Policy
4. **Контакты:** Адрес, телефон, email, ссылка на Google Maps

---

## 9. Технический стек (Astro)

### Рекомендуемый стек
```
Astro 5.x          — SSG framework
Tailwind CSS 4.x   — стилизация
astro:content       — Content Collections для страниц/постов/товаров
React (islands)     — интерактивные компоненты (слайдер, фильтры, форма)
Swiper.js           — слайдер/карусель (замена Nectar Slider + Flickity)
sharp               — оптимизация изображений
```

### Структура проекта
```
src/
├── components/
│   ├── layout/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── MobileNav.tsx          (React island)
│   │   └── Layout.astro
│   ├── home/
│   │   ├── HeroSlider.tsx         (React island — Swiper)
│   │   ├── CategoryGrid.astro
│   │   ├── Testimonials.tsx       (React island — carousel)
│   │   ├── ProductCarousel.tsx    (React island — Swiper)
│   │   ├── USPSection.astro
│   │   ├── PraianoSection.astro
│   │   ├── NaturarteSection.astro
│   │   ├── QuoteSection.astro
│   │   ├── CraftsmenSection.astro
│   │   ├── PhotoMosaic.astro
│   │   └── InstagramCTA.astro
│   ├── shop/
│   │   ├── ProductCard.astro
│   │   ├── ProductGrid.astro
│   │   ├── CategoryFilter.tsx     (React island)
│   │   └── PriceDisplay.astro
│   ├── blog/
│   │   ├── PostCard.astro
│   │   └── MasonryGrid.astro
│   └── ui/
│       ├── Button.astro
│       ├── GradientText.astro
│       ├── HighlightedText.astro
│       ├── SplitLineHeading.astro
│       ├── Icon.astro
│       └── ContactForm.tsx        (React island)
├── content/
│   ├── config.ts                  (content collection schemas)
│   ├── pages/
│   │   ├── about.md
│   │   └── contact.md
│   ├── products/                  (133 .json files from export)
│   ├── posts/                     (4 .md files from export)
│   └── categories/                (из export/taxonomies/)
├── data/
│   ├── testimonials.json
│   ├── navigation.json
│   ├── site-config.json
│   └── slides.json
├── pages/
│   ├── index.astro
│   ├── about.astro
│   ├── contact.astro
│   ├── news/
│   │   ├── index.astro
│   │   └── [slug].astro
│   └── shop/
│       ├── index.astro
│       ├── [category].astro
│       └── [slug].astro
├── styles/
│   └── global.css                 (Tailwind + custom properties)
└── assets/
    └── images/                    (оптимизированные из wp-content/uploads/)
```

---

## 10. SEO

### Мета-данные (из Yoast)
**Файл:** `export/woocommerce/seo_data.json` (148 записей)

| Страница | SEO Title | SEO Description |
|----------|-----------|-----------------|
| Home | Ceramiche Da Mario – fine ceramics shop in Praiano, Amalfi Coast, Italy | One of the best authentic ceramics shops in Amalfi Coast, famous ceramics of Vietri sul Mare. Traditional quality italian presents |
| About | About - Ceramiche Da Mario | — |
| Contact | Contact - Ceramiche Da Mario | — |
| Shop | Shop - Ceramiche Da Mario | — |
| News | News - Ceramiche Da Mario | — |

**Структурированные данные:** JSON-LD (WebPage, WebSite, BreadcrumbList, Product)
**OG Image главной:** `3Linea-Praia-pesci.jpg` (1500x998)
**Canonical URLs:** Нужно настроить для нового домена

---

## 11. Медиа-файлы

### Статистика
- **Всего медиа:** 343 элемента (из REST API)
- **Всего файлов:** ~40,700 (включая thumbnails)
- **Объём uploads:** 472 MB
- **Расположение:** `wp-files/wp-content/uploads/`
- **Маппинг:** `export/media/media_map.json`

### Ключевые изображения
- **Логотип чёрный:** `uploads/2020/12/logo-black-ceramica-da-mario.png`
- **Логотип белый:** `uploads/2020/12/logo-white-ceramica-da-mario.png`
- **Логотип круглый:** `uploads/2020/12/ceramicadamariologo-big.png`
- **Hero slide 1:** `uploads/2020/12/foto-main-new-ceramica.jpg`
- **Hero slide 2:** `uploads/2021/05/shop-praiano-ceramiche.jpg`
- **Hero slide 3:** `uploads/2020/12/3-foto-main-new-ceramica.jpg`
- **OG Image:** `uploads/2020/12/3Linea-Praia-pesci.jpg`

### Оптимизация для Astro
- Использовать `astro:assets` для автоматической оптимизации
- Генерировать WebP/AVIF
- Lazy loading для товаров и галерей
- Preload для hero images

---

## 12. Формы и интерактив

### Контактная форма
- **Текущее решение:** Contact Form 7 + reCAPTCHA v3
- **Рекомендация для Astro:** React-компонент + Formspree / Resend / Netlify Forms
- **Поля:** name, email, phone*, message
- **Валидация:** client-side + server-side
- **Защита от спама:** hCaptcha или Turnstile (Cloudflare)

### Каталог
- **Фильтрация:** По категории, по цвету (React island)
- **Корзина:** Пока не нужна (магазин отложен)
- **Quote request:** Кнопка "Request a Quote" → ведёт на контактную форму

---

## 13. Данные для миграции — файлы

```
export/
├── pages/              — 11 .md файлов (HTML в frontmatter)
├── posts/              — 4 .md файла
├── products/           — 133 .json + _all_products.json
├── media/
│   ├── media_map.json  — 343 записи (ID → path, alt, sizes)
│   └── uploads/        — symlink → wp-files/wp-content/uploads/
├── menus/
│   └── menu_options.json
├── taxonomies/
│   ├── categories.json      — 6 записей (блог)
│   ├── tags.json             — 11 записей
│   └── product_categories.json — 21 запись
├── woocommerce/
│   ├── products_full.json         — 345 записей (с ценами, SKU, мета)
│   ├── product_galleries.json     — 24 записи
│   ├── product_category_map.json  — 204 маппинга
│   ├── image_map.json             — 375 записей (image ID → file path)
│   ├── product_attributes.json    — атрибуты
│   └── seo_data.json              — 148 записей SEO
└── site_options.json              — 16 настроек сайта
```

---

## 14. Анимации

| Элемент | Анимация | Где используется |
|---------|----------|------------------|
| Секции при scroll | fade-in-from-bottom | USP, Praiano, Craftsmen |
| Фото отзывов | ro-reveal-from-right | Testimonials section |
| Изображение Naturarte | fade-in-from-left | Naturarte section |
| Фотогалерея | fade-in | Photo mosaic |
| Заголовки | split_line (default) | Несколько секций |
| Hero slider | Ken Burns (zoom) + fade | Hero |
| Карусели | Flickity wrap | Testimonials, Products |

**Рекомендация:** Intersection Observer API для scroll-анимаций, CSS transitions. Не нужны тяжёлые JS-библиотеки.

---

## 15. Чеклист реализации

- [ ] Инициализировать Astro-проект с Tailwind
- [ ] Настроить Google Fonts (Arimo, Pacifico, Poppins)
- [ ] Задать CSS custom properties (цвета, тени, радиусы)
- [ ] Создать Layout (Header + Footer)
- [ ] Реализовать мобильную навигацию
- [ ] **Главная:** Hero Slider (Swiper.js)
- [ ] **Главная:** Category Grid (masonry)
- [ ] **Главная:** Testimonials Carousel
- [ ] **Главная:** Product Carousel
- [ ] **Главная:** USP Section (shipping + quality)
- [ ] **Главная:** Praiano text section
- [ ] **Главная:** Naturarte section
- [ ] **Главная:** Dark quote section
- [ ] **Главная:** Craftsmen gradient text section
- [ ] **Главная:** Photo Mosaic
- [ ] **Главная:** Instagram CTA
- [ ] **About:** Двухколоночный layout с историей
- [ ] **Contact:** Форма + карточка контактов
- [ ] **Shop:** Product grid с фильтрацией по категориям
- [ ] **Shop/[slug]:** Карточка товара (галерея, описание, цена)
- [ ] **News:** Masonry grid постов
- [ ] **News/[slug]:** Пост
- [ ] **Footer:** 4-колоночный footer
- [ ] SEO: meta tags, OG, JSON-LD
- [ ] Оптимизация изображений (WebP, lazy load)
- [ ] Responsive: mobile-first
- [ ] Scroll-анимации (Intersection Observer)
- [ ] Деплой (Vercel / Netlify / Cloudflare Pages)
