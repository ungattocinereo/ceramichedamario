interface Category {
  name: string;
  slug: string;
  count: number;
  href?: string;
}

interface Props {
  categories: Category[];
  currentSlug?: string;
  allProductsLabel?: string;
  categoriesLabel?: string;
  shopHref?: string;
}

export default function CategoryFilter({
  categories,
  currentSlug,
  allProductsLabel = 'All Products',
  categoriesLabel = 'Categories',
  shopHref = '/shop',
}: Props) {
  return (
    <aside className="w-full">
      <h3 className="eyebrow mb-3">{categoriesLabel}</h3>
      <ul className="space-y-1">
        <li>
          <a
            href={shopHref}
            className={`block py-1.5 text-sm transition-colors ${
              !currentSlug ? 'text-primary font-bold' : 'text-gray-600 hover:text-primary'
            }`}
          >
            {allProductsLabel}
          </a>
        </li>
        {categories.map((cat) => (
          <li key={cat.slug}>
            <a
              href={cat.href || `/shop/${cat.slug}`}
              className={`block py-1.5 text-sm transition-colors ${
                currentSlug === cat.slug ? 'text-primary font-bold' : 'text-gray-600 hover:text-primary'
              }`}
            >
              {cat.name} <span className="text-gray-400">({cat.count})</span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
