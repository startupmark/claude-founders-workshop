import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "acme-community",
  description: "A members-and-events tracker.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
