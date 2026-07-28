import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AppIdea - Ideation & Prompt Platform",
  description: "Securely manage prompts and generate app ideation presentations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-grow container mx-auto p-4 py-8">
          {children}
        </main>
        <footer className="bg-slate-900 text-slate-400 p-8 text-center border-t border-slate-800">
          <p>© {new Date().getFullYear()} AppIdea. All data is encrypted and stored locally.</p>
        </footer>
      </body>
    </html>
  );
}
