import type { CSSProperties } from "react";
import type {
  Availability,
  ComparisonStatus,
  Vendor,
} from "@/data/schema";
import { availabilityValues, comparisonStatusValues } from "@/data/schema";
import { freshnessValues, type Freshness } from "@/lib/freshness";
import {
  availabilityLabels,
  comparisonStatusLabels,
  freshnessLabels,
} from "@/lib/labels";

type PrimaryToolbarProps = {
  query: string;
  vendors: readonly Vendor[];
  leftVendorId: string;
  rightVendorId: string;
  resultCount: number;
  isFiltered: boolean;
  isPending: boolean;
  onQueryChange: (query: string) => void;
  onVendorChange: (side: "left" | "right", vendorId: string) => void;
  onSwapVendors: () => void;
  onReset: () => void;
};

export function FilterToolbar({
  query,
  vendors,
  leftVendorId,
  rightVendorId,
  resultCount,
  isFiltered,
  isPending,
  onQueryChange,
  onVendorChange,
  onSwapVendors,
  onReset,
}: PrimaryToolbarProps) {
  const leftVendor = vendors.find(({ id }) => id === leftVendorId);
  const rightVendor = vendors.find(({ id }) => id === rightVendorId);

  return (
    <div className="filter-toolbar" id="filter-toolbar" aria-busy={isPending}>
      <label className="search-control">
        <span>Search capabilities</span>
        <input
          type="search"
          value={query}
          placeholder="Search capabilities, products, plans…"
          onChange={(event) => onQueryChange(event.currentTarget.value)}
        />
      </label>
      <div className="vendor-controls" aria-label="Compared vendors">
        <label>
          <span>Left vendor</span>
          <select
            value={leftVendorId}
            style={{ "--vendor-color": leftVendor?.accent } as CSSProperties}
            onChange={(event) => onVendorChange("left", event.currentTarget.value)}
          >
            {vendors
              .filter(({ id }) => id !== rightVendorId)
              .map((vendor) => (
                <option value={vendor.id} key={vendor.id}>
                  {vendor.name}
                </option>
              ))}
          </select>
        </label>
        <button
          className="vendor-controls__swap"
          type="button"
          aria-label="Swap vendors"
          title="Swap left and right vendors"
          onClick={onSwapVendors}
        >
          <span aria-hidden="true">⇄</span>
        </button>
        <label>
          <span>Right vendor</span>
          <select
            value={rightVendorId}
            style={{ "--vendor-color": rightVendor?.accent } as CSSProperties}
            onChange={(event) => onVendorChange("right", event.currentTarget.value)}
          >
            {vendors
              .filter(({ id }) => id !== leftVendorId)
              .map((vendor) => (
                <option value={vendor.id} key={vendor.id}>
                  {vendor.name}
                </option>
              ))}
          </select>
        </label>
      </div>
      <div className="result-actions">
        <p className="result-count" role="status" aria-live="polite">
          {resultCount} {resultCount === 1 ? "capability" : "capabilities"} shown
        </p>
        {isFiltered ? (
          <button className="clear-button" type="button" onClick={onReset}>
            Clear filters
          </button>
        ) : null}
      </div>
    </div>
  );
}

type FilterGroupsProps = {
  availability: readonly Availability[];
  statuses: readonly ComparisonStatus[];
  freshness: readonly Freshness[];
  onAvailabilityChange: (value: Availability) => void;
  onStatusChange: (value: ComparisonStatus) => void;
  onFreshnessChange: (value: Freshness) => void;
};

function FilterCheckbox<Value extends string>({
  value,
  label,
  selected,
  onChange,
}: {
  value: Value;
  label: string;
  selected: boolean;
  onChange: (value: Value) => void;
}) {
  return (
    <label className="filter-check">
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onChange(value)}
      />
      <span>{label}</span>
    </label>
  );
}

export function FilterGroups({
  availability,
  statuses,
  freshness,
  onAvailabilityChange,
  onStatusChange,
  onFreshnessChange,
}: FilterGroupsProps) {
  return (
    <div className="filter-groups">
      <fieldset>
        <legend>Availability</legend>
        {availabilityValues.map((value) => (
          <FilterCheckbox
            key={value}
            value={value}
            label={availabilityLabels[value]}
            selected={availability.includes(value)}
            onChange={onAvailabilityChange}
          />
        ))}
      </fieldset>
      <fieldset>
        <legend>Comparison status</legend>
        {comparisonStatusValues.map((value) => (
          <FilterCheckbox
            key={value}
            value={value}
            label={comparisonStatusLabels[value]}
            selected={statuses.includes(value)}
            onChange={onStatusChange}
          />
        ))}
      </fieldset>
      <fieldset>
        <legend>Freshness</legend>
        {freshnessValues.map((value) => (
          <FilterCheckbox
            key={value}
            value={value}
            label={freshnessLabels[value]}
            selected={freshness.includes(value)}
            onChange={onFreshnessChange}
          />
        ))}
      </fieldset>
    </div>
  );
}
