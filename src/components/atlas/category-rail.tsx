import type { Category } from "@/data/schema";

type CategoryRailProps = {
  categories: readonly Category[];
  counts: ReadonlyMap<string, number>;
  selectedCategoryId: string | null;
  totalCount: number;
  onSelect: (categoryId: string | null) => void;
};

export function CategoryRail({
  categories,
  counts,
  selectedCategoryId,
  totalCount,
  onSelect,
}: CategoryRailProps) {
  return (
    <nav className="category-rail" aria-label="Capability categories">
      <p className="filter-kicker">Browse taxonomy</p>
      <button
        className="category-button"
        type="button"
        aria-label={`All categories ${totalCount}`}
        aria-pressed={selectedCategoryId === null}
        onClick={() => onSelect(null)}
      >
        <span>All categories</span>
        <span className="category-button__count">{totalCount}</span>
      </button>
      {categories.map((category) => (
        <button
          className="category-button"
          type="button"
          aria-label={`${category.name} ${counts.get(category.id) ?? 0}`}
          aria-pressed={selectedCategoryId === category.id}
          key={category.id}
          onClick={() => onSelect(category.id)}
        >
          <span>{category.name}</span>
          <span className="category-button__count">
            {counts.get(category.id) ?? 0}
          </span>
        </button>
      ))}
    </nav>
  );
}
