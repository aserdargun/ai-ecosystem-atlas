import { z } from "zod";

export const requiredCategoryIds = [
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

export const availabilityValues = [
  "available",
  "limited",
  "not-available",
  "not-documented",
  "unknown",
] as const;

export const comparisonStatusValues = [
  "strong-parity",
  "partial-parity",
  "different-approach",
  "vendor-specific",
  "insufficient-evidence",
] as const;

const idSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "ID must be lowercase kebab-case.");

function isCalendarIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    isLeapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1];
}

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use ISO YYYY-MM-DD format.")
  .refine(isCalendarIsoDate, "Date must be a valid calendar date.");

const httpsUrlSchema = z
  .url("URL must be valid.")
  .refine((url) => url.startsWith("https://"), "URL must use HTTPS.");

export const availabilitySchema = z.enum(availabilityValues);
export const comparisonStatusSchema = z.enum(comparisonStatusValues);

export const vendorSchema = z
  .object({
    id: idSchema,
    name: z.string(),
    shortName: z.string(),
    ecosystemName: z.string(),
    description: z.string(),
    homepageUrl: httpsUrlSchema,
    accent: z.string(),
  })
  .strict();

export const categorySchema = z
  .object({
    id: idSchema,
    name: z.string(),
    shortName: z.string(),
    description: z.string(),
    order: z.number().int(),
  })
  .strict();

export const capabilitySchema = z
  .object({
    id: idSchema,
    categoryId: idSchema,
    name: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    order: z.number().int(),
  })
  .strict();

export const vendorEntrySchema = z
  .object({
    id: idSchema,
    capabilityId: idSchema,
    vendorId: idSchema,
    title: z.string(),
    summary: z.string(),
    details: z.array(z.string()),
    productNames: z.array(z.string()),
    availability: availabilitySchema,
    sourceIds: z.array(idSchema),
    verifiedAt: isoDateSchema,
  })
  .strict();

export const comparisonAssessmentSchema = z
  .object({
    capabilityId: idSchema,
    vendorIds: z.tuple([idSchema, idSchema]),
    status: comparisonStatusSchema,
    summary: z.string(),
  })
  .strict();

export const modelSchema = z
  .object({
    id: idSchema,
    vendorId: idSchema,
    name: z.string(),
    family: z.string(),
    positioning: z.string(),
    lifecycle: z.enum(["current", "preview", "legacy", "deprecated"]),
    inputModalities: z.array(z.string()),
    outputModalities: z.array(z.string()),
    contextWindowTokens: z.number().int().optional(),
    maxOutputTokens: z.number().int().optional(),
    knowledgeCutoff: z.string().optional(),
    pricing: z
      .object({
        inputPerMillionUsd: z.number().optional(),
        cachedInputPerMillionUsd: z.number().optional(),
        outputPerMillionUsd: z.number().optional(),
      })
      .strict()
      .optional(),
    sourceIds: z.array(idSchema),
    verifiedAt: isoDateSchema,
  })
  .strict();

export const planSchema = z
  .object({
    id: idSchema,
    vendorId: idSchema,
    name: z.string(),
    audience: z.string(),
    priceDisplay: z.string(),
    billingNote: z.string().optional(),
    highlights: z.array(z.string()),
    sourceIds: z.array(idSchema),
    verifiedAt: isoDateSchema,
  })
  .strict();

export const sourceSchema = z
  .object({
    id: idSchema,
    title: z.string(),
    publisher: z.enum(["Anthropic", "OpenAI", "Z.ai", "minimax"]),
    url: httpsUrlSchema,
    sourceType: z.enum([
      "documentation",
      "help",
      "product",
      "pricing",
      "announcement",
    ]),
    note: z.string().optional(),
  })
  .strict();

export const atlasDatasetSchema = z
  .object({
    vendors: z.array(vendorSchema),
    categories: z.array(categorySchema),
    capabilities: z.array(capabilitySchema),
    vendorEntries: z.array(vendorEntrySchema),
    assessments: z.array(comparisonAssessmentSchema),
    models: z.array(modelSchema),
    plans: z.array(planSchema),
    sources: z.array(sourceSchema),
  })
  .strict();

export type Availability = z.infer<typeof availabilitySchema>;
export type ComparisonStatus = z.infer<typeof comparisonStatusSchema>;
export type Vendor = z.infer<typeof vendorSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Capability = z.infer<typeof capabilitySchema>;
export type VendorEntry = z.infer<typeof vendorEntrySchema>;
export type ComparisonAssessment = z.infer<typeof comparisonAssessmentSchema>;
export type Model = z.infer<typeof modelSchema>;
export type Plan = z.infer<typeof planSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type AtlasDataset = z.infer<typeof atlasDatasetSchema>;
