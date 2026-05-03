'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  HomeIcon, MapPinIcon, ChatBubbleLeftRightIcon,
  ArrowRightOnRectangleIcon, ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';

const nav = [
  { href: '/admin',          label: 'Dashboard',         icon: ChartBarIcon },
  { href: '/admin/toilets',  label: 'ห้องน้ำทั้งหมด',   icon: MapPinIcon },
  { href: '/admin/reviews',  label: 'รีวิวทั้งหมด',     icon: ChatBubbleLeftRightIcon },
];

export default function AdminLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.replace('/login');
  }, [user, loading, router]);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="text-3xl animate-bounce">🚽</span>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col bg-slate-900 text-white">
        <div className="px-6 py-6 border-b border-slate-700">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🚽</span>
            <span className="font-extrabold text-lg">ToiletMap</span>
          </Link>
          <p className="mt-1 text-xs text-slate-400">Admin Panel</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                pathname === href
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-700">
          <div className="px-4 py-2 mb-2">
            <p className="text-xs text-slate-400">ล็อกอินเป็น</p>
            <p className="text-sm font-semibold truncate">{user.name}</p>
          </div>
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-slate-800 hover:text-red-400 transition"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" /> ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
