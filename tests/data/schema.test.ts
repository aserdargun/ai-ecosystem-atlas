import { parseAtlasDataset } from "@/data/validation";

const today = new Date("2026-08-11");

function createValidFixture() {
  return {
    vendors: [
      {
        id: "anthropic",
        name: "Anthropic",
        shortName: "Claude",
        ecosystemName: "Claude ecosystem",
        description: "An AI product and developer ecosystem.",
        homepageUrl: "https://www.anthropic.com/",
        accent: "#d97757",
      },
      {
        id: "openai",
        name: "OpenAI",
        shortName: "ChatGPT",
        ecosystemName: "ChatGPT ecosystem",
        description: "An AI product and developer ecosystem.",
        homepageUrl: "https://openai.com/",
        accent: "#168c6b",
      },
    ],
    categories: [
      ["models", "Models"],
      ["chat-knowledge-work", "Chat & Knowledge Work"],
      ["coding-agents", "Coding Agents"],
      ["agentic-workflows", "Agentic Workflows"],
      ["customization", "Customization"],
      ["skills-plugins", "Skills & Plugins"],
      ["connectors-mcp", "Connectors & MCP"],
      ["memory-context", "Memory & Context"],
      ["files-artifacts", "Files & Artifacts"],
      ["research-web", "Research & Web"],
      ["computer-browser-voice", "Computer, Browser & Voice"],
      ["local-cloud-environments", "Local & Cloud Environments"],
      ["automation-scheduling", "Automation & Scheduling"],
      ["permissions-security", "Permissions & Security"],
      ["api-sdk", "API & SDK"],
      ["enterprise-governance", "Enterprise & Governance"],
      ["pricing-plans", "Pricing & Plans"],
    ].map(([id, name], index) => ({
      id,
      name,
      shortName: name,
      description: `${name} capabilities.`,
      order: index + 1,
    })),
    capabilities: [
      {
        id: "frontier-model-lineup",
        categoryId: "models",
        name: "Frontier model lineup",
        description: "Current models offered by a vendor.",
        tags: ["models", "api"],
        order: 1,
      },
    ],
    vendorEntries: [
      {
        id: "anthropic-frontier-model-lineup",
        capabilityId: "frontier-model-lineup",
        vendorId: "anthropic",
        title: "Claude models",
        summary: "Anthropic offers Claude models.",
        details: ["The lineup includes current models."],
        productNames: ["Claude"],
        availability: "available",
        sourceIds: ["anthropic-models"],
        verifiedAt: "2026-08-11",
      },
      {
        id: "openai-frontier-model-lineup",
        capabilityId: "frontier-model-lineup",
        vendorId: "openai",
        title: "OpenAI models",
        summary: "OpenAI offers models.",
        details: ["The lineup includes current models."],
        productNames: ["ChatGPT"],
        availability: "available",
        sourceIds: ["openai-models"],
        verifiedAt: "2026-08-11",
      },
    ],
    assessments: [
      {
        capabilityId: "frontier-model-lineup",
        vendorIds: ["anthropic", "openai"],
        status: "strong-parity",
        summary: "Both vendors offer frontier model lineups.",
      },
    ],
    models: [
      {
        id: "claude-fixture-model",
        vendorId: "anthropic",
        name: "Claude Fixture",
        family: "Claude",
        positioning: "A fixture model.",
        lifecycle: "current",
        inputModalities: ["text"],
        outputModalities: ["text"],
        sourceIds: ["anthropic-models"],
        verifiedAt: "2026-08-11",
      },
    ],
    plans: [
      {
        id: "openai-fixture-plan",
        vendorId: "openai",
        name: "Fixture plan",
        audience: "Fixture users",
        priceDisplay: "$20/month",
        highlights: ["A fixture highlight."],
        sourceIds: ["openai-models"],
        verifiedAt: "2026-08-11",
      },
    ],
    sources: [
      {
        id: "anthropic-models",
        title: "Anthropic model documentation",
        publisher: "Anthropic",
        url: "https://docs.anthropic.com/en/docs/about-claude/models",
        sourceType: "documentation",
      },
      {
        id: "openai-models",
        title: "OpenAI model documentation",
        publisher: "OpenAI",
        url: "https://platform.openai.com/docs/models",
        sourceType: "documentation",
      },
    ],
  };
}

describe("parseAtlasDataset", () => {
  it("accepts a complete normalized dataset with the required taxonomy", () => {
    expect(() => parseAtlasDataset(createValidFixture(), today)).not.toThrow();
  });

  it("rejects a duplicate vendor ID", () => {
    const dataset = createValidFixture();
    dataset.vendors[1].id = "anthropic";

    expect(() => parseAtlasDataset(dataset, today)).toThrow(/duplicate id/i);
  });

  it("rejects a capability whose category is missing", () => {
    const dataset = createValidFixture();
    dataset.capabilities[0].categoryId = "missing-category";

    expect(() => parseAtlasDataset(dataset, today)).toThrow(/missing category/i);
  });

  it("rejects two entries for the same capability and vendor", () => {
    const dataset = createValidFixture();
    dataset.vendorEntries[1].vendorId = "anthropic";

    expect(() => parseAtlasDataset(dataset, today)).toThrow(/capability\/vendor pair/i);
  });

  it("rejects a source URL that is not HTTPS", () => {
    const dataset = createValidFixture();
    dataset.sources[0].url = "http://docs.anthropic.com/en/docs/about-claude/models";

    expect(() => parseAtlasDataset(dataset, today)).toThrow(/https/i);
  });

  it("rejects evidence verified after today", () => {
    const dataset = createValidFixture();
    dataset.vendorEntries[0].verifiedAt = "2026-08-12";

    expect(() => parseAtlasDataset(dataset, today)).toThrow(/future/i);
  });

  it("rejects the required categories when their display order drifts", () => {
    const dataset = createValidFixture();
    const firstCategory = dataset.categories[0];
    dataset.categories[0] = dataset.categories[1];
    dataset.categories[1] = firstCategory;

    expect(() => parseAtlasDataset(dataset, today)).toThrow(/category order/i);
  });

  it("rejects orphan source references and empty evidence lists", () => {
    const orphanedSourceDataset = createValidFixture();
    orphanedSourceDataset.models[0].sourceIds = ["missing-source"];
    expect(() => parseAtlasDataset(orphanedSourceDataset, today)).toThrow(
      /missing source/i,
    );

    const emptyEvidenceDataset = createValidFixture();
    emptyEvidenceDataset.plans[0].sourceIds = [];
    expect(() => parseAtlasDataset(emptyEvidenceDataset, today)).toThrow(
      /empty evidence/i,
    );
  });

  it("rejects missing vendor and capability references", () => {
    const missingVendorDataset = createValidFixture();
    missingVendorDataset.models[0].vendorId = "missing-vendor";
    expect(() => parseAtlasDataset(missingVendorDataset, today)).toThrow(
      /missing vendor/i,
    );

    const missingCapabilityDataset = createValidFixture();
    missingCapabilityDataset.assessments[0].capabilityId = "missing-capability";
    expect(() => parseAtlasDataset(missingCapabilityDataset, today)).toThrow(
      /missing capability/i,
    );
  });

  it("rejects repeated capability order inside one category", () => {
    const dataset = createValidFixture();
    dataset.capabilities.push({
      ...dataset.capabilities[0],
      id: "another-model-capability",
    });

    expect(() => parseAtlasDataset(dataset, today)).toThrow(/duplicate order/i);
  });
});
