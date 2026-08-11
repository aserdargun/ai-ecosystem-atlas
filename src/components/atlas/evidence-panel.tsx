import type { ComparisonEntry, ComparisonRow } from "@/lib/comparison";

function displayDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function EntryEvidence({
  vendorName,
  entry,
  sources,
}: {
  vendorName: string;
  entry: ComparisonEntry;
  sources: ComparisonRow["leftSources"];
}) {
  return (
    <section className="evidence-column" aria-labelledby={`${entry.id}-evidence-title`}>
      <h2 id={`${entry.id}-evidence-title`}>{vendorName} evidence</h2>
      {entry.productNames.length > 0 ? (
        <p className="evidence-products">
          <strong>Products</strong> {entry.productNames.join(", ")}
        </p>
      ) : null}
      {entry.details.length > 0 ? (
        <ul>
          {entry.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      ) : (
        <p>{entry.summary}</p>
      )}
      {entry.verifiedAt ? (
        <p className="verified-date">
          Verified <time dateTime={entry.verifiedAt}>{displayDate(entry.verifiedAt)}</time>
        </p>
      ) : (
        <p className="verified-date">No verification date documented</p>
      )}
      {sources.length > 0 ? (
        <ul className="source-list">
          {sources.map((source) => (
            <li key={source.id}>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Official source: ${source.title} — ${source.publisher}`}
              >
                <span>{source.title}</span>
                <small>{source.publisher} · Official source</small>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="source-missing">No reviewed official source documented.</p>
      )}
    </section>
  );
}

export function EvidencePanel({ row }: { row: ComparisonRow }) {
  const leftVendorName = row.leftSources[0]?.publisher ?? row.leftVendorId;
  const rightVendorName = row.rightSources[0]?.publisher ?? row.rightVendorId;

  return (
    <div className="evidence-panel">
      <EntryEvidence
        vendorName={leftVendorName}
        entry={row.leftEntry}
        sources={row.leftSources}
      />
      <EntryEvidence
        vendorName={rightVendorName}
        entry={row.rightEntry}
        sources={row.rightSources}
      />
      <section className="evidence-assessment">
        <h2>Assessment rationale</h2>
        <p>{row.assessment.summary}</p>
      </section>
    </div>
  );
}
