import type { AtlasDataset } from "@/data/schema";

function mostRecentDate(dataset: AtlasDataset): string {
  const dates = [
    ...dataset.vendorEntries.map(({ verifiedAt }) => verifiedAt),
    ...dataset.models.map(({ verifiedAt }) => verifiedAt),
    ...dataset.plans.map(({ verifiedAt }) => verifiedAt),
  ];

  return dates.reduce((latest, date) => (date > latest ? date : latest), "");
}

function displayDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function AtlasIntro({ dataset }: { dataset: AtlasDataset }) {
  return (
    <section className="atlas-intro" id="methodology" aria-labelledby="atlas-title">
      <div className="atlas-intro__copy">
        <h1 id="atlas-title">AI Ecosystem Atlas</h1>
        <p>
          A living, evidence-backed comparison of AI product and developer
          ecosystems—built for scanning capabilities, checking claims, and
          following the official source.
        </p>
      </div>
      <dl className="atlas-summary" aria-label="Atlas coverage summary">
        <div>
          <dt>Capabilities</dt>
          <dd>{dataset.capabilities.length}</dd>
        </div>
        <div>
          <dt>Categories</dt>
          <dd>{dataset.categories.length}</dd>
        </div>
        <div>
          <dt>Official sources</dt>
          <dd>{dataset.sources.length}</dd>
        </div>
        <div>
          <dt>Latest verification</dt>
          <dd>{displayDate(mostRecentDate(dataset))}</dd>
        </div>
      </dl>
    </section>
  );
}
