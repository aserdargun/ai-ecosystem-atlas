import type { CSSProperties } from "react";
import type { Vendor } from "@/data/schema";
import {
  buildMatrixOverallScore,
  type VendorMatrixRow,
} from "@/lib/comparison";
import { StatusBadge } from "@/components/atlas/status-badge";

function vendorStyle(vendor: Vendor): CSSProperties {
  return { "--vendor-color": vendor.accent } as CSSProperties;
}

function formatScore(score: number): string {
  return Math.round(score * 100) + "%";
}

export function VendorMatrix({
  rows,
  vendors,
}: {
  rows: readonly VendorMatrixRow[];
  vendors: readonly Vendor[];
}) {
  const overallScore = buildMatrixOverallScore(rows);

  return (
    <div className="vendor-matrix">
      <div className="table-summary">
        <strong>
          {rows.length} {rows.length === 1 ? "capability" : "capabilities"} shown
        </strong>
        <span>
          {vendors.length} vendors · Overall coverage {formatScore(overallScore)}
        </span>
      </div>
      <div className="table-scroll">
        <table
          className="vendor-matrix-table"
          aria-label="All vendors capability matrix"
        >
          <caption>
            Availability coverage for every capability across all {vendors.length}{" "}
            vendors
          </caption>
          <thead>
            <tr>
              <th className="capability-heading" scope="col">
                Capability
              </th>
              {vendors.map((vendor) => (
                <th
                  className="vendor-heading"
                  scope="col"
                  style={vendorStyle(vendor)}
                  key={vendor.id}
                >
                  <span>{vendor.name}</span>
                  <small>{vendor.shortName}</small>
                </th>
              ))}
              <th className="coverage-heading" scope="col">
                Coverage
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.capability.id}>
                <th className="capability-cell" scope="row">
                  <span>{row.category.shortName}</span>
                  <strong>{row.capability.name}</strong>
                </th>
                {row.cells.map((cell) => (
                  <td
                    className="vendor-matrix-cell"
                    style={vendorStyle(cell.vendor)}
                    key={cell.vendor.id}
                  >
                    <StatusBadge kind="availability" value={cell.entry.availability} />
                    <strong>{cell.entry.title}</strong>
                  </td>
                ))}
                <td className="coverage-cell">
                  <span className="coverage-cell__value">{formatScore(row.score)}</span>
                  <span className="coverage-cell__bar" aria-hidden="true">
                    <span style={{ width: formatScore(row.score) }} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
