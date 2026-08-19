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

function scoreTier(score: number): string {
  if (score >= 10) return "high";
  if (score >= 5) return "mid";
  return "low";
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
          {vendors.length} vendors · Overall score {overallScore.toFixed(1)}/10
        </span>
      </div>
      <div className="table-scroll">
        <table
          className="vendor-matrix-table"
          aria-label="All vendors capability matrix"
        >
          <caption>
            Availability score out of 10 for every capability across all{" "}
            {vendors.length} vendors
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
                    <span
                      className={
                        "vendor-matrix-cell__score vendor-matrix-cell__score--" +
                        scoreTier(cell.score)
                      }
                    >
                      {cell.score}/10
                    </span>
                    <StatusBadge kind="availability" value={cell.entry.availability} />
                    <strong>{cell.entry.title}</strong>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
