import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import Page from "@/app/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

it("identifies the public application", async () => {
  render(await Page({ searchParams: Promise.resolve({}) }));
  expect(
    screen.getByRole("heading", { name: "AI Ecosystem Atlas" }),
  ).toBeInTheDocument();
  expect(screen.getByText(/evidence-backed comparison/i)).toBeInTheDocument();
});
