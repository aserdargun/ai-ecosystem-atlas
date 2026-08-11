import { classifyFreshness } from "@/lib/freshness";

describe("classifyFreshness", () => {
  it("uses whole UTC calendar days at the current and aging boundaries", () => {
    const today = new Date("2026-08-11T12:00:00Z");

    expect(classifyFreshness("2026-05-13", today)).toBe("current");
    expect(classifyFreshness("2026-05-12", today)).toBe("aging");
    expect(classifyFreshness("2026-02-12", today)).toBe("aging");
    expect(classifyFreshness("2026-02-11", today)).toBe("stale");
  });

  it("does not age a verification made earlier on the current UTC date", () => {
    expect(
      classifyFreshness("2026-08-11", new Date("2026-08-11T00:01:00Z")),
    ).toBe("current");
  });
});
