import { render, screen } from "@testing-library/react";
import { EvidencePanel } from "@/components/atlas/evidence-panel";
import { atlasDataset } from "@/data/index";
import { buildComparisonRows } from "@/lib/comparison";

it("exposes products, detail, assessment, dates, and descriptive source links", () => {
  const row = buildComparisonRows(atlasDataset, "anthropic", "openai").find(
    ({ capability }) => capability.id === "lifecycle-hooks",
  );

  expect(row).toBeDefined();
  render(<EvidencePanel row={row!} />);

  expect(screen.getByRole("heading", { name: "Anthropic evidence" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "OpenAI evidence" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Assessment rationale" })).toBeVisible();
  expect(screen.getAllByText("Claude Code hooks").length).toBeGreaterThan(0);
  expect(screen.getAllByText("Codex hooks").length).toBeGreaterThan(0);
  expect(
    screen.getByText(/both coding agents document lifecycle hooks/i),
  ).toBeVisible();
  expect(screen.getAllByText(/verified/i).length).toBeGreaterThan(0);

  const officialLinks = screen.getAllByRole("link", { name: /official source/i });
  expect(officialLinks.length).toBeGreaterThanOrEqual(2);
  for (const link of officialLinks) {
    expect(link).toHaveAttribute("href", expect.stringMatching(/^https:\/\//));
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  }
});
