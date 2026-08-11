import { render, screen } from "@testing-library/react";
import Page from "@/app/page";

it("identifies the public application", () => {
  render(<Page />);
  expect(
    screen.getByRole("heading", { name: "AI Ecosystem Atlas" }),
  ).toBeInTheDocument();
  expect(screen.getByText(/evidence-backed comparison/i)).toBeInTheDocument();
});
