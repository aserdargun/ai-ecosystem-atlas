import { atlasDataset } from "@/data";
import {
  buildCategoryCounts,
  buildComparisonRows,
  buildVendorMatrix,
  buildVendorSummary,
  filterComparisonRows,
  filterVendorMatrix,
} from "@/lib/comparison";
import { defaultAtlasState } from "@/lib/url-state";

describe("comparison selectors", () => {
  it("synthesizes an explicit not-documented cell when a vendor pair is absent", () => {
    const datasetWithoutOpenAiMemory = {
      ...atlasDataset,
      vendorEntries: atlasDataset.vendorEntries.filter(
        (entry) =>
          !(entry.capabilityId === "chat-memory" && entry.vendorId === "openai"),
      ),
    };

    const row = buildComparisonRows(
      datasetWithoutOpenAiMemory,
      "anthropic",
      "openai",
    ).find((item) => item.capability.id === "chat-memory");

    expect(row?.rightEntry).toMatchObject({
      capabilityId: "chat-memory",
      vendorId: "openai",
      title: "Not documented",
      availability: "not-documented",
      sourceIds: [],
    });
    expect(row?.rightEntry.verifiedAt).toBeNull();
  });

  it("composes category, availability, status, freshness, and text constraints", () => {
    const rows = buildComparisonRows(atlasDataset, "anthropic", "openai");
    const state = {
      ...defaultAtlasState,
      categoryId: "memory-context",
      availability: ["available"] as const,
      statuses: ["different-approach"] as const,
      freshness: ["current"] as const,
      query: "code memory",
    };

    const result = filterComparisonRows(
      rows,
      state,
      new Date("2026-08-11T12:00:00Z"),
    );

    expect(result.map((row) => row.capability.id)).toEqual(["coding-auto-memory"]);
  });

  it.each([
    ["GPT-5.6 Sol", "models"],
    ["Claude Fable 5", "models"],
    ["ChatGPT Pro", "pricing-plans"],
  ])("scopes catalog query %s to its relevant category", (query, categoryId) => {
    const rows = buildComparisonRows(atlasDataset, "anthropic", "openai");
    const result = filterComparisonRows(rows, {
      ...defaultAtlasState,
      query,
    });

    expect(result).toHaveLength(4);
    expect(result.every((row) => row.category.id === categoryId)).toBe(true);
    expect(result).not.toHaveLength(66);
  });

  it("counts each category against all other active filters", () => {
    const rows = buildComparisonRows(atlasDataset, "anthropic", "openai");
    const state = {
      ...defaultAtlasState,
      categoryId: "memory-context",
      query: "memory",
    };

    expect(
      Object.fromEntries(
        buildCategoryCounts(rows, state, new Date("2026-08-11T12:00:00Z")),
      ),
    ).toMatchObject({
      "memory-context": 4,
      customization: 1,
    });
  });

  it("summarizes availability and editorial statuses for one selected vendor", () => {
    const rows = buildComparisonRows(atlasDataset, "anthropic", "openai");
    const summary = buildVendorSummary(rows, "anthropic");

    expect(summary.totalCapabilities).toBe(66);
    expect(summary.availability.available).toBeGreaterThan(0);
    expect(summary.statuses["different-approach"]).toBeGreaterThan(0);
  });

  it("builds one matrix cell per vendor for every capability", () => {
    const rows = buildVendorMatrix(atlasDataset);

    expect(rows).toHaveLength(66);
    for (const row of rows) {
      expect(row.cells).toHaveLength(atlasDataset.vendors.length);
      expect(row.cells.map((cell) => cell.vendor.id)).toEqual(
        atlasDataset.vendors.map((vendor) => vendor.id),
      );
    }
  });

  it("synthesizes not-documented matrix cells for missing vendor entries", () => {
    const datasetWithoutOpenAiMemory = {
      ...atlasDataset,
      vendorEntries: atlasDataset.vendorEntries.filter(
        (entry) =>
          !(entry.capabilityId === "chat-memory" && entry.vendorId === "openai"),
      ),
    };

    const row = buildVendorMatrix(datasetWithoutOpenAiMemory).find(
      (item) => item.capability.id === "chat-memory",
    );
    const openaiCell = row?.cells.find((cell) => cell.vendor.id === "openai");

    expect(openaiCell?.entry).toMatchObject({
      capabilityId: "chat-memory",
      vendorId: "openai",
      title: "Not documented",
      availability: "not-documented",
    });
  });

  it("filters the matrix by category, availability, freshness, and query", () => {
    const rows = buildVendorMatrix(atlasDataset);
    const result = filterVendorMatrix(rows, {
      ...defaultAtlasState,
      categoryId: "coding-agents",
      availability: ["available"],
    });

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((row) => row.category.id === "coding-agents")).toBe(true);
    expect(
      result.every((row) =>
        row.cells.some((cell) => cell.entry.availability === "available"),
      ),
    ).toBe(true);
  });

  it("prevents nested row changes from corrupting the source dataset", () => {
    const dataset = structuredClone(atlasDataset);
    const row = buildComparisonRows(dataset, "anthropic", "openai")[0];
    const capability = dataset.capabilities[0];
    const category = dataset.categories.find(
      (item) => item.id === capability.categoryId,
    )!;
    const entry = dataset.vendorEntries.find(
      (item) =>
        item.capabilityId === capability.id && item.vendorId === "anthropic",
    )!;
    const assessment = dataset.assessments.find(
      (item) => item.capabilityId === capability.id,
    )!;

    expect(Reflect.set(row.category, "description", "corrupted")).toBe(false);
    expect(Reflect.set(row.capability.tags, 0, "corrupted")).toBe(false);
    expect(Reflect.set(row.leftEntry, "summary", "corrupted")).toBe(false);
    expect(Reflect.set(row.assessment, "summary", "corrupted")).toBe(false);
    expect(category.description).not.toBe("corrupted");
    expect(capability.tags[0]).not.toBe("corrupted");
    expect(entry.summary).not.toBe("corrupted");
    expect(assessment.summary).not.toBe("corrupted");
  });
});
