import type { Availability, ComparisonStatus } from "@/data/schema";
import type { Freshness } from "@/lib/freshness";
import type { AtlasView } from "@/lib/url-state";

export const availabilityLabels: Record<Availability, string> = {
  available: "Available",
  limited: "Limited",
  "not-available": "Not available",
  "not-documented": "Not documented",
  unknown: "Unknown",
};

export const comparisonStatusLabels: Record<ComparisonStatus, string> = {
  "strong-parity": "Strong parity",
  "partial-parity": "Partial parity",
  "different-approach": "Different approach",
  "vendor-specific": "Vendor-specific",
  "insufficient-evidence": "Insufficient evidence",
};

export const freshnessLabels: Record<Freshness, string> = {
  current: "Current",
  aging: "Aging",
  stale: "Stale",
};

export const atlasViewLabels: Record<AtlasView, string> = {
  explorer: "Explorer",
  vendors: "Vendor comparison",
  "all-vendors": "All vendors",
};
