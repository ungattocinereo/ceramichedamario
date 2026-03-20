interface Category {
  name: string;
  slug: string;
  count: number;
}

interface Props {
  categories: Category[];
  currentSlug?: string;
}

export default function CategoryFilter({ categories, currentSlug }: Props) {
  return (
    <aside className="w-full">
      <h3 className="eyebrow mb-3">Categories</h3>
      <ul className="space-y-1">
        <li>
          <a
            href="/shop"
            className={`block py-1.5 text-sm transition-colors ${
              !currentSlug ? 'text-primary font-bold' : 'text-gray-600 hover:text-primary'
            }`}
          >
            All Products
          </a>
        </li>
        {categories.map((cat) => (
          <li key={cat.slug}>
            <a
              href={`/shop/${cat.slug}`}
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
