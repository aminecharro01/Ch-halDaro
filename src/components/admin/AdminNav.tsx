'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeft } from 'lucide-react';

const NAV = [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true }];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-56 shrink-0">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-green-400 mb-6 uppercase tracking-widest"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to app
      </Link>
      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.25em] mb-4">Admin</p>
      <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                active
                  ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
