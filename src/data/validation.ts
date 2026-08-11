import {
  atlasDatasetSchema,
  requiredCategoryIds,
  type AtlasDataset,
  type Capability,
  type Category,
  type ComparisonAssessment,
  type Model,
  type Plan,
  type Source,
  type VendorEntry,
} from "@/data/schema";

type IdentifiedRecord = { id: string };
type EvidenceRecord = IdentifiedRecord & {
  sourceIds: string[];
  verifiedAt: string;
};

function assertUniqueIds(records: IdentifiedRecord[], recordType: string) {
  const ids = new Set<string>();

  for (const record of records) {
    if (ids.has(record.id)) {
      throw new Error(`${recordType} "${record.id}" has duplicate ID.`);
    }
    ids.add(record.id);
  }

  return ids;
}

function assertRequiredTaxonomy(categories: Category[]) {
  if (categories.length !== requiredCategoryIds.length) {
    throw new Error(
      `Category taxonomy has ${categories.length} records; expected ${requiredCategoryIds.length}.`,
    );
  }

  for (const [index, expectedId] of requiredCategoryIds.entries()) {
    const category = categories[index];
    const expectedOrder = index + 1;

    if (category.id !== expectedId || category.order !== expectedOrder) {
      throw new Error(
        `Category "${category.id}" has category order ${category.order}; expected "${expectedId}" at order ${expectedOrder}.`,
      );
    }
  }
}

function assertUniqueOrders(categories: Category[], capabilities: Capability[]) {
  const categoryOrders = new Set<number>();
  for (const category of categories) {
    if (categoryOrders.has(category.order)) {
      throw new Error(
        `Category "${category.id}" has duplicate order ${category.order}.`,
      );
    }
    categoryOrders.add(category.order);
  }

  const ordersByCategory = new Map<string, Set<number>>();
  for (const capability of capabilities) {
    const orders = ordersByCategory.get(capability.categoryId) ?? new Set<number>();
    if (orders.has(capability.order)) {
      throw new Error(
        `Capability "${capability.id}" has duplicate order ${capability.order} in category "${capability.categoryId}".`,
      );
    }
    orders.add(capability.order);
    ordersByCategory.set(capability.categoryId, orders);
  }
}

function assertReferences(
  dataset: AtlasDataset,
  vendorIds: Set<string>,
  categoryIds: Set<string>,
  capabilityIds: Set<string>,
  sourceIds: Set<string>,
) {
  for (const capability of dataset.capabilities) {
    if (!categoryIds.has(capability.categoryId)) {
      throw new Error(
        `Capability "${capability.id}" references missing category "${capability.categoryId}".`,
      );
    }
  }

  for (const entry of dataset.vendorEntries) {
    assertVendorReference(entry, vendorIds, "VendorEntry");
    assertCapabilityReference(entry, capabilityIds, "VendorEntry");
    assertEvidenceReferences(entry, sourceIds, "VendorEntry");
  }

  for (const assessment of dataset.assessments) {
    assertAssessmentReferences(assessment, vendorIds, capabilityIds);
  }

  for (const model of dataset.models) {
    assertVendorReference(model, vendorIds, "Model");
    assertEvidenceReferences(model, sourceIds, "Model");
  }

  for (const plan of dataset.plans) {
    assertVendorReference(plan, vendorIds, "Plan");
    assertEvidenceReferences(plan, sourceIds, "Plan");
  }
}

function assertVendorReference(
  record: VendorEntry | Model | Plan,
  vendorIds: Set<string>,
  recordType: string,
) {
  if (!vendorIds.has(record.vendorId)) {
    throw new Error(
      `${recordType} "${record.id}" references missing vendor "${record.vendorId}".`,
    );
  }
}

function assertCapabilityReference(
  record: VendorEntry,
  capabilityIds: Set<string>,
  recordType: string,
) {
  if (!capabilityIds.has(record.capabilityId)) {
    throw new Error(
      `${recordType} "${record.id}" references missing capability "${record.capabilityId}".`,
    );
  }
}

function assertAssessmentReferences(
  assessment: ComparisonAssessment,
  vendorIds: Set<string>,
  capabilityIds: Set<string>,
) {
  const assessmentLabel = `ComparisonAssessment for capability "${assessment.capabilityId}"`;

  if (!capabilityIds.has(assessment.capabilityId)) {
    throw new Error(
      `${assessmentLabel} references missing capability "${assessment.capabilityId}".`,
    );
  }

  if (assessment.vendorIds[0] === assessment.vendorIds[1]) {
    throw new Error(`${assessmentLabel} must reference two different vendors.`);
  }

  for (const vendorId of assessment.vendorIds) {
    if (!vendorIds.has(vendorId)) {
      throw new Error(`${assessmentLabel} references missing vendor "${vendorId}".`);
    }
  }
}

function assertEvidenceReferences(
  record: EvidenceRecord,
  sourceIds: Set<string>,
  recordType: string,
) {
  if (record.sourceIds.length === 0) {
    throw new Error(`${recordType} "${record.id}" has an empty evidence list.`);
  }

  for (const sourceId of record.sourceIds) {
    if (!sourceIds.has(sourceId)) {
      throw new Error(
        `${recordType} "${record.id}" references missing source "${sourceId}".`,
      );
    }
  }
}

function assertNoFutureEvidence(
  records: EvidenceRecord[],
  recordType: string,
  today: Date,
) {
  const todayIso = today.toISOString().slice(0, 10);

  for (const record of records) {
    if (record.verifiedAt > todayIso) {
      throw new Error(
        `${recordType} "${record.id}" has future verification date "${record.verifiedAt}".`,
      );
    }
  }
}

function assertUniqueCapabilityVendorPairs(entries: VendorEntry[]) {
  const pairs = new Set<string>();

  for (const entry of entries) {
    const pair = `${entry.capabilityId}\u0000${entry.vendorId}`;
    if (pairs.has(pair)) {
      throw new Error(
        `VendorEntry "${entry.id}" duplicates a capability/vendor pair for capability "${entry.capabilityId}" and vendor "${entry.vendorId}".`,
      );
    }
    pairs.add(pair);
  }
}

export function parseAtlasDataset(input: unknown, today: Date): AtlasDataset {
  const dataset = atlasDatasetSchema.parse(input);
  const vendorIds = assertUniqueIds(dataset.vendors, "Vendor");
  const categoryIds = assertUniqueIds(dataset.categories, "Category");
  const capabilityIds = assertUniqueIds(dataset.capabilities, "Capability");
  assertUniqueIds(dataset.vendorEntries, "VendorEntry");
  assertUniqueIds(dataset.models, "Model");
  assertUniqueIds(dataset.plans, "Plan");
  const sourceIds = assertUniqueIds(dataset.sources, "Source");

  assertUniqueOrders(dataset.categories, dataset.capabilities);
  assertRequiredTaxonomy(dataset.categories);
  assertReferences(dataset, vendorIds, categoryIds, capabilityIds, sourceIds);
  assertUniqueCapabilityVendorPairs(dataset.vendorEntries);
  assertNoFutureEvidence(dataset.vendorEntries, "VendorEntry", today);
  assertNoFutureEvidence(dataset.models, "Model", today);
  assertNoFutureEvidence(dataset.plans, "Plan", today);

  return dataset;
}
