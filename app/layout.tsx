import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creonix | Creator operating system",
  description: "Create, manage, publish, and improve creator content from one workspace."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to content</a>{children}</body></html>;
}
