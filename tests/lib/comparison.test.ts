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
});
