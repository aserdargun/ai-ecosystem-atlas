import { render, screen } from "@testing-library/react";
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
});
