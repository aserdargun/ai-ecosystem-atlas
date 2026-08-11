import type { Availability, ComparisonStatus } from "@/data/schema";
import {
  availabilityLabels,
  comparisonStatusLabels,
} from "@/lib/labels";

type StatusBadgeProps =
  | { kind: "availability"; value: Availability }
  | { kind: "assessment"; value: ComparisonStatus };

export function StatusBadge(props: StatusBadgeProps) {
  const label =
    props.kind === "availability"
      ? availabilityLabels[props.value]
      : comparisonStatusLabels[props.value];

  return (
    <span className={`status-label status-label--${props.value}`}>{label}</span>
  );
}
