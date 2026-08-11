import { atlasDataset } from "@/data";
import {
  buildCategoryCounts,
  buildComparisonRows,
  buildVendorSummary,
  filterComparisonRows,
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
      customization: 4,
    });
  });

  it("summarizes availability and editorial statuses for one selected vendor", () => {
    const rows = buildComparisonRows(atlasDataset, "anthropic", "openai");
    const summary = buildVendorSummary(rows, "anthropic");

    expect(summary.totalCapabilities).toBe(66);
    expect(summary.availability.available).toBeGreaterThan(0);
    expect(summary.statuses["different-approach"]).toBeGreaterThan(0);
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
