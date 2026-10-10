import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QueueLess AI — Smart Hospital Token & Patient Management System",
  description:
    "Intelligent digital hospital token and patient journey management system eliminating OPD waiting queues and paper records.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
