import { atlasDataset } from "@/data";
import { defineVendorEntry } from "@/data/vendor-entries";
import { parseAtlasDataset } from "@/data/validation";

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

const expectedCapabilityIds = [
  "frontier-model-lineup",
  "context-window",
  "multimodal-input",
  "native-image-generation",
  "conversational-chat",
  "projects",
  "delegated-knowledge-work",
  "long-running-work",
  "primary-coding-agent",
  "terminal-cli",
  "ide-integration",
  "desktop-coding",
  "browser-cloud-coding",
  "custom-subagents",
  "multi-agent-orchestration",
  "hosted-agent-runtime",
  "function-tool-calling",
  "project-instruction-file",
  "configuration-scopes",
  "lifecycle-hooks",
  "custom-agent-definitions",
  "agent-skills",
  "plugin-packaging",
  "plugin-distribution",
  "mcp-client",
  "remote-connectors",
  "local-connectors",
  "chat-memory",
  "project-memory",
  "coding-auto-memory",
  "cross-provider-import",
  "file-analysis",
  "document-generation",
  "interactive-artifacts",
  "sandboxed-code-execution",
  "web-search",
  "deep-research",
  "source-citations",
  "web-fetch",
  "computer-use-product",
  "computer-use-api",
  "browser-control",
  "voice-mode",
  "local-execution",
  "managed-cloud-environments",
  "worktree-isolation",
  "execution-sandbox",
  "scheduled-tasks",
  "background-continuation",
  "event-driven-automation",
  "permission-modes",
  "fine-grained-permission-rules",
  "full-autonomy-mode",
  "enterprise-policy",
  "core-model-api",
  "agent-sdk",
  "built-in-api-tools",
  "api-mcp",
  "team-enterprise-plans",
  "sso-scim",
  "audit-logs",
  "data-retention-controls",
  "consumer-plans",
  "business-plans",
  "enterprise-pricing",
  "api-token-pricing",
] as const;

const officialSourceHosts = new Set([
  "docs.anthropic.com",
  "support.anthropic.com",
  "www.anthropic.com",
  "claude.com",
  "platform.claude.com",
  "developers.openai.com",
  "platform.openai.com",
  "help.openai.com",
  "openai.com",
  "chatgpt.com",
  "z.ai",
  "chat.z.ai",
  "docs.z.ai",
  "zcode.z.ai",
  "minimax.com",
  "platform.minimax.com",
  "docs.minimax.com",
  "api-docs.deepseek.com",
  "deepseek.com",
  "www.deepseek.com",
  "deepseekdocs.com",
]);

const expectedVendorIds = ["anthropic", "openai", "zai", "minimax", "deepseek"] as const;
const expectedVendorPairs = [
  ["anthropic", "minimax"],
  ["anthropic", "openai"],
  ["anthropic", "zai"],
  ["deepseek", "anthropic"],
  ["deepseek", "minimax"],
  ["deepseek", "openai"],
  ["deepseek", "zai"],
  ["minimax", "openai"],
  ["minimax", "zai"],
  ["openai", "zai"],
] as const;
const expectedPairKeys = expectedVendorPairs
  .map(([left, right]) => [left, right].sort().join("+"))
  .sort();

describe("canonical Atlas dataset", () => {
  it("ships the complete five-vendor seed with evidence for every comparison", () => {
    expect(atlasDataset.vendors.map(({ id }) => id)).toEqual([
      ...expectedVendorIds,
    ]);
    expect(atlasDataset.categories.map(({ id }) => id)).toEqual(
      expectedCategoryIds,
    );
    expect(atlasDataset.categories).toHaveLength(17);
    expect(atlasDataset.capabilities.map(({ id }) => id)).toEqual(
      expectedCapabilityIds,
    );
    expect(
      new Set(atlasDataset.capabilities.map((item) => item.categoryId)).size,
    ).toBe(17);
    expect(atlasDataset.vendorEntries).toHaveLength(330);
    expect(atlasDataset.assessments).toHaveLength(660);
    expect(atlasDataset.sources.length).toBeGreaterThanOrEqual(100);

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
      ).toEqual([...expectedVendorIds].sort());

      const assessments = atlasDataset.assessments.filter(
        (assessment) => assessment.capabilityId === capability.id,
      );
      expect(assessments, `assessments for ${capability.id}`).toHaveLength(10);
      expect(
        assessments
          .map(({ vendorIds }) => [...vendorIds].sort().join("+"))
          .sort(),
        `assessment pairs for ${capability.id}`,
      ).toEqual(expectedPairKeys);
    }

    expect(
      atlasDataset.sources.every((source) =>
        source.url.startsWith("https://"),
      ),
    ).toBe(true);
    expect(
      atlasDataset.sources.every((source) =>
        officialSourceHosts.has(new URL(source.url).hostname),
      ),
    ).toBe(true);
    expect(
      atlasDataset.vendorEntries.every((entry) => entry.sourceIds.length > 0),
    ).toBe(true);
    for (const vendorId of expectedVendorIds) {
      const expectedVerifiedAt =
        vendorId === "zai" || vendorId === "deepseek" ? "2026-08-19" : "2026-08-11";
      expect(
        atlasDataset.vendorEntries
          .filter((entry) => entry.vendorId === vendorId)
          .every((entry) => entry.verifiedAt === expectedVerifiedAt),
        `verification date for ${vendorId} entries`,
      ).toBe(true);
    }
    expect(
      atlasDataset.models
        .filter((model) => model.vendorId !== "zai" && model.vendorId !== "deepseek")
        .every((model) => model.verifiedAt === "2026-08-11"),
    ).toBe(true);
    expect(
      atlasDataset.models
        .filter((model) => model.vendorId === "zai" || model.vendorId === "deepseek")
        .every((model) => model.verifiedAt === "2026-08-19"),
    ).toBe(true);
    expect(
      atlasDataset.plans
        .filter((plan) => plan.vendorId !== "zai" && plan.vendorId !== "deepseek")
        .every((plan) => plan.verifiedAt === "2026-08-11"),
    ).toBe(true);
    expect(
      atlasDataset.plans
        .filter((plan) => plan.vendorId === "zai" || plan.vendorId === "deepseek")
        .every((plan) => plan.verifiedAt === "2026-08-19"),
    ).toBe(true);

    for (const vendorId of expectedVendorIds) {
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

  it("accepts a sixth-vendor fact through the same normalized entry contract", () => {
    const googleEntry = defineVendorEntry({
      id: "google-frontier-model-lineup",
      capabilityId: "frontier-model-lineup",
      vendorId: "google",
      title: "Current Gemini models",
      summary: "A normalized sixth-vendor entry used to exercise the authoring contract.",
      details: [],
      productNames: ["Gemini"],
      availability: "available",
      sourceIds: ["openai-models"],
      verifiedAt: "2026-08-19",
    });
    const extended = parseAtlasDataset(
      {
        ...atlasDataset,
        vendors: [
          ...atlasDataset.vendors,
          {
            id: "google",
            name: "Google",
            shortName: "Gemini",
            ecosystemName: "Gemini ecosystem",
            description: "A sixth ecosystem fixture.",
            homepageUrl: "https://www.google.com/",
            accent: "#4285f4",
          },
        ],
        vendorEntries: [...atlasDataset.vendorEntries, googleEntry],
      },
      new Date("2026-08-19T12:00:00Z"),
    );

    expect(extended.vendorEntries.at(-1)).toEqual(googleEntry);
    expect(extended.vendorEntries).toHaveLength(331);
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

  it("publishes the verified GLM-5.3 token rates and coding-plan quotas", () => {
    const glm53 = atlasDataset.models.find(({ id }) => id === "glm-5-3");
    const glm5 = atlasDataset.models.find(({ id }) => id === "glm-5");
    const lite = atlasDataset.plans.find(({ id }) => id === "glm-coding-lite");

    expect(glm53?.pricing).toEqual({
      inputPerMillionUsd: 1.4,
      cachedInputPerMillionUsd: 0.26,
      outputPerMillionUsd: 4.4,
    });
    expect(glm53?.contextWindowTokens).toBe(1_000_000);
    expect(glm5?.contextWindowTokens).toBe(200_000);
    expect(lite?.priceDisplay).toBe("$18/month");
    expect(lite?.highlights).toContain("10,000 weekly credits with 2,000 credits per 5 hours");
  });

  it("publishes the verified minimax M3 and M2 Pro token rates", () => {
    const m3 = atlasDataset.models.find(({ id }) => id === "minimax-m3");
    const pro = atlasDataset.models.find(({ id }) => id === "minimax-m2-pro");

    expect(m3?.pricing).toEqual({
      inputPerMillionUsd: 8,
      cachedInputPerMillionUsd: 0.8,
      outputPerMillionUsd: 40,
    });
    expect(pro?.pricing).toEqual({
      inputPerMillionUsd: 2,
      cachedInputPerMillionUsd: 0.2,
      outputPerMillionUsd: 10,
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

  it("publishes the verified DeepSeek-V4 token rates", () => {
    const pro = atlasDataset.models.find(({ id }) => id === "deepseek-v4-pro");
    const flash = atlasDataset.models.find(({ id }) => id === "deepseek-v4-flash");

    expect(pro?.pricing).toEqual({
      inputPerMillionUsd: 0.66,
      cachedInputPerMillionUsd: 0.022,
      outputPerMillionUsd: 1.98,
    });
    expect(pro?.contextWindowTokens).toBe(1_000_000);
    expect(pro?.maxOutputTokens).toBe(384_000);
    expect(flash?.pricing).toEqual({
      inputPerMillionUsd: 0.22,
      cachedInputPerMillionUsd: 0.007,
      outputPerMillionUsd: 0.66,
    });
  });

  it("describes minimax Max with source-supported usage multiples", () => {
    const max5x = atlasDataset.plans.find(
      ({ id }) => id === "minimax-max-5x",
    );
    const max20x = atlasDataset.plans.find(
      ({ id }) => id === "minimax-max-20x",
    );

    expect(max5x?.highlights).toContain("5x more usage than Pro");
    expect(max20x?.highlights).toContain("20x more usage than Pro");
  });
});
