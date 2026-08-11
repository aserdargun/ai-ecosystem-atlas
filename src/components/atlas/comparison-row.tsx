import type { ComparisonRow as ComparisonRowModel } from "@/lib/comparison";
import { EvidencePanel } from "@/components/atlas/evidence-panel";
import { StatusBadge } from "@/components/atlas/status-badge";

function EntryCell({
  entry,
  vendorId,
}: {
  entry: ComparisonRowModel["leftEntry"];
  vendorId: string;
}) {
  return (
    <td className={`vendor-cell vendor-cell--${vendorId}`}>
      <StatusBadge kind="availability" value={entry.availability} />
      <strong>{entry.title}</strong>
      <p>{entry.summary}</p>
    </td>
  );
}

export function ComparisonRow({
  row,
  expanded,
  onToggle,
}: {
  row: ComparisonRowModel;
  expanded: boolean;
  onToggle: (rowId: string) => void;
}) {
  const evidenceId = `evidence-${row.capability.id}`;
  const verifiedDates = [row.leftEntry.verifiedAt, row.rightEntry.verifiedAt].filter(
    (value): value is string => value !== null,
  );
  const mostRecentVerification = verifiedDates.reduce(
    (latest, value) => (value > latest ? value : latest),
    "",
  );

  return (
    <>
      <tr className="comparison-row">
        <th className="capability-cell" scope="row">
          <span>{row.category.shortName}</span>
          <strong>{row.capability.name}</strong>
          <p>{row.capability.description}</p>
        </th>
        <EntryCell entry={row.leftEntry} vendorId={row.leftVendorId} />
        <EntryCell entry={row.rightEntry} vendorId={row.rightVendorId} />
        <td className="assessment-cell">
          <StatusBadge kind="assessment" value={row.assessment.status} />
          <p>{row.assessment.summary}</p>
        </td>
        <td className="verification-cell">
          {mostRecentVerification ? (
            <span>
              Checked through{" "}
              <time dateTime={mostRecentVerification}>{mostRecentVerification}</time>
            </span>
          ) : (
            <span>No verified source</span>
          )}
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={evidenceId}
            onClick={() => onToggle(row.capability.id)}
          >
            {expanded ? "Hide" : "Show"} evidence for {row.capability.name}
          </button>
        </td>
      </tr>
      {expanded ? (
        <tr className="evidence-row" id={evidenceId}>
          <td colSpan={5}>
            <EvidencePanel row={row} />
          </td>
        </tr>
      ) : null}
    </>
  );
}
