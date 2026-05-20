'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { SearchBar } from '@/components/ui/SearchBar';

type HeaderProps = {
  user: boolean;
  isAdmin: boolean;
  logoutAction: () => Promise<void>;
};

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/tv', label: 'TV' },
  { href: '/world-cup-2026', label: 'WC2026' },
  { href: '/alerts', label: 'Alerts' },
] as const;

export function Header({ user, isAdmin, logoutAction }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 group transition-transform hover:scale-[1.02]"
            onClick={() => setMenuOpen(false)}
          >
            <Image
              src="/logo.webp"
              alt="Ch'hal Daro"
              width={40}
              height={40}
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
              priority
            />
            <span className="hidden sm:block font-bold text-lg sm:text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
              Ch&apos;hal Daro
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-4 flex-1 justify-end min-w-0">
            <SearchBar />
            <nav className="flex items-center gap-4 text-sm font-semibold shrink-0">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-gray-300 hover:text-white transition-colors whitespace-nowrap"
                >
                  {label}
                </Link>
              ))}
              {user ? (
                <>
                  {isAdmin && (
                    <Link href="/admin" className="text-indigo-400 hover:text-indigo-300 font-bold">
                      Admin
                    </Link>
                  )}
                  <Link href="/profile" className="text-gray-300 hover:text-white">
                    Profile
                  </Link>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 font-bold cursor-pointer"
                    >
                      Logout
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-1.5 rounded-full bg-green-600 text-white hover:bg-green-700 font-bold"
                >
                  Login
                </Link>
              )}
            </nav>
          </div>

          <button
            type="button"
            className="lg:hidden p-2 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="lg:hidden pb-4 space-y-4 border-t border-white/10 pt-4 animate-fade-up">
            <SearchBar />
            <nav className="flex flex-col gap-1 text-sm font-semibold">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/5"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="px-3 py-2.5 rounded-xl text-indigo-400 hover:bg-white/5"
                      onClick={() => setMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="px-3 py-2.5 rounded-xl text-gray-300 hover:bg-white/5"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="w-full text-left px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 font-bold"
                    >
                      Logout
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  className="mx-3 mt-1 block text-center py-2.5 rounded-xl bg-green-600 text-white font-bold"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
