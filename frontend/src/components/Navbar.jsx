'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  MapPinIcon, MagnifyingGlassIcon, UserCircleIcon,
  ChevronDownIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon,
  Bars3Icon, XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';

export default function Navbar({ onSearch, onAddClick, searchValue, setSearchValue }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); router.push('/'); };

  const handleSearch = e => {
    e.preventDefault();
    onSearch?.(searchValue);
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-white/40 shadow-sm">
      <div className="px-4 mx-auto flex h-16 items-center gap-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 mr-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-md text-xl">🚽</span>
          <span className="hidden sm:block font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
            ToiletMap
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

        {/* Add Toilet */}
        {user && (
          <button
            onClick={onAddClick}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-semibold shadow hover:from-brand-600 hover:to-brand-700 transition"
          >
            <MapPinIcon className="h-4 w-4" />
            เพิ่มห้องน้ำ
          </button>
        )}

        {/* Auth */}
        {user ? (
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition">
              <UserCircleIcon className="h-7 w-7 text-brand-600" />
              <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">{user.name}</span>
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
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-brand-600 transition">
              เข้าสู่ระบบ
            </Link>
            <Link href="/register" className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-semibold shadow hover:from-brand-600 hover:to-brand-700 transition">
              สมัครสมาชิก
            </Link>
          </div>
        )}

        {/* Mobile menu toggle */}
        <button className="sm:hidden ml-auto p-2 rounded-lg hover:bg-slate-100" onClick={() => setMobileOpen(v => !v)}>
          {mobileOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile extra row */}
      {mobileOpen && user && (
        <div className="sm:hidden px-4 pb-3 border-t border-slate-100">
          <button onClick={() => { onAddClick?.(); setMobileOpen(false); }}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-semibold">
            <MapPinIcon className="h-4 w-4" /> เพิ่มห้องน้ำ
          </button>
        </div>
      )}
    </nav>
  );
}
