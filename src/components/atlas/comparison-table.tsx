import type { CSSProperties } from "react";
import type { Vendor } from "@/data/schema";
import type { ComparisonRow } from "@/lib/comparison";
import { ComparisonRow as ComparisonRowView } from "@/components/atlas/comparison-row";

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
  return (
    <div className="table-scroll" id="sources">
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
  );
}
