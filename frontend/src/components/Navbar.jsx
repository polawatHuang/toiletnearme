'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  MapPinIcon, MagnifyingGlassIcon, UserCircleIcon,
  ChevronDownIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon,
  Bars3Icon, XMarkIcon, ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';

export default function Navbar({ onSearch, onAddClick, searchValue, setSearchValue }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); router.push('/'); setMobileOpen(false); };

  const handleSearch = e => {
    e.preventDefault();
    onSearch?.(searchValue);
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-[1001] glass border-b border-white/40 shadow-sm">
      <div className="px-4 mx-auto flex h-16 items-center gap-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 mr-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-md text-xl">🚽</span>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
            แวะจุดขี้
          </span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative flex items-center">
            <MagnifyingGlassIcon className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchValue}
              onChange={e => setSearchValue?.(e.target.value)}
              placeholder="ค้นหาสถานที่ เช่น รามคำแหง, อโศก…"
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/70 border border-slate-200 text-sm placeholder-slate-400 focus:ring-2 focus:ring-brand-400 focus:outline-none transition"
            />
          </div>
        </form>

        {/* Desktop: Add Toilet button (logged-in only) */}
        {user && (
          <button
            onClick={onAddClick}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-semibold shadow hover:from-brand-600 hover:to-brand-700 transition"
          >
            <MapPinIcon className="h-4 w-4" />
            เพิ่มห้องน้ำ
          </button>
        )}

        {/* Desktop: Auth (logged-in dropdown) */}
        {user ? (
          <Menu as="div" className="hidden sm:block relative">
            <Menu.Button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition">
              <UserCircleIcon className="h-7 w-7 text-brand-600" />
              <span className="text-sm font-medium max-w-[120px] truncate">{user.name}</span>
              <ChevronDownIcon className="h-4 w-4 text-slate-500" />
            </Menu.Button>
            <Transition as={Fragment}
              enter="transition ease-out duration-100" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="transition ease-in duration-75"  leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Menu.Items className="absolute right-0 mt-2 w-52 origin-top-right rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 focus:outline-none overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
                {user.role === 'admin' && (
                  <Menu.Item>
                    {({ active }) => (
                      <Link href="/admin" className={`flex items-center gap-2 px-4 py-2.5 text-sm ${active ? 'bg-brand-50 text-brand-700' : 'text-slate-700'}`}>
                        <Cog6ToothIcon className="h-4 w-4" /> Admin Panel
                      </Link>
                    )}
                  </Menu.Item>
                )}
                <Menu.Item>
                  {({ active }) => (
                    <button onClick={handleLogout} className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm ${active ? 'bg-red-50 text-red-600' : 'text-slate-700'}`}>
                      <ArrowRightOnRectangleIcon className="h-4 w-4" /> ออกจากระบบ
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        ) : (
          /* Desktop: login/register links */
          <div className="hidden sm:flex items-center gap-2">
            <Link href="/login" className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-brand-600 transition">
              เข้าสู่ระบบ
            </Link>
            <Link href="/register" className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-semibold shadow hover:from-brand-600 hover:to-brand-700 transition">
              สมัครสมาชิก
            </Link>
          </div>
        )}

        {/* Mobile hamburger – always visible on mobile */}
        <button
          className="sm:hidden ml-auto p-2 rounded-lg hover:bg-slate-100 transition"
          onClick={() => setMobileOpen(v => !v)}
          aria-label="เมนู"
        >
          {mobileOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
        </button>
      </div>

      {/* ── Mobile dropdown menu ────────────────────────────── */}
      <Transition
        show={mobileOpen}
        as={Fragment}
        enter="transition ease-out duration-200" enterFrom="opacity-0 -translate-y-2" enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"  leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 -translate-y-2"
      >
        <div className="sm:hidden glass border-t border-white/40 px-4 py-4 space-y-2 shadow-lg">
          {user ? (
            <>
              {/* User info */}
              <div className="flex items-center gap-3 px-1 pb-3 border-b border-slate-100">
                <UserCircleIcon className="h-9 w-9 text-brand-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>

              {/* เพิ่มห้องน้ำ */}
              <button
                onClick={() => { onAddClick?.(); setMobileOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-semibold"
              >
                <MapPinIcon className="h-4 w-4" /> เพิ่มห้องน้ำ
              </button>

              {/* Admin */}
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 text-slate-700 text-sm font-medium"
                >
                  <Cog6ToothIcon className="h-4 w-4" /> Admin Panel
                </Link>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm font-semibold"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" /> ออกจากระบบ
              </button>
            </>
          ) : (
            <>
              {/* Guest: login & register */}
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 text-slate-700 text-sm font-semibold"
              >
                เข้าสู่ระบบ <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-semibold shadow"
              >
                สมัครสมาชิกฟรี
              </Link>
            </>
          )}
        </div>
      </Transition>
    </nav>
  );
}
