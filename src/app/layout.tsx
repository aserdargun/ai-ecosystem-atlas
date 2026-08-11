import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Ecosystem Atlas",
  description: "A public, evidence-backed comparison of AI ecosystems.",
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
