import type { CSSProperties } from "react";
import type { Vendor } from "@/data/schema";
import type { ComparisonRow } from "@/lib/comparison";
import { ComparisonRow as ComparisonRowView } from "@/components/atlas/comparison-row";

function displayDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function ComparisonTable({
  rows,
  leftVendor,
  rightVendor,
  expandedRowId,
  onToggleRow,
}: {
  rows: readonly ComparisonRow[];
  leftVendor: Vendor;
  rightVendor: Vendor;
  expandedRowId: string | null;
  onToggleRow: (rowId: string) => void;
}) {
  const mostRecentVerification = rows.reduce((latest, row) => {
    const rowLatest = [row.leftEntry.verifiedAt, row.rightEntry.verifiedAt]
      .filter((value): value is string => value !== null)
      .reduce((entryLatest, value) => (value > entryLatest ? value : entryLatest), "");
    return rowLatest > latest ? rowLatest : latest;
  }, "");

  return (
    <div className="comparison-panel" id="sources">
      <div className="table-summary">
        <strong>
          {rows.length} {rows.length === 1 ? "capability" : "capabilities"} shown
        </strong>
        {mostRecentVerification ? (
          <span>
            Evidence checked {displayDate(mostRecentVerification)}
          </span>
        ) : null}
      </div>
      <div className="table-scroll">
        <table aria-label={`${leftVendor.name} and ${rightVendor.name} ecosystem comparison`}>
        <caption>
          Evidence-backed capability comparison between {leftVendor.name} and{" "}
          {rightVendor.name}
        </caption>
        <thead>
          <tr>
            <th className="capability-heading" scope="col">
              Capability
            </th>
            <th
              className="vendor-heading"
              scope="col"
              style={{ "--vendor-color": leftVendor.accent } as CSSProperties}
            >
              <span>{leftVendor.name}</span>
              <small>{leftVendor.ecosystemName}</small>
            </th>
            <th
              className="vendor-heading"
              scope="col"
              style={{ "--vendor-color": rightVendor.accent } as CSSProperties}
            >
              <span>{rightVendor.name}</span>
              <small>{rightVendor.ecosystemName}</small>
            </th>
            <th scope="col">Assessment</th>
            <th scope="col">Verification &amp; sources</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <ComparisonRowView
              key={row.capability.id}
              row={row}
              expanded={expandedRowId === row.capability.id}
              onToggle={onToggleRow}
            />
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
}
