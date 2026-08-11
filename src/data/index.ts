import { assessments } from "@/data/assessments";
import { capabilities } from "@/data/capabilities";
import { categories } from "@/data/categories";
import { models } from "@/data/models";
import { plans } from "@/data/plans";
import type { AtlasDataset } from "@/data/schema";
import { sources } from "@/data/sources";
import { parseAtlasDataset } from "@/data/validation";
import { vendorEntries } from "@/data/vendor-entries";
import { vendors } from "@/data/vendors";

const rawDataset = {
  vendors,
  categories,
  capabilities,
  vendorEntries,
  assessments,
  models,
  plans,
  sources,
} satisfies AtlasDataset;

export const atlasDataset: AtlasDataset = parseAtlasDataset(
  rawDataset,
  new Date(),
);
