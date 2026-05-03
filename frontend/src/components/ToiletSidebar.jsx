'use client';
import { MagnifyingGlassIcon, MapPinIcon, ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ToiletCard from '@/components/ToiletCard';

export default function ToiletSidebar({ toilets, selected, loading, onSelect, onNearMe, onSearch, searchValue, setSearchValue, onClose }) {
  const handleSubmit = e => { e.preventDefault(); onSearch?.(searchValue); };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-800">
            🚽 ห้องน้ำใกล้เคียง
            <span className="ml-2 text-xs font-normal text-slate-400">{toilets.length} จุด</span>
          </h2>
          {/* Close button – visible on mobile only */}
          {onClose && (
            <button
              onClick={onClose}
              className="sm:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition"
              aria-label="ปิด"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Search */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchValue}
              onChange={e => setSearchValue?.(e.target.value)}
              placeholder="ค้นหา เช่น รามคำแหง…"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border-slate-200 focus:ring-brand-400 focus:border-brand-400"
            />
          </div>
          <button type="submit" className="px-3 py-2 rounded-xl bg-brand-500 text-white text-sm hover:bg-brand-600 transition shrink-0">
            ค้นหา
          </button>
        </form>

        {/* Near Me */}
        <button
          onClick={onNearMe}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-brand-200 text-brand-600 text-sm font-semibold hover:bg-brand-50 transition"
        >
          <MapPinIcon className="h-4 w-4" />
          ห้องน้ำใกล้ฉัน
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 min-h-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400">
            <ArrowPathIcon className="h-6 w-6 animate-spin" />
            <p className="text-sm">กำลังโหลด…</p>
          </div>
        ) : toilets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-400">
            <span className="text-4xl">🔍</span>
            <p className="text-sm text-center">ไม่พบห้องน้ำในบริเวณนี้</p>
          </div>
        ) : (
          toilets.map(t => (
            <ToiletCard
              key={t.id}
              toilet={t}
              selected={selected?.id === t.id}
              onClick={() => onSelect?.(t)}
            />
          ))
        )}
      </div>
    </div>
  );
}
