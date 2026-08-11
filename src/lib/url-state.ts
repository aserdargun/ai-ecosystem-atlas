import {
  availabilityValues,
  comparisonStatusValues,
  type AtlasDataset,
  type Availability,
  type ComparisonStatus,
} from "@/data/schema";
import { freshnessValues, type Freshness } from "@/lib/freshness";

export type AtlasView = "explorer" | "vendors";

export type AtlasState = {
  query: string;
  categoryId: string | null;
  leftVendorId: string;
  rightVendorId: string;
  availability: Availability[];
  statuses: ComparisonStatus[];
  freshness: Freshness[];
  view: AtlasView;
};

export const defaultAtlasState: Readonly<AtlasState> = Object.freeze({
  query: "",
  categoryId: null,
  leftVendorId: "anthropic",
  rightVendorId: "openai",
  availability: [],
  statuses: [],
  freshness: [],
  view: "explorer",
});

type SearchParams = Pick<URLSearchParams, "get">;

function validVendorPair(dataset: AtlasDataset): [string, string] {
  const vendorIds = new Set(dataset.vendors.map((vendor) => vendor.id));

  if (
    vendorIds.has(defaultAtlasState.leftVendorId) &&
    vendorIds.has(defaultAtlasState.rightVendorId)
  ) {
    return [defaultAtlasState.leftVendorId, defaultAtlasState.rightVendorId];
  }

  return [dataset.vendors[0]?.id ?? "", dataset.vendors[1]?.id ?? ""];
}

function parseValues<T extends string>(
  value: string | null,
  allowed: readonly T[],
): T[] {
  if (!value) {
    return [];
  }

  const selected = new Set(value.split(","));
  return allowed.filter((item) => selected.has(item));
}

export function parseUrlState(
  searchParams: SearchParams,
  dataset: AtlasDataset,
): AtlasState {
  const [fallbackLeftVendorId, fallbackRightVendorId] = validVendorPair(dataset);
  const vendorIds = new Set(dataset.vendors.map((vendor) => vendor.id));
  const requestedLeftVendorId = searchParams.get("left");
  const requestedRightVendorId = searchParams.get("right");
  const validPair =
    requestedLeftVendorId !== null &&
    requestedRightVendorId !== null &&
    vendorIds.has(requestedLeftVendorId) &&
    vendorIds.has(requestedRightVendorId) &&
    requestedLeftVendorId !== requestedRightVendorId;
  const categoryId = searchParams.get("category");

  return {
    query: (searchParams.get("q") ?? "").slice(0, 120),
    categoryId:
      categoryId !== null && dataset.categories.some((category) => category.id === categoryId)
        ? categoryId
        : null,
    leftVendorId: validPair ? requestedLeftVendorId : fallbackLeftVendorId,
    rightVendorId: validPair ? requestedRightVendorId : fallbackRightVendorId,
    availability: parseValues(searchParams.get("availability"), availabilityValues),
    statuses: parseValues(searchParams.get("status"), comparisonStatusValues),
    freshness: parseValues(searchParams.get("freshness"), freshnessValues),
    view: searchParams.get("view") === "vendors" ? "vendors" : "explorer",
  };
}

function canonicalValues<T extends string>(values: readonly T[], allowed: readonly T[]): string {
  const selected = new Set(values);
  return allowed.filter((item) => selected.has(item)).join(",");
}

export function serializeUrlState(state: AtlasState): URLSearchParams {
  const searchParams = new URLSearchParams();
  const query = state.query.slice(0, 120);

  if (query) searchParams.set("q", query);
  if (state.categoryId) searchParams.set("category", state.categoryId);
  if (
    state.leftVendorId !== defaultAtlasState.leftVendorId ||
    state.rightVendorId !== defaultAtlasState.rightVendorId
  ) {
    searchParams.set("left", state.leftVendorId);
    searchParams.set("right", state.rightVendorId);
  }

  const availability = canonicalValues(state.availability, availabilityValues);
  const statuses = canonicalValues(state.statuses, comparisonStatusValues);
  const freshness = canonicalValues(state.freshness, freshnessValues);

  if (availability) searchParams.set("availability", availability);
  if (statuses) searchParams.set("status", statuses);
  if (freshness) searchParams.set("freshness", freshness);
  if (state.view !== defaultAtlasState.view) searchParams.set("view", state.view);

  return searchParams;
}
