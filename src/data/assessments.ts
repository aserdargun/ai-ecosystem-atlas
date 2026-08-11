import type { ComparisonAssessment } from "@/data/schema";
import { capabilityFacts } from "@/data/vendor-entries";

export const assessments = capabilityFacts.map(
  ({ capabilityId, assessmentStatus, assessmentSummary }) => ({
    capabilityId,
    vendorIds: ["anthropic", "openai"],
    status: assessmentStatus,
    summary: assessmentSummary,
  }),
) satisfies ComparisonAssessment[];
