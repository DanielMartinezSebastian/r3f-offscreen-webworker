import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "React Three Fiber",
  description:
    "A simple example of how to use React Three Fiber with WebWorkers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
