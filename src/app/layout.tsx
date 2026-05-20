import type { Metadata } from "next";
import { Sofia_Sans } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
import { PendingFavoriteResume } from "@/components/ui/PendingFavoriteResume";
import { getAdminUser } from "@/lib/admin/require-admin";
import { MaintenanceBanner } from "@/components/ui/MaintenanceBanner";
import { Header } from "@/components/ui/Header";

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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = user ? await getAdminUser(user) : null;

  return (
    <html lang="en" className={`h-full dark ${sofiaSans.variable}`} suppressHydrationWarning>
      <body
        className={`${sofiaSans.className} min-h-dvh flex flex-col font-sans text-slate-50 antialiased overflow-x-hidden`}
      >
        <div className="app-shell flex min-h-dvh flex-1 flex-col">
          <PendingFavoriteResume />
          <MaintenanceBanner />
          <Header user={!!user} isAdmin={!!admin} logoutAction={logout} />
          <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 min-w-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
