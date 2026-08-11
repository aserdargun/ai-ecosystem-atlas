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
]);

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
    expect(atlasDataset.capabilities.map(({ id }) => id)).toEqual(
      expectedCapabilityIds,
    );
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
      atlasDataset.sources.every((source) =>
        officialSourceHosts.has(new URL(source.url).hostname),
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
    expect(
      atlasDataset.models.every((model) => model.verifiedAt === "2026-08-11"),
    ).toBe(true);
    expect(
      atlasDataset.plans.every((plan) => plan.verifiedAt === "2026-08-11"),
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

  it("accepts a third-vendor fact through the same normalized entry contract", () => {
    const googleEntry = defineVendorEntry({
      id: "google-frontier-model-lineup",
      capabilityId: "frontier-model-lineup",
      vendorId: "google",
      title: "Current Gemini models",
      summary: "A normalized third-vendor entry used to exercise the authoring contract.",
      details: [],
      productNames: ["Gemini"],
      availability: "available",
      sourceIds: ["openai-models"],
      verifiedAt: "2026-08-11",
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
            description: "A third ecosystem fixture.",
            homepageUrl: "https://www.google.com/",
            accent: "#4285f4",
          },
        ],
        vendorEntries: [...atlasDataset.vendorEntries, googleEntry],
      },
      new Date("2026-08-11T12:00:00Z"),
    );

    expect(extended.vendorEntries.at(-1)).toEqual(googleEntry);
    expect(extended.vendorEntries).toHaveLength(133);
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
