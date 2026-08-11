import { atlasDataset } from "../src/data/index";

const collections = [
  ["Vendors", atlasDataset.vendors.length],
  ["Categories", atlasDataset.categories.length],
  ["Capabilities", atlasDataset.capabilities.length],
  ["Vendor entries", atlasDataset.vendorEntries.length],
  ["Assessments", atlasDataset.assessments.length],
  ["Models", atlasDataset.models.length],
  ["Plans", atlasDataset.plans.length],
  ["Sources", atlasDataset.sources.length],
] as const;

for (const [label, count] of collections) {
  console.log(`${label}: ${count}`);
}

const latestVerification = [
  ...atlasDataset.vendorEntries,
  ...atlasDataset.models,
  ...atlasDataset.plans,
].reduce(
  (latest, record) => (record.verifiedAt > latest ? record.verifiedAt : latest),
  "",
);

console.log(`Latest verification: ${latestVerification}`);
