import type { Metadata } from "next";
import { Sofia_Sans } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";

const sofiaSans = Sofia_Sans({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-sofia-sans"
});

export const metadata: Metadata = {
  title: "Ch'hal Daro - Football Live Score",
  description: "Live football scores, predictions, and Match insights.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" className={`h-full dark ${sofiaSans.variable}`}>
      <body className={`${sofiaSans.className} min-h-full flex flex-col font-sans bg-slate-950 text-slate-50`}>
        <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-xl border-b border-white/10 shadow-sm transition-colors">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105">                <span className="font-bold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
              Ch'hal Daro
            </span>
            </Link>
            <nav className="flex items-center gap-4 md:gap-6 text-sm font-semibold">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors hidden sm:block">Home</Link>
              <Link href="/world-cup-2026" className="text-gray-300 hover:text-white transition-colors hidden sm:block">WC2026</Link>
              <Link href="/alerts" className="text-gray-300 hover:text-white transition-colors">Alerts</Link>

              {user ? (
                <div className="flex items-center gap-4">
                  <Link href="/profile" className="text-gray-300 hover:text-white transition-colors">Profile</Link>
                  <form action={logout}>
                    <button type="submit" className="px-4 py-1.5 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all cursor-pointer font-bold">
                      Logout
                    </button>
                  </form>
                </div>
              ) : (
                <Link href="/login" className="px-4 py-1.5 rounded-full bg-green-600 text-white hover:bg-green-700 shadow-md transition-all font-bold">
                  Login
                </Link>
              )}
            </nav>
          </div>
        </header>
        {process.env.DEMO_MODE === "true" && (
          <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
            <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg border border-white/20 animate-pulse uppercase tracking-widest">
              Demo Mode Active
            </span>
          </div>
        )}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
