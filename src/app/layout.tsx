import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReplyPilot AI",
  description: "AI reply generator for creator agencies."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
