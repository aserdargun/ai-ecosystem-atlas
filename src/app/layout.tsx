import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Ecosystem Atlas — Compare AI ecosystems",
  description:
    "Evidence-backed comparisons across models, products, agents, APIs, and plans.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
