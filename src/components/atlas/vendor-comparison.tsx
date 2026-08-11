import type { CSSProperties, ReactNode } from "react";
import type {
  Category,
  Model,
  Plan,
  Source,
  Vendor,
} from "@/data/schema";
import { availabilityValues } from "@/data/schema";
import {
  buildVendorSummary,
  type ComparisonRow,
} from "@/lib/comparison";
import {
  availabilityLabels,
  comparisonStatusLabels,
} from "@/lib/labels";

type VendorComparisonProps = {
  rows: readonly ComparisonRow[];
  leftVendor: Vendor;
  rightVendor: Vendor;
  categories: readonly Category[];
  models: readonly Model[];
  plans: readonly Plan[];
  sources: readonly Source[];
};

type SourceLinkedRecord = Model | Plan;

function vendorStyle(vendor: Vendor): CSSProperties {
  return { "--vendor-color": vendor.accent } as CSSProperties;
}

function SourceLinks({
  record,
  sourceById,
}: {
  record: SourceLinkedRecord;
  sourceById: ReadonlyMap<string, Source>;
}) {
  const linkedSources = record.sourceIds.flatMap((sourceId) => {
    const source = sourceById.get(sourceId);
    return source ? [source] : [];
  });

  return (
    <span className="vendor-record__sources">
      {linkedSources.map((source) => (
        <a
          href={source.url}
          key={source.id}
          target="_blank"
          rel="noreferrer"
          aria-label={`Official source for ${record.name}: ${source.title}`}
        >
          {source.title}
        </a>
      ))}
    </span>
  );
}

function RecordList({
  records,
  sourceById,
  renderMeta,
}: {
  records: readonly SourceLinkedRecord[];
  sourceById: ReadonlyMap<string, Source>;
  renderMeta: (record: SourceLinkedRecord) => ReactNode;
}) {
  return (
    <ul className="vendor-record-list">
      {records.map((record) => (
        <li key={record.id}>
          <strong>{record.name}</strong>
          <span>{renderMeta(record)}</span>
          <SourceLinks record={record} sourceById={sourceById} />
        </li>
      ))}
    </ul>
  );
}

function ComparisonGroup({
  title,
  rows,
}: {
  title: string;
  rows: readonly ComparisonRow[];
}) {
  return (
    <section className="comparison-group">
      <div className="comparison-group__heading">
        <h3>{title}</h3>
        <span>{rows.length}</span>
      </div>
      {rows.length > 0 ? (
        <ul>
          {rows.map((row) => (
            <li key={row.capability.id}>
              <strong>{row.capability.name}</strong>
              <p>{row.assessment.summary}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="comparison-group__empty">
          No matching capabilities in the active filters.
        </p>
      )}
    </section>
  );
}

function entryForVendor(row: ComparisonRow, vendorId: string) {
  return row.leftVendorId === vendorId ? row.leftEntry : row.rightEntry;
}

export function VendorComparison({
  rows,
  leftVendor,
  rightVendor,
  categories,
  models,
  plans,
  sources,
}: VendorComparisonProps) {
  const leftSummary = buildVendorSummary(rows, leftVendor.id);
  const rightSummary = buildVendorSummary(rows, rightVendor.id);
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const selectedVendorIds = new Set([leftVendor.id, rightVendor.id]);
  const filteredModels = models.filter((model) => selectedVendorIds.has(model.vendorId));
  const filteredPlans = plans.filter((plan) => selectedVendorIds.has(plan.vendorId));
  const categoryCoverage = categories.flatMap((category) => {
    const categoryRows = rows.filter((row) => row.category.id === category.id);
    if (categoryRows.length === 0) return [];

    return [{
      category,
      total: categoryRows.length,
      left: categoryRows.filter((row) => {
        const availability = entryForVendor(row, leftVendor.id).availability;
        return availability === "available" || availability === "limited";
      }).length,
      right: categoryRows.filter((row) => {
        const availability = entryForVendor(row, rightVendor.id).availability;
        return availability === "available" || availability === "limited";
      }).length,
    }];
  });
  const parityRows = rows.filter((row) => row.assessment.status === "strong-parity");
  const differentApproachRows = rows.filter(
    (row) => row.assessment.status === "different-approach",
  );
  const vendorSpecificRows = rows.filter(
    (row) => row.assessment.status === "vendor-specific",
  );

  return (
    <article className="vendor-comparison" aria-labelledby="vendor-comparison-title">
      <header className="vendor-comparison__header">
        <div>
          <h2 id="vendor-comparison-title">
            {leftVendor.name} and {rightVendor.name} vendor comparison
          </h2>
          <p>
            Factual coverage across the active filters, without a ranking or an
            aggregate quality measure.
          </p>
        </div>
        <strong>{rows.length} filtered capabilities</strong>
      </header>

      <section
        className="vendor-section vendor-section--coverage"
        aria-labelledby="category-coverage-title"
      >
        <div className="vendor-section__heading">
          <h2 id="category-coverage-title">Category coverage</h2>
          <p>Available or limited entries out of matching capabilities.</p>
        </div>
        <div className="coverage-table" role="table" aria-label="Category coverage">
          <div className="coverage-table__head" role="row">
            <span role="columnheader">Category</span>
            <span role="columnheader" style={vendorStyle(leftVendor)}>
              {leftVendor.name}
            </span>
            <span role="columnheader" style={vendorStyle(rightVendor)}>
              {rightVendor.name}
            </span>
          </div>
          {categoryCoverage.map(({ category, total, left, right }) => (
            <div className="coverage-table__row" role="row" key={category.id}>
              <strong role="cell">{category.name}</strong>
              <span role="cell">{left} of {total}</span>
              <span role="cell">{right} of {total}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="vendor-section" aria-labelledby="availability-title">
        <div className="vendor-section__heading">
          <h2 id="availability-title">Availability totals</h2>
          <p>Documented states for the same filtered capability set.</p>
        </div>
        <div className="vendor-summary-columns">
          {[
            { vendor: leftVendor, summary: leftSummary },
            { vendor: rightVendor, summary: rightSummary },
          ].map(({ vendor, summary }) => (
            <section className="vendor-summary" style={vendorStyle(vendor)} key={vendor.id}>
              <h3>{vendor.name}</h3>
              <dl>
                {availabilityValues.map((availability) => (
                  <div key={availability}>
                    <dt>{availabilityLabels[availability]}</dt>
                    <dd>{summary.availability[availability]}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </section>

      <section className="vendor-section vendor-section--records" aria-labelledby="records-title">
        <div className="vendor-section__heading">
          <h2 id="records-title">Models and plans</h2>
          <p>Current canonical records for the selected vendor pair.</p>
        </div>
        <div className="vendor-record-columns">
          <section aria-labelledby="models-title">
            <h3 id="models-title">Models</h3>
            <RecordList
              records={filteredModels}
              sourceById={sourceById}
              renderMeta={(record) => "positioning" in record ? record.positioning : record.audience}
            />
          </section>
          <section aria-labelledby="plans-title">
            <h3 id="plans-title">Plans</h3>
            <RecordList
              records={filteredPlans}
              sourceById={sourceById}
              renderMeta={(record) => "priceDisplay" in record ? record.priceDisplay : record.positioning}
            />
          </section>
        </div>
      </section>

      <section className="vendor-section" aria-labelledby="comparison-groups-title">
        <div className="vendor-section__heading">
          <h2 id="comparison-groups-title">Comparison groups</h2>
          <p>Editorial assessments supported by the filtered evidence.</p>
        </div>
        <div className="comparison-groups">
          <ComparisonGroup
            title={comparisonStatusLabels["strong-parity"]}
            rows={parityRows}
          />
          <ComparisonGroup title="Different approaches" rows={differentApproachRows} />
          <ComparisonGroup title="Vendor-specific capabilities" rows={vendorSpecificRows} />
        </div>
      </section>
    </article>
  );
}
