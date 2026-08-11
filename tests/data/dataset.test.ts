import { atlasDataset } from "@/data";

const expectedCategoryIds = [
  "models",
  "chat-knowledge-work",
  "coding-agents",
  "agentic-workflows",
  "customization",
  "skills-plugins",
  "connectors-mcp",
  "memory-context",
  "files-artifacts",
  "research-web",
  "computer-browser-voice",
  "local-cloud-environments",
  "automation-scheduling",
  "permissions-security",
  "api-sdk",
  "enterprise-governance",
  "pricing-plans",
] as const;

describe("canonical Atlas dataset", () => {
  it("ships the complete two-vendor seed with evidence for every comparison", () => {
    expect(atlasDataset.vendors.map(({ id }) => id)).toEqual([
      "anthropic",
      "openai",
    ]);
    expect(atlasDataset.categories.map(({ id }) => id)).toEqual(
      expectedCategoryIds,
    );
    expect(atlasDataset.categories).toHaveLength(17);
    expect(atlasDataset.capabilities).toHaveLength(66);
    expect(
      new Set(atlasDataset.capabilities.map((item) => item.categoryId)).size,
    ).toBe(17);
    expect(atlasDataset.vendorEntries).toHaveLength(132);
    expect(atlasDataset.assessments).toHaveLength(66);
    expect(atlasDataset.sources.length).toBeGreaterThanOrEqual(24);

    for (const categoryId of expectedCategoryIds) {
      expect(
        atlasDataset.capabilities.filter(
          (capability) => capability.categoryId === categoryId,
        ).length,
        `capability coverage for ${categoryId}`,
      ).toBeGreaterThanOrEqual(2);
    }

    for (const capability of atlasDataset.capabilities) {
      const entries = atlasDataset.vendorEntries.filter(
        (entry) => entry.capabilityId === capability.id,
      );
      expect(
        entries.map(({ vendorId }) => vendorId).sort(),
        `vendor entries for ${capability.id}`,
      ).toEqual(["anthropic", "openai"]);

      const assessments = atlasDataset.assessments.filter(
        (assessment) => assessment.capabilityId === capability.id,
      );
      expect(assessments, `assessment for ${capability.id}`).toHaveLength(1);
      expect(assessments[0].vendorIds).toEqual(["anthropic", "openai"]);
    }

    expect(
      atlasDataset.sources.every((source) =>
        source.url.startsWith("https://"),
      ),
    ).toBe(true);
    expect(
      atlasDataset.vendorEntries.every((entry) => entry.sourceIds.length > 0),
    ).toBe(true);
    expect(
      atlasDataset.vendorEntries.every(
        (entry) => entry.verifiedAt === "2026-08-11",
      ),
    ).toBe(true);

    for (const vendorId of ["anthropic", "openai"]) {
      expect(
        atlasDataset.models.some((model) => model.vendorId === vendorId),
        `model coverage for ${vendorId}`,
      ).toBe(true);
      expect(
        atlasDataset.plans.some((plan) => plan.vendorId === vendorId),
        `plan coverage for ${vendorId}`,
      ).toBe(true);
    }
  });

  it("publishes the verified GPT-5.6 Terra and Luna token rates", () => {
    const terra = atlasDataset.models.find(({ id }) => id === "gpt-5-6-terra");
    const luna = atlasDataset.models.find(({ id }) => id === "gpt-5-6-luna");

    expect(terra?.pricing).toEqual({
      inputPerMillionUsd: 2,
      cachedInputPerMillionUsd: 0.2,
      outputPerMillionUsd: 12,
    });
    expect(luna?.pricing).toEqual({
      inputPerMillionUsd: 0.2,
      cachedInputPerMillionUsd: 0.02,
      outputPerMillionUsd: 1.2,
    });
  });

  it("describes Claude Max with source-supported usage multiples", () => {
    const max5x = atlasDataset.plans.find(({ id }) => id === "claude-max-5x");
    const max20x = atlasDataset.plans.find(({ id }) => id === "claude-max-20x");

    expect(max5x?.highlights).toContain("5x more usage than Pro");
    expect(max20x?.highlights).toContain("20x more usage than Pro");
    expect([...max5x!.highlights, ...max20x!.highlights].join(" ")).not.toMatch(
      /capacity/i,
    );
  });
});
