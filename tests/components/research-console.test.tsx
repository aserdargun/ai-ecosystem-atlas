import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { ResearchConsole } from "@/components/atlas/research-console";
import { atlasDataset } from "@/data/index";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

beforeEach(() => {
  replace.mockClear();
  window.history.replaceState({}, "", "/");
});

function renderConsole() {
  return render(<ResearchConsole dataset={atlasDataset} />);
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

it.each([
  ["GPT-5.6 Sol", "Models"],
  ["Claude Fable 5", "Models"],
  ["ChatGPT Pro", "Pricing"],
])("shows a bounded category slice for catalog query %s", async (query, category) => {
  const user = userEvent.setup();
  renderConsole();

  await user.type(
    screen.getByRole("searchbox", { name: /search capabilities/i }),
    query,
  );

  expect(screen.getByRole("status")).toHaveTextContent("4 capabilities shown");
  const resultRows = screen.getAllByRole("row").slice(1);
  expect(resultRows).toHaveLength(4);
  for (const row of resultRows) {
    expect(within(row).getByText(category)).toBeVisible();
  }
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

it("swaps vendors atomically in controls, table order, accents, and URL state", async () => {
  const user = userEvent.setup();
  renderConsole();

  const leftVendor = screen.getByRole("combobox", { name: /left vendor/i });
  const rightVendor = screen.getByRole("combobox", { name: /right vendor/i });
  expect(leftVendor).toHaveValue("anthropic");
  expect(rightVendor).toHaveValue("openai");
  expect(leftVendor).toHaveStyle({ "--vendor-color": "#d97757" });
  expect(rightVendor).toHaveStyle({ "--vendor-color": "#168c6b" });

  await user.click(screen.getByRole("button", { name: "Swap vendors" }));

  expect(leftVendor).toHaveValue("openai");
  expect(rightVendor).toHaveValue("anthropic");
  expect(leftVendor).toHaveStyle({ "--vendor-color": "#168c6b" });
  expect(rightVendor).toHaveStyle({ "--vendor-color": "#d97757" });
  const headers = screen.getAllByRole("columnheader");
  expect(headers[1]).toHaveTextContent("OpenAI");
  expect(headers[2]).toHaveTextContent("Anthropic");
  expect(replace).toHaveBeenLastCalledWith(
    "/?left=openai&right=anthropic",
    { scroll: false },
  );
});

it("hydrates validated state from the browser query without rewriting it", async () => {
  window.history.replaceState(
    {},
    "",
    "/?q=terminal+cli&category=coding-agents&left=openai&right=anthropic&view=vendors",
  );

  renderConsole();

  await waitFor(() => {
    expect(screen.getByRole("combobox", { name: /left vendor/i })).toHaveValue(
      "openai",
    );
  });
  expect(screen.getByRole("combobox", { name: /right vendor/i })).toHaveValue(
    "anthropic",
  );
  expect(screen.getByRole("searchbox", { name: /search capabilities/i })).toHaveValue(
    "terminal cli",
  );
  expect(
    screen.getByRole("heading", { name: /openai and anthropic vendor comparison/i }),
  ).toBeVisible();
  expect(replace).not.toHaveBeenCalled();
});

it("renders a reversed pair from browser URL state", async () => {
  window.history.replaceState({}, "", "/?left=openai&right=anthropic");
  renderConsole();

  await waitFor(() => {
    expect(screen.getByRole("combobox", { name: /left vendor/i })).toHaveValue(
      "openai",
    );
  });

  expect(screen.getByRole("combobox", { name: /right vendor/i })).toHaveValue(
    "anthropic",
  );
  expect(
    screen.getByRole("table", { name: /openai and anthropic/i }),
  ).toBeVisible();
});

it("adopts browser URL state only once when dataset props re-render", async () => {
  window.history.replaceState({}, "", "/?left=openai&right=anthropic");
  const { rerender } = renderConsole();

  await waitFor(() => {
    expect(screen.getByRole("combobox", { name: /left vendor/i })).toHaveValue(
      "openai",
    );
  });

  window.history.replaceState({}, "", "/");
  rerender(<ResearchConsole dataset={{ ...atlasDataset }} />);
  await act(async () => {});

  expect(screen.getByRole("combobox", { name: /left vendor/i })).toHaveValue(
    "openai",
  );
  expect(screen.getByRole("combobox", { name: /right vendor/i })).toHaveValue(
    "anthropic",
  );
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

it("switches to the all-vendors matrix and round-trips the URL", async () => {
  const user = userEvent.setup();
  renderConsole();

  await user.click(screen.getByRole("button", { name: "All vendors" }));

  expect(
    screen.getByRole("table", { name: "All vendors capability matrix" }),
  ).toBeVisible();
  expect(
    screen.queryByRole("combobox", { name: /left vendor/i }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("combobox", { name: /right vendor/i }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Swap vendors" }),
  ).not.toBeInTheDocument();
  expect(screen.getByRole("columnheader", { name: /Anthropic/ })).toBeVisible();
  expect(screen.getByRole("columnheader", { name: /OpenAI/ })).toBeVisible();
  expect(screen.getByRole("columnheader", { name: /Z.ai/ })).toBeVisible();
  expect(screen.getByRole("columnheader", { name: /minimax/ })).toBeVisible();
  expect(screen.getByRole("columnheader", { name: /DeepSeek/ })).toBeVisible();
  expect(screen.getByRole("columnheader", { name: /Qwen/ })).toBeVisible();
  expect(replace).toHaveBeenLastCalledWith("/?view=all-vendors", {
    scroll: false,
  });

  await user.click(screen.getByRole("button", { name: "Explorer" }));
  expect(screen.getByRole("table", { name: /anthropic and openai/i })).toBeVisible();
});

it("summarizes only the rows matched by an active search in vendor view", async () => {
  const user = userEvent.setup();
  renderConsole();

  await user.type(
    screen.getByRole("searchbox", { name: /search capabilities/i }),
    "lifecycle hooks",
  );
  await user.click(screen.getByRole("button", { name: "Vendor comparison" }));

  expect(screen.getByRole("status")).toHaveTextContent("1 capability shown");
  expect(screen.getByText("1 filtered capabilities")).toBeVisible();
  expect(screen.getByText("Lifecycle hooks")).toBeVisible();
  expect(replace).toHaveBeenLastCalledWith(
    "/?q=lifecycle+hooks&view=vendors",
    { scroll: false },
  );
});

it("restores the vendor comparison from browser URL state", async () => {
  window.history.replaceState({}, "", "/?view=vendors");
  renderConsole();

  expect(
    await screen.findByRole("heading", {
      name: /anthropic and openai vendor comparison/i,
    }),
  ).toBeVisible();
  expect(screen.getByRole("button", { name: "Vendor comparison" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
