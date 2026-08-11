import { render, screen, within } from "@testing-library/react";
import { VendorComparison } from "@/components/atlas/vendor-comparison";
import { atlasDataset } from "@/data";
import { buildComparisonRows, filterComparisonRows } from "@/lib/comparison";
import { defaultAtlasState } from "@/lib/url-state";

const anthropic = atlasDataset.vendors.find((vendor) => vendor.id === "anthropic")!;
const openai = atlasDataset.vendors.find((vendor) => vendor.id === "openai")!;
const allRows = buildComparisonRows(atlasDataset, anthropic.id, openai.id);

function renderComparison(rows = allRows) {
  return render(
    <VendorComparison
      rows={rows}
      leftVendor={anthropic}
      rightVendor={openai}
      categories={atlasDataset.categories}
      models={atlasDataset.models}
      plans={atlasDataset.plans}
      sources={atlasDataset.sources}
    />,
  );
}

it("summarizes the selected vendors without ranking them", () => {
  renderComparison();

  expect(
    screen.getByRole("heading", { name: /anthropic and openai vendor comparison/i }),
  ).toBeVisible();
  expect(screen.getByRole("heading", { name: /category coverage/i })).toBeVisible();
  expect(screen.getByRole("heading", { name: /different approaches/i })).toBeVisible();
  expect(screen.getByText("66 filtered capabilities")).toBeVisible();
  expect(screen.queryByText(/winner|score/i)).not.toBeInTheDocument();
});

it("recomputes the summary from the active filtered rows", () => {
  const codingRows = filterComparisonRows(allRows, {
    ...defaultAtlasState,
    categoryId: "coding-agents",
  });
  const { rerender } = renderComparison();

  expect(screen.getByText("66 filtered capabilities")).toBeVisible();

  rerender(
    <VendorComparison
      rows={codingRows}
      leftVendor={anthropic}
      rightVendor={openai}
      categories={atlasDataset.categories}
      models={atlasDataset.models}
      plans={atlasDataset.plans}
      sources={atlasDataset.sources}
    />,
  );

  expect(screen.getByText("5 filtered capabilities")).toBeVisible();
  const categoryCoverage = screen.getByRole("region", { name: /category coverage/i });
  expect(within(categoryCoverage).getByText("Coding Agents")).toBeVisible();
  expect(within(categoryCoverage).queryByText("Models")).not.toBeInTheDocument();
});

it("keeps every partial-parity assessment visible when that status is filtered", () => {
  const partialParityRows = filterComparisonRows(allRows, {
    ...defaultAtlasState,
    statuses: ["partial-parity"],
  });

  renderComparison(partialParityRows);

  expect(screen.getByText("5 filtered capabilities")).toBeVisible();
  const partialParity = screen.getByRole("region", { name: "Partial parity" });
  expect(within(partialParity).getAllByRole("listitem")).toHaveLength(5);
  for (const row of partialParityRows) {
    expect(within(partialParity).getByText(row.assessment.summary)).toBeVisible();
  }
});

it("renders matching insufficient-evidence assessments without an empty default group", () => {
  const insufficientSummary =
    "No reviewed comparison assessment is documented for this vendor pair.";
  const insufficientRow = {
    ...allRows[0],
    assessment: {
      capabilityId: allRows[0].capability.id,
      vendorIds: [anthropic.id, openai.id] as [string, string],
      status: "insufficient-evidence" as const,
      summary: insufficientSummary,
    },
  };

  const { rerender } = renderComparison();
  expect(
    screen.queryByRole("region", { name: "Insufficient evidence" }),
  ).not.toBeInTheDocument();

  rerender(
    <VendorComparison
      rows={[insufficientRow]}
      leftVendor={anthropic}
      rightVendor={openai}
      categories={atlasDataset.categories}
      models={atlasDataset.models}
      plans={atlasDataset.plans}
      sources={atlasDataset.sources}
    />,
  );

  const group = screen.getByRole("region", { name: "Insufficient evidence" });
  expect(within(group).getByText(insufficientSummary)).toBeVisible();
});

it("separates every factual availability state in category coverage", () => {
  renderComparison();

  const categoryCoverage = screen.getByRole("table", { name: "Category coverage" });
  const models = within(categoryCoverage)
    .getByRole("cell", { name: "Models" })
    .closest('[role="row"]')!;
  expect(
    within(models).getByRole("cell", {
      name: "Anthropic: Available 3, Limited 0, Not available 0, Not documented 1, Unknown 0",
    }),
  ).toBeVisible();
  expect(
    within(models).getByRole("cell", {
      name: "OpenAI: Available 4, Limited 0, Not available 0, Not documented 0, Unknown 0",
    }),
  ).toBeVisible();
});

it("keeps model and plan evidence source-linked", () => {
  renderComparison();

  const models = screen.getByRole("region", { name: "Models" });
  const plans = screen.getByRole("region", { name: "Plans" });

  expect(within(models).getAllByRole("link", { name: /official source/i })[0]).toHaveAttribute(
    "href",
    expect.stringMatching(/^https:\/\/(?:[^.]+\.)?(?:anthropic\.com|claude\.com|openai\.com)\//),
  );
  expect(within(plans).getAllByRole("link", { name: /official source/i })[0]).toHaveAttribute(
    "href",
    expect.stringMatching(/^https:\/\/(?:[^.]+\.)?(?:anthropic\.com|claude\.com|openai\.com)\//),
  );
});
