import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Studio — AI Video Generator",
  description: "Generate AI videos from a rough idea using OpenRouter, NVIDIA, and FFmpeg",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
