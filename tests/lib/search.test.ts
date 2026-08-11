import { matchesSearch, normalizeSearchText } from "@/lib/search";

describe("search text", () => {
  it("normalizes diacritics, case, and repeated whitespace", () => {
    expect(normalizeSearchText("  M\u00e9moire\n  CONTEXT ")).toBe("memoire context");
  });

  it("matches diacritic-insensitively", () => {
    expect(matchesSearch("M\u00e9moire for teams", "memoire")).toBe(true);
  });

  it("requires every query token to occur in the searchable text", () => {
    expect(matchesSearch("Persistent code context and memory", "code memory")).toBe(
      true,
    );
    expect(matchesSearch("Persistent code context", "code memory")).toBe(false);
  });
});
