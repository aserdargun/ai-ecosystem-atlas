export function EmptyState({
  constraints,
  onReset,
}: {
  constraints: readonly string[];
  onReset: () => void;
}) {
  return (
    <section className="empty-state" aria-labelledby="empty-state-title">
      <h2 id="empty-state-title">No capabilities found</h2>
      <p>
        The current constraints do not match a documented capability. Remove a
        filter or reset the console.
      </p>
      {constraints.length > 0 ? (
        <p className="empty-state__constraints">
          Active constraints: {constraints.join(", ")}
        </p>
      ) : null}
      <button type="button" onClick={onReset}>
        Reset filters
      </button>
    </section>
  );
}
