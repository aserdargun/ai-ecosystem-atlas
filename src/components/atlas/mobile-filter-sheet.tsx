import type { ReactNode } from "react";

export function MobileFilterSheet({ children }: { children: ReactNode }) {
  return (
    <details className="mobile-filter-sheet" open>
      <summary>Categories &amp; filters</summary>
      <div
        className="mobile-filter-sheet__panel"
        aria-label="Atlas categories and filters"
      >
        {children}
      </div>
    </details>
  );
}
