"use client";

import {
  useDeferredValue,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { CategoryRail } from "@/components/atlas/category-rail";
import { ComparisonTable } from "@/components/atlas/comparison-table";
import { EmptyState } from "@/components/atlas/empty-state";
import {
  FilterGroups,
  FilterToolbar,
} from "@/components/atlas/filter-toolbar";
import { MobileFilterSheet } from "@/components/atlas/mobile-filter-sheet";
import { VendorComparison } from "@/components/atlas/vendor-comparison";
import type {
  AtlasDataset,
  Availability,
  ComparisonStatus,
} from "@/data/schema";
import {
  buildCategoryCounts,
  buildComparisonRows,
  filterComparisonRows,
} from "@/lib/comparison";
import type { Freshness } from "@/lib/freshness";
import {
  defaultAtlasState,
  serializeUrlState,
  type AtlasState,
} from "@/lib/url-state";

function toggleValue<Value extends string>(
  values: readonly Value[],
  value: Value,
): Value[] {
  return values.includes(value)
    ? values.filter((candidate) => candidate !== value)
    : [...values, value];
}

function copyAtlasState(state: Readonly<AtlasState>): AtlasState {
  return {
    ...state,
    availability: [...state.availability],
    statuses: [...state.statuses],
    freshness: [...state.freshness],
  };
}

export function ResearchConsole({
  dataset,
  initialState,
}: {
  dataset: AtlasDataset;
  initialState: Readonly<AtlasState>;
}) {
  const router = useRouter();
  const [state, setState] = useState(() => copyAtlasState(initialState));
  const latestState = useRef(state);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    query,
    categoryId,
    leftVendorId,
    rightVendorId,
    availability,
    statuses,
    freshness,
    view,
  } = state;
  const deferredQuery = useDeferredValue(query);

  const vendorById = useMemo(
    () => new Map(dataset.vendors.map((vendor) => [vendor.id, vendor])),
    [dataset.vendors],
  );
  const allRows = useMemo(
    () => buildComparisonRows(dataset, leftVendorId, rightVendorId),
    [dataset, leftVendorId, rightVendorId],
  );
  const filterState = useMemo(
    () => ({
      query: deferredQuery,
      categoryId,
      availability,
      statuses,
      freshness,
    }),
    [deferredQuery, categoryId, availability, statuses, freshness],
  );
  const visibleRows = useMemo(
    () => filterComparisonRows(allRows, filterState),
    [allRows, filterState],
  );
  const categoryCounts = useMemo(
    () => buildCategoryCounts(allRows, filterState),
    [allRows, filterState],
  );
  const allCategoryCount = useMemo(
    () =>
      Array.from(categoryCounts.values()).reduce(
        (total, count) => total + count,
        0,
      ),
    [categoryCounts],
  );
  const categoryById = useMemo(
    () => new Map(dataset.categories.map((category) => [category.id, category])),
    [dataset.categories],
  );

  function writeUrl(state: AtlasState) {
    const params = serializeUrlState(state);
    const suffix = params.toString();
    router.replace(suffix ? `/?${suffix}` : "/", { scroll: false });
  }

  function commitState(nextState: AtlasState, urgent = false) {
    latestState.current = nextState;
    setExpandedRowId(null);
    writeUrl(nextState);

    if (urgent) {
      setState(nextState);
      return;
    }

    startTransition(() => setState(nextState));
  }

  function applyFilter(update: (current: AtlasState) => AtlasState) {
    commitState(update(latestState.current));
  }

  function handleQueryChange(nextQuery: string) {
    const limitedQuery = nextQuery.slice(0, 120);
    commitState({ ...latestState.current, query: limitedQuery }, true);
  }

  function handleVendorChange(side: "left" | "right", vendorId: string) {
    if (!vendorById.has(vendorId)) return;
    const current = latestState.current;
    if (side === "left" && vendorId !== current.rightVendorId) {
      applyFilter((latest) => ({ ...latest, leftVendorId: vendorId }));
    }
    if (side === "right" && vendorId !== current.leftVendorId) {
      applyFilter((latest) => ({ ...latest, rightVendorId: vendorId }));
    }
  }

  function resetFilters() {
    commitState({
      ...copyAtlasState(defaultAtlasState),
      view: latestState.current.view,
    });
  }

  const leftVendor = vendorById.get(leftVendorId);
  const rightVendor = vendorById.get(rightVendorId);
  if (!leftVendor || !rightVendor) {
    return null;
  }

  const isFiltered =
    query !== defaultAtlasState.query ||
    categoryId !== defaultAtlasState.categoryId ||
    leftVendorId !== defaultAtlasState.leftVendorId ||
    rightVendorId !== defaultAtlasState.rightVendorId ||
    availability.length > 0 ||
    statuses.length > 0 ||
    freshness.length > 0;
  const constraints = [
    query ? `search “${query}”` : null,
    categoryId ? `category ${categoryById.get(categoryId)?.name ?? categoryId}` : null,
    availability.length ? `${availability.length} availability filter(s)` : null,
    statuses.length ? `${statuses.length} comparison status filter(s)` : null,
    freshness.length ? `${freshness.length} freshness filter(s)` : null,
  ].filter((value): value is string => value !== null);

  return (
    <section className="research-console" aria-label="Research Console">
      <FilterToolbar
        query={query}
        vendors={dataset.vendors}
        leftVendorId={leftVendorId}
        rightVendorId={rightVendorId}
        resultCount={visibleRows.length}
        isFiltered={isFiltered}
        isPending={isPending || query !== deferredQuery}
        onQueryChange={handleQueryChange}
        onVendorChange={handleVendorChange}
        onReset={resetFilters}
      />
      <div className="view-toggle" role="group" aria-label="Comparison view">
        <button
          type="button"
          aria-pressed={view === "explorer"}
          onClick={() =>
            applyFilter((current) => ({ ...current, view: "explorer" }))
          }
        >
          Explorer
        </button>
        <button
          type="button"
          aria-pressed={view === "vendors"}
          onClick={() =>
            applyFilter((current) => ({ ...current, view: "vendors" }))
          }
        >
          Vendor comparison
        </button>
      </div>
      <div className="console-body">
        <MobileFilterSheet>
          <CategoryRail
            categories={dataset.categories}
            counts={categoryCounts}
            selectedCategoryId={categoryId}
            totalCount={allCategoryCount}
            onSelect={(value) =>
              applyFilter((current) => ({ ...current, categoryId: value }))
            }
          />
          <FilterGroups
            availability={availability}
            statuses={statuses}
            freshness={freshness}
            onAvailabilityChange={(value: Availability) =>
              applyFilter((current) => ({
                ...current,
                availability: toggleValue(current.availability, value),
              }))
            }
            onStatusChange={(value: ComparisonStatus) =>
              applyFilter((current) => ({
                ...current,
                statuses: toggleValue(current.statuses, value),
              }))
            }
            onFreshnessChange={(value: Freshness) =>
              applyFilter((current) => ({
                ...current,
                freshness: toggleValue(current.freshness, value),
              }))
            }
          />
        </MobileFilterSheet>
        <div className="comparison-surface">
          {visibleRows.length > 0 ? (
            view === "explorer" ? (
              <ComparisonTable
                rows={visibleRows}
                leftVendor={leftVendor}
                rightVendor={rightVendor}
                expandedRowId={expandedRowId}
                onToggleRow={(rowId) =>
                  setExpandedRowId((current) => (current === rowId ? null : rowId))
                }
              />
            ) : (
              <VendorComparison
                rows={visibleRows}
                leftVendor={leftVendor}
                rightVendor={rightVendor}
                categories={dataset.categories}
                models={dataset.models}
                plans={dataset.plans}
                sources={dataset.sources}
              />
            )
          ) : (
            <EmptyState constraints={constraints} onReset={resetFilters} />
          )}
        </div>
      </div>
    </section>
  );
}
