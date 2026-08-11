"use client";

import { useDeferredValue, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CategoryRail } from "@/components/atlas/category-rail";
import { ComparisonTable } from "@/components/atlas/comparison-table";
import { EmptyState } from "@/components/atlas/empty-state";
import {
  FilterGroups,
  FilterToolbar,
} from "@/components/atlas/filter-toolbar";
import { MobileFilterSheet } from "@/components/atlas/mobile-filter-sheet";
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

export function ResearchConsole({
  dataset,
  initialState,
}: {
  dataset: AtlasDataset;
  initialState: Readonly<AtlasState>;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialState.query);
  const [categoryId, setCategoryId] = useState(initialState.categoryId);
  const [leftVendorId, setLeftVendorId] = useState(initialState.leftVendorId);
  const [rightVendorId, setRightVendorId] = useState(initialState.rightVendorId);
  const [availability, setAvailability] = useState(initialState.availability);
  const [statuses, setStatuses] = useState(initialState.statuses);
  const [freshness, setFreshness] = useState(initialState.freshness);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
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
  const categoryById = useMemo(
    () => new Map(dataset.categories.map((category) => [category.id, category])),
    [dataset.categories],
  );

  const currentState: AtlasState = {
    query,
    categoryId,
    leftVendorId,
    rightVendorId,
    availability: [...availability],
    statuses: [...statuses],
    freshness: [...freshness],
    view: initialState.view,
  };

  function writeUrl(state: AtlasState) {
    const params = serializeUrlState(state);
    const suffix = params.toString();
    router.replace(suffix ? `/?${suffix}` : "/", { scroll: false });
  }

  function applyFilter(update: Partial<AtlasState>) {
    const nextState = { ...currentState, ...update };
    startTransition(() => {
      if ("categoryId" in update) setCategoryId(nextState.categoryId);
      if ("leftVendorId" in update) setLeftVendorId(nextState.leftVendorId);
      if ("rightVendorId" in update) setRightVendorId(nextState.rightVendorId);
      if ("availability" in update) setAvailability(nextState.availability);
      if ("statuses" in update) setStatuses(nextState.statuses);
      if ("freshness" in update) setFreshness(nextState.freshness);
      setExpandedRowId(null);
      writeUrl(nextState);
    });
  }

  function handleQueryChange(nextQuery: string) {
    const limitedQuery = nextQuery.slice(0, 120);
    setQuery(limitedQuery);
    setExpandedRowId(null);
    writeUrl({ ...currentState, query: limitedQuery });
  }

  function handleVendorChange(side: "left" | "right", vendorId: string) {
    if (!vendorById.has(vendorId)) return;
    if (side === "left" && vendorId !== rightVendorId) {
      applyFilter({ leftVendorId: vendorId });
    }
    if (side === "right" && vendorId !== leftVendorId) {
      applyFilter({ rightVendorId: vendorId });
    }
  }

  function resetFilters() {
    startTransition(() => {
      setQuery(defaultAtlasState.query);
      setCategoryId(defaultAtlasState.categoryId);
      setLeftVendorId(defaultAtlasState.leftVendorId);
      setRightVendorId(defaultAtlasState.rightVendorId);
      setAvailability([...defaultAtlasState.availability]);
      setStatuses([...defaultAtlasState.statuses]);
      setFreshness([...defaultAtlasState.freshness]);
      setExpandedRowId(null);
      writeUrl({ ...defaultAtlasState });
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
      <div className="console-body">
        <MobileFilterSheet>
          <CategoryRail
            categories={dataset.categories}
            counts={categoryCounts}
            selectedCategoryId={categoryId}
            totalCount={allRows.length}
            onSelect={(value) => applyFilter({ categoryId: value })}
          />
          <FilterGroups
            availability={availability}
            statuses={statuses}
            freshness={freshness}
            onAvailabilityChange={(value: Availability) =>
              applyFilter({ availability: toggleValue(availability, value) })
            }
            onStatusChange={(value: ComparisonStatus) =>
              applyFilter({ statuses: toggleValue(statuses, value) })
            }
            onFreshnessChange={(value: Freshness) =>
              applyFilter({ freshness: toggleValue(freshness, value) })
            }
          />
        </MobileFilterSheet>
        <div className="comparison-surface">
          {visibleRows.length > 0 ? (
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
            <EmptyState constraints={constraints} onReset={resetFilters} />
          )}
        </div>
      </div>
    </section>
  );
}
