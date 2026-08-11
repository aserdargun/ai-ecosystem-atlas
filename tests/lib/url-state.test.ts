import { atlasDataset } from "@/data";
import {
  defaultAtlasState,
  parseUrlState,
  serializeUrlState,
} from "@/lib/url-state";

describe("URL state", () => {
  it("falls back to the default vendor pair when URL vendors are invalid or identical", () => {
    expect(
      parseUrlState(
        new URLSearchParams("left=unknown&right=unknown"),
        atlasDataset,
      ),
    ).toMatchObject({ leftVendorId: "anthropic", rightVendorId: "openai" });

    expect(
      parseUrlState(new URLSearchParams("left=openai&right=openai"), atlasDataset),
    ).toMatchObject({ leftVendorId: "anthropic", rightVendorId: "openai" });
  });

  it("accepts known values, deduplicates filters, and limits the query", () => {
    const query = "a".repeat(125);

    expect(
      parseUrlState(
        new URLSearchParams(
          `q=${query}&category=memory-context&left=openai&right=anthropic&availability=limited,available,limited&status=different-approach,strong-parity,different-approach&freshness=stale,current,stale&view=vendors`,
        ),
        atlasDataset,
      ),
    ).toEqual({
      query: "a".repeat(120),
      categoryId: "memory-context",
      leftVendorId: "openai",
      rightVendorId: "anthropic",
      availability: ["available", "limited"],
      statuses: ["strong-parity", "different-approach"],
      freshness: ["current", "stale"],
      view: "vendors",
    });
  });

  it("serializes documented query keys, canonical multi-value order, and no defaults", () => {
    const serialized = serializeUrlState({
      ...defaultAtlasState,
      query: "memory",
      categoryId: "memory-context",
      leftVendorId: "openai",
      rightVendorId: "anthropic",
      availability: ["limited", "available"],
      statuses: ["vendor-specific", "strong-parity"],
      freshness: ["stale", "current"],
      view: "vendors",
    });

    expect(serialized.toString()).toBe(
      "q=memory&category=memory-context&left=openai&right=anthropic&availability=available%2Climited&status=strong-parity%2Cvendor-specific&freshness=current%2Cstale&view=vendors",
    );
    expect(serializeUrlState(defaultAtlasState).toString()).toBe("");
  });
});
