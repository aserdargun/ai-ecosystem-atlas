import { render, screen, within } from "@testing-library/react";
import { vi } from "vitest";
import Page from "@/app/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

it("identifies the public application", async () => {
  render(await Page({ searchParams: Promise.resolve({}) }));
  expect(
    screen.getByRole("link", { name: "AI Ecosystem Atlas home" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Compare the ecosystems." }),
  ).toBeInTheDocument();

  const coverage = screen.getByLabelText("Atlas coverage statistics");
  expect(within(coverage).getByText("Capabilities").parentElement).toHaveTextContent(
    "Capabilities66",
  );
  expect(within(coverage).getByText("Categories").parentElement).toHaveTextContent(
    "Categories17",
  );
  expect(
    within(coverage).getByText("Official sources").parentElement,
  ).toHaveTextContent("Official sources66");
  expect(
    within(coverage).getByText("Latest verification").parentElement,
  ).toHaveTextContent("Latest verificationAug 11, 2026");
});
