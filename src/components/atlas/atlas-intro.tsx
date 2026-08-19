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
  const latestVerification = mostRecentDate(dataset);

  return (
    <section className="atlas-intro" aria-labelledby="atlas-title">
      <div className="atlas-intro__copy">
        <p className="atlas-intro__kicker">Capability explorer</p>
        <h1 id="atlas-title">Compare the ecosystems.</h1>
        <p>
          Evidence-backed product and developer capabilities, verified against
          official sources.
        </p>
        <dl className="atlas-coverage" aria-label="Atlas coverage statistics">
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
            <dd>{displayDate(latestVerification)}</dd>
          </div>
        </dl>
      </div>
      <dl className="atlas-summary" aria-label="Atlas coverage summary">
        <div>
          <dt>Vendors</dt>
          <dd>{dataset.vendors.length}</dd>
        </div>
      </dl>
    </section>
  );
}
