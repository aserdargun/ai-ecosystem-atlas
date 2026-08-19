"use client";

import {
  useDeferredValue,
  useMemo,
  useState,
  useSyncExternalStore,
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
import { VendorMatrix } from "@/components/atlas/vendor-matrix";
import type {
  AtlasDataset,
  Availability,
  ComparisonStatus,
} from "@/data/schema";
import {
  buildCategoryCounts,
  buildComparisonRows,
  buildVendorMatrix,
  filterComparisonRows,
  filterVendorMatrix,
} from "@/lib/comparison";
import type { Freshness } from "@/lib/freshness";
import {
  downloadFile,
  toCsv,
  toExcelXml,
  type ExportTable,
} from "@/lib/export";
import {
  atlasViewLabels,
  availabilityLabels,
  comparisonStatusLabels,
} from "@/lib/labels";
import {
  defaultAtlasState,
  parseUrlState,
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

type AtlasStateStore = {
  subscribe(listener: () => void): () => void;
  getSnapshot(): AtlasState;
  getServerSnapshot(): AtlasState;
  getState(): AtlasState;
  setState(nextState: AtlasState): void;
};

function createAtlasStateStore(dataset: AtlasDataset): AtlasStateStore {
  const serverSnapshot = copyAtlasState(defaultAtlasState);
  let state =
    typeof window === "undefined"
      ? serverSnapshot
      : parseUrlState(new URLSearchParams(window.location.search), dataset);
  const listeners = new Set<() => void>();

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      return state;
    },
    getServerSnapshot() {
      return serverSnapshot;
    },
    getState() {
      return state;
    },
    setState(nextState) {
      state = nextState;
      for (const listener of listeners) {
        listener();
      }
    },
  };
}

export function ResearchConsole({ dataset }: { dataset: AtlasDataset }) {
  const router = useRouter();
  const [stateStore] = useState(() => createAtlasStateStore(dataset));
  const state = useSyncExternalStore(
    stateStore.subscribe,
    stateStore.getSnapshot,
    stateStore.getServerSnapshot,
  );
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
  const allMatrixRows = useMemo(() => buildVendorMatrix(dataset), [dataset]);
  const matrixRows = useMemo(
    () => filterVendorMatrix(allMatrixRows, filterState),
    [allMatrixRows, filterState],
  );

  function writeUrl(state: AtlasState) {
    const params = serializeUrlState(state);
    const suffix = params.toString();
    router.replace(suffix ? `/?${suffix}` : "/", { scroll: false });
  }

  function commitState(nextState: AtlasState, urgent = false) {
    setExpandedRowId(null);
    writeUrl(nextState);

    if (urgent) {
      stateStore.setState(nextState);
      return;
    }

    startTransition(() => stateStore.setState(nextState));
  }

  function applyFilter(update: (current: AtlasState) => AtlasState) {
    commitState(update(stateStore.getState()));
  }

  function handleQueryChange(nextQuery: string) {
    const limitedQuery = nextQuery.slice(0, 120);
    commitState({ ...stateStore.getState(), query: limitedQuery }, true);
  }

  function handleVendorChange(side: "left" | "right", vendorId: string) {
    if (!vendorById.has(vendorId)) return;
    const current = stateStore.getState();
    if (side === "left" && vendorId !== current.rightVendorId) {
      applyFilter((latest) => ({ ...latest, leftVendorId: vendorId }));
    }
    if (side === "right" && vendorId !== current.leftVendorId) {
      applyFilter((latest) => ({ ...latest, rightVendorId: vendorId }));
    }
  }

  function swapVendors() {
    applyFilter((current) => ({
      ...current,
      leftVendorId: current.rightVendorId,
      rightVendorId: current.leftVendorId,
    }));
  }

  function resetFilters() {
    commitState({
      ...copyAtlasState(defaultAtlasState),
      view: stateStore.getState().view,
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

  const resultCount = view === "all-vendors" ? matrixRows.length : visibleRows.length;

  const exportTable: ExportTable =
    view === "all-vendors"
      ? {
          headers: [
            "Category",
            "Capability",
            ...dataset.vendors.map((vendor) => vendor.name),
            "Coverage",
          ],
          rows: matrixRows.map((row) => [
            row.category.name,
            row.capability.name,
            ...row.cells.map((cell) => availabilityLabels[cell.entry.availability]),
            Math.round(row.score * 100) + "%",
          ]),
        }
      : {
          headers: [
            "Category",
            "Capability",
            leftVendor.name + " availability",
            leftVendor.name,
            rightVendor.name + " availability",
            rightVendor.name,
            "Assessment",
            "Verified",
          ],
          rows: visibleRows.map((row) => [
            row.category.name,
            row.capability.name,
            availabilityLabels[row.leftEntry.availability],
            row.leftEntry.title,
            availabilityLabels[row.rightEntry.availability],
            row.rightEntry.title,
            comparisonStatusLabels[row.assessment.status],
            row.leftEntry.verifiedAt ?? row.rightEntry.verifiedAt ?? "",
          ]),
        };

  function handleExportCsv() {
    downloadFile(
      "ai-ecosystem-atlas-" + view + ".csv",
      toCsv(exportTable),
      "text/csv;charset=utf-8",
    );
  }

  function handleExportExcel() {
    downloadFile(
      "ai-ecosystem-atlas-" + view + ".xls",
      toExcelXml(exportTable),
      "application/vnd.ms-excel",
    );
  }

  return (
    <section className="research-console" aria-label="Research Console">
      <div className="console-toolbar">
        <FilterToolbar
          query={query}
          vendors={dataset.vendors}
          leftVendorId={leftVendorId}
          rightVendorId={rightVendorId}
          resultCount={resultCount}
          isFiltered={isFiltered}
          isPending={isPending || query !== deferredQuery}
          view={view}
          onQueryChange={handleQueryChange}
          onVendorChange={handleVendorChange}
          onSwapVendors={swapVendors}
          onReset={resetFilters}
        />
        <div className="console-toolbar__side">
          <div className="view-toggle" role="group" aria-label="Comparison view">
            {(["explorer", "vendors", "all-vendors"] as const).map((viewValue) => (
              <button
                type="button"
                aria-pressed={view === viewValue}
                key={viewValue}
                onClick={() =>
                  applyFilter((current) => ({ ...current, view: viewValue }))
                }
              >
                {atlasViewLabels[viewValue]}
              </button>
            ))}
          </div>
          <div className="export-controls" role="group" aria-label="Export results">
            <button type="button" onClick={handleExportCsv}>
              Export CSV
            </button>
            <button type="button" onClick={handleExportExcel}>
              Export Excel
            </button>
          </div>
        </div>
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
          {view === "all-vendors" ? (
            matrixRows.length > 0 ? (
              <VendorMatrix rows={matrixRows} vendors={dataset.vendors} />
            ) : (
              <EmptyState constraints={constraints} onReset={resetFilters} />
            )
          ) : visibleRows.length > 0 ? (
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
