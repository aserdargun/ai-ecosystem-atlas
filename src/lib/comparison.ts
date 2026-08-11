import type {
  AtlasDataset,
  Availability,
  Capability,
  Category,
  ComparisonAssessment,
  ComparisonStatus,
  Source,
  VendorEntry,
} from "@/data/schema";
import { availabilityValues, comparisonStatusValues } from "@/data/schema";
import { classifyFreshness, type Freshness } from "@/lib/freshness";
import { matchesSearch } from "@/lib/search";
import type { AtlasState } from "@/lib/url-state";

export type Immutable<T> = T extends readonly (infer Item)[]
  ? readonly Immutable<Item>[]
  : T extends object
    ? { readonly [Key in keyof T]: Immutable<T[Key]> }
    : T;

export type ComparisonEntry = Readonly<{
  id: VendorEntry["id"];
  capabilityId: VendorEntry["capabilityId"];
  vendorId: VendorEntry["vendorId"];
  title: VendorEntry["title"];
  summary: VendorEntry["summary"];
  details: readonly string[];
  productNames: readonly string[];
  availability: Availability;
  sourceIds: readonly string[];
  verifiedAt: string | null;
}>;

export type ComparisonRow = Readonly<{
  category: Immutable<Category>;
  capability: Immutable<Capability>;
  leftVendorId: string;
  rightVendorId: string;
  leftEntry: ComparisonEntry;
  rightEntry: ComparisonEntry;
  assessment: Immutable<ComparisonAssessment>;
  leftSources: readonly Immutable<Source>[];
  rightSources: readonly Immutable<Source>[];
  searchText: string;
}>;

export type VendorSummary = Readonly<{
  vendorId: string;
  totalCapabilities: number;
  availability: Record<Availability, number>;
  statuses: Record<ComparisonStatus, number>;
  categoryCounts: ReadonlyMap<string, number>;
}>;

function entryKey(capabilityId: string, vendorId: string): string {
  return `${capabilityId}:${vendorId}`;
}

function vendorPairKey(leftVendorId: string, rightVendorId: string): string {
  return [leftVendorId, rightVendorId].sort().join(":");
}

function undocumentedEntry(capabilityId: string, vendorId: string): ComparisonEntry {
  return Object.freeze({
    id: `${capabilityId}-${vendorId}-not-documented`,
    capabilityId,
    vendorId,
    title: "Not documented",
    summary: "No reviewed official documentation was found for this capability.",
    details: Object.freeze([]),
    productNames: Object.freeze([]),
    availability: "not-documented" as const,
    sourceIds: Object.freeze([]),
    verifiedAt: null,
  });
}

function immutableCategory(category: Category): Immutable<Category> {
  return Object.freeze({ ...category });
}

function immutableCapability(capability: Capability): Immutable<Capability> {
  return Object.freeze({
    ...capability,
    tags: Object.freeze([...capability.tags]),
  }) as Immutable<Capability>;
}

function immutableEntry(entry: VendorEntry): ComparisonEntry {
  return Object.freeze({
    ...entry,
    details: Object.freeze([...entry.details]),
    productNames: Object.freeze([...entry.productNames]),
    sourceIds: Object.freeze([...entry.sourceIds]),
  });
}

function immutableAssessment(
  assessment: ComparisonAssessment,
): Immutable<ComparisonAssessment> {
  return Object.freeze({
    ...assessment,
    vendorIds: Object.freeze([...assessment.vendorIds]),
  }) as Immutable<ComparisonAssessment>;
}

function immutableSource(source: Source): Immutable<Source> {
  return Object.freeze({ ...source });
}

function assessmentForPair(
  capabilityId: string,
  leftVendorId: string,
  rightVendorId: string,
  assessments: ReadonlyMap<string, ComparisonAssessment>,
): Immutable<ComparisonAssessment> {
  const assessment = assessments.get(
    `${capabilityId}:${vendorPairKey(leftVendorId, rightVendorId)}`,
  );

  return assessment
    ? immutableAssessment(assessment)
    : immutableAssessment({
        capabilityId,
        vendorIds: [leftVendorId, rightVendorId],
        status: "insufficient-evidence",
        summary: "No reviewed comparison assessment is documented for this vendor pair.",
      });
}

function rowSearchText(
  category: Immutable<Category>,
  capability: Immutable<Capability>,
  leftEntry: ComparisonEntry,
  rightEntry: ComparisonEntry,
  assessment: Immutable<ComparisonAssessment>,
  vendorText: string,
): string {
  return [
    category.name,
    category.shortName,
    category.description,
    capability.name,
    capability.description,
    ...capability.tags,
    leftEntry.title,
    leftEntry.summary,
    ...leftEntry.details,
    ...leftEntry.productNames,
    rightEntry.title,
    rightEntry.summary,
    ...rightEntry.details,
    ...rightEntry.productNames,
    assessment.summary,
    vendorText,
  ].join(" ");
}

export function buildComparisonRows(
  dataset: AtlasDataset,
  leftVendorId: string,
  rightVendorId: string,
): readonly ComparisonRow[] {
  const categories = new Map(
    dataset.categories.map((category) => [category.id, immutableCategory(category)]),
  );
  const entries = new Map(
    dataset.vendorEntries.map((entry) => [entryKey(entry.capabilityId, entry.vendorId), entry]),
  );
  const sources = new Map(
    dataset.sources.map((source) => [source.id, immutableSource(source)]),
  );
  const assessments = new Map(
    dataset.assessments.map((assessment) => [
      `${assessment.capabilityId}:${vendorPairKey(...assessment.vendorIds)}`,
      assessment,
    ]),
  );
  const vendorText = dataset.vendors
    .filter((vendor) => vendor.id === leftVendorId || vendor.id === rightVendorId)
    .flatMap((vendor) => [
      vendor.name,
      vendor.shortName,
      vendor.ecosystemName,
      vendor.description,
      ...dataset.models
        .filter((model) => model.vendorId === vendor.id)
        .flatMap((model) => [model.name, model.family, model.positioning]),
      ...dataset.plans
        .filter((plan) => plan.vendorId === vendor.id)
        .flatMap((plan) => [plan.name, plan.audience, plan.priceDisplay, ...plan.highlights]),
    ])
    .join(" ");

  return Object.freeze(
    dataset.capabilities.map((capability) => {
      const category = categories.get(capability.categoryId);
      if (!category) {
        throw new Error(`Capability ${capability.id} has no category.`);
      }

      const rawLeftEntry = entries.get(entryKey(capability.id, leftVendorId));
      const rawRightEntry = entries.get(entryKey(capability.id, rightVendorId));
      const leftEntry = rawLeftEntry
        ? immutableEntry(rawLeftEntry)
        : undocumentedEntry(capability.id, leftVendorId);
      const rightEntry = rawRightEntry
        ? immutableEntry(rawRightEntry)
        : undocumentedEntry(capability.id, rightVendorId);
      const assessment = assessmentForPair(capability.id, leftVendorId, rightVendorId, assessments);
      const leftSources = Object.freeze(
        leftEntry.sourceIds.flatMap((sourceId) => {
          const source = sources.get(sourceId);
          return source ? [source] : [];
        }),
      );
      const rightSources = Object.freeze(
        rightEntry.sourceIds.flatMap((sourceId) => {
          const source = sources.get(sourceId);
          return source ? [source] : [];
        }),
      );

      return Object.freeze({
        category,
        capability: immutableCapability(capability),
        leftVendorId,
        rightVendorId,
        leftEntry,
        rightEntry,
        assessment,
        leftSources,
        rightSources,
        searchText: rowSearchText(category, capability, leftEntry, rightEntry, assessment, vendorText),
      });
    }),
  );
}

function isFreshEnough(
  row: ComparisonRow,
  selectedFreshness: readonly Freshness[],
  now: Date,
): boolean {
  if (selectedFreshness.length === 0) return true;

  return [row.leftEntry, row.rightEntry].some(
    (entry) => entry.verifiedAt !== null && selectedFreshness.includes(classifyFreshness(entry.verifiedAt, now)),
  );
}

export function filterComparisonRows(
  rows: readonly ComparisonRow[],
  state: Pick<AtlasState, "query" | "categoryId" | "availability" | "statuses" | "freshness">,
  now: Date = new Date(),
): ComparisonRow[] {
  const result: ComparisonRow[] = [];

  for (const row of rows) {
    if (state.categoryId !== null && row.category.id !== state.categoryId) continue;
    if (
      state.availability.length > 0 &&
      !state.availability.includes(row.leftEntry.availability) &&
      !state.availability.includes(row.rightEntry.availability)
    ) continue;
    if (state.statuses.length > 0 && !state.statuses.includes(row.assessment.status)) continue;
    if (!isFreshEnough(row, state.freshness, now)) continue;
    if (state.query && !matchesSearch(row.searchText, state.query)) continue;

    result.push(row);
  }

  return result;
}

export function buildCategoryCounts(
  rows: readonly ComparisonRow[],
  state: Pick<AtlasState, "query" | "categoryId" | "availability" | "statuses" | "freshness">,
  now: Date = new Date(),
): ReadonlyMap<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row.category.id, 0);

  const rowsWithoutCategoryConstraint = filterComparisonRows(
    rows,
    { ...state, categoryId: null },
    now,
  );
  for (const row of rowsWithoutCategoryConstraint) {
    counts.set(row.category.id, (counts.get(row.category.id) ?? 0) + 1);
  }

  return counts;
}

export function buildVendorSummary(
  rows: readonly ComparisonRow[],
  vendorId: string,
): VendorSummary {
  const availability = Object.fromEntries(
    availabilityValues.map((value) => [value, 0]),
  ) as Record<Availability, number>;
  const statuses = Object.fromEntries(
    comparisonStatusValues.map((value) => [value, 0]),
  ) as Record<ComparisonStatus, number>;
  const categoryCounts = new Map<string, number>();

  for (const row of rows) {
    const entry = row.leftVendorId === vendorId ? row.leftEntry : row.rightEntry;
    availability[entry.availability] += 1;
    statuses[row.assessment.status] += 1;
    categoryCounts.set(row.category.id, (categoryCounts.get(row.category.id) ?? 0) + 1);
  }

  return Object.freeze({
    vendorId,
    totalCapabilities: rows.length,
    availability: Object.freeze(availability),
    statuses: Object.freeze(statuses),
    categoryCounts,
  });
}
