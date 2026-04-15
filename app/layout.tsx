import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ch'hal Daro - Football Live Score",
  description: "Live football scores, predictions, and AI insights.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur border-b border-gray-800">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
              <span className="text-2xl">⚽</span>
              <span className="text-live-green">ch'hal Daro</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
              <Link href="/world-cup-2026" className="text-gray-300 hover:text-white transition-colors">WC2026</Link>
              <Link href="/alerts" className="text-gray-300 hover:text-white transition-colors">Alerts</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
