import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { ResearchConsole } from "@/components/atlas/research-console";
import { atlasDataset } from "@/data/index";
import { defaultAtlasState } from "@/lib/url-state";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

beforeEach(() => {
  replace.mockClear();
});

function renderConsole(initialState = defaultAtlasState) {
  return render(
    <ResearchConsole dataset={atlasDataset} initialState={initialState} />,
  );
}

it("searches the real atlas and expands official evidence", async () => {
  const user = userEvent.setup();
  renderConsole();

  const search = screen.getByRole("searchbox", {
    name: /search capabilities/i,
  });
  expect(search).toBeVisible();
  expect(
    screen.getByRole("table", { name: /anthropic and openai/i }),
  ).toBeVisible();

  await user.type(search, "lifecycle hooks");

  expect(screen.getByRole("row", { name: /lifecycle hooks/i })).toBeVisible();
  expect(replace).toHaveBeenLastCalledWith("/?q=lifecycle+hooks", {
    scroll: false,
  });
  await user.click(
    screen.getByRole("button", {
      name: /show evidence for lifecycle hooks/i,
    }),
  );

  expect(
    screen.getAllByRole("link", { name: /official source/i })[0],
  ).toHaveAttribute("href", expect.stringMatching(/^https:\/\//));
});

it("combines category and multi-select status filters with a live count", async () => {
  const user = userEvent.setup();
  renderConsole();

  expect(screen.getByRole("status")).toHaveTextContent("66 capabilities shown");

  await user.click(screen.getByRole("button", { name: /^Coding Agents 5$/i }));
  expect(screen.getByRole("status")).toHaveTextContent("5 capabilities shown");
  expect(replace).toHaveBeenLastCalledWith("/?category=coding-agents", {
    scroll: false,
  });
  expect(screen.getByRole("row", { name: /terminal cli/i })).toBeVisible();
  expect(
    screen.queryByRole("row", { name: /conversational chat/i }),
  ).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /all categories/i }));
  await user.click(screen.getByRole("checkbox", { name: "Different approach" }));
  await user.click(screen.getByRole("checkbox", { name: "Vendor-specific" }));

  expect(screen.getByRole("status")).toHaveTextContent("12 capabilities shown");
});

it("keeps the all-categories count aligned with noncategory filters", async () => {
  const user = userEvent.setup();
  renderConsole();

  await user.click(screen.getByRole("checkbox", { name: "Vendor-specific" }));

  expect(screen.getByRole("status")).toHaveTextContent("3 capabilities shown");
  expect(
    screen.getByRole("button", { name: /^All categories 3$/i }),
  ).toBeVisible();
});

it("preserves back-to-back filter controls and their canonical URL parameters", () => {
  renderConsole();

  const limited = screen.getByRole("checkbox", { name: "Limited" });
  const vendorSpecific = screen.getByRole("checkbox", {
    name: "Vendor-specific",
  });

  act(() => {
    limited.click();
    vendorSpecific.click();
  });

  expect(limited).toBeChecked();
  expect(vendorSpecific).toBeChecked();
  expect(replace).toHaveBeenLastCalledWith(
    "/?availability=limited&status=vendor-specific",
    { scroll: false },
  );
});

it("shows zero results and resets every active constraint", async () => {
  const user = userEvent.setup();
  renderConsole();

  await user.type(
    screen.getByRole("searchbox", { name: /search capabilities/i }),
    "a capability that does not exist",
  );

  expect(
    screen.getByRole("heading", { name: /no capabilities found/i }),
  ).toBeVisible();
  expect(screen.getByRole("status")).toHaveTextContent("0 capabilities shown");

  await user.click(screen.getByRole("button", { name: /reset filters/i }));

  expect(screen.getByRole("searchbox", { name: /search capabilities/i })).toHaveValue(
    "",
  );
  expect(screen.getByRole("status")).toHaveTextContent("66 capabilities shown");
  expect(replace).toHaveBeenLastCalledWith("/", { scroll: false });
});

it("excludes and rejects duplicate vendor selections", () => {
  renderConsole();

  const leftVendor = screen.getByRole("combobox", { name: /left vendor/i });
  const rightVendor = screen.getByRole("combobox", { name: /right vendor/i });

  expect(leftVendor).toHaveValue("anthropic");
  expect(rightVendor).toHaveValue("openai");
  expect(
    within(leftVendor).queryByRole("option", { name: "OpenAI" }),
  ).not.toBeInTheDocument();
  expect(
    within(rightVendor).queryByRole("option", { name: "Anthropic" }),
  ).not.toBeInTheDocument();

  fireEvent.change(leftVendor, { target: { value: "openai" } });
  expect(leftVendor).toHaveValue("anthropic");
  expect(rightVendor).toHaveValue("openai");
  expect(replace).not.toHaveBeenCalled();
});

it("switches the filtered dataset into the vendor comparison and round-trips the URL", async () => {
  const user = userEvent.setup();
  renderConsole();

  await user.click(screen.getByRole("button", { name: "Vendor comparison" }));

  expect(
    screen.getByRole("heading", { name: /anthropic and openai vendor comparison/i }),
  ).toBeVisible();
  expect(screen.queryByRole("table", { name: /anthropic and openai/i })).not.toBeInTheDocument();
  expect(replace).toHaveBeenLastCalledWith("/?view=vendors", { scroll: false });

  await user.click(screen.getByRole("button", { name: "Explorer" }));

  expect(screen.getByRole("table", { name: /anthropic and openai/i })).toBeVisible();
  expect(replace).toHaveBeenLastCalledWith("/", { scroll: false });
});

it("restores the vendor comparison from parsed initial URL state", () => {
  renderConsole({ ...defaultAtlasState, view: "vendors" });

  expect(
    screen.getByRole("heading", { name: /anthropic and openai vendor comparison/i }),
  ).toBeVisible();
  expect(screen.getByRole("button", { name: "Vendor comparison" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
