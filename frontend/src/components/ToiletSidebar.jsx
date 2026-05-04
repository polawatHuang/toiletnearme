'use client';
import { useState, useMemo } from 'react';
import { MapPinIcon, ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ToiletCard from '@/components/ToiletCard';
import SearchBox from '@/components/SearchBox';

const FILTER_CHIPS = [
  { key: 'free',        label: 'ฟรี' },
  { key: 'wheelchair',  label: '♿ วีลแชร์' },
  { key: 'topRated',    label: '⭐ 4.0+' },
];

export default function ToiletSidebar({
  toilets, selected, loading,
  onSelect, onNearMe, onClose,
  userLat, userLng, onSearchSelectPlace,
}) {
  const [filters, setFilters] = useState({ free: false, wheelchair: false, topRated: false });

  const toggle = key => setFilters(f => ({ ...f, [key]: !f[key] }));

  const visible = useMemo(() => toilets.filter(t => {
    if (filters.free      && t.has_fee)                              return false;
    if (filters.wheelchair && !t.is_wheelchair_accessible)           return false;
    if (filters.topRated   && (parseFloat(t.avg_rating) || 0) < 4.0) return false;
    return true;
  }), [toilets, filters]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">
            🚽 ห้องน้ำใกล้เคียง
            <span className="ml-2 text-xs font-normal text-slate-400">{visible.length} จุด</span>
          </h2>
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

        {/* Smart search box */}
        <SearchBox
          userLat={userLat}
          userLng={userLng}
          onSelectToilet={t => { onSelect?.(t); }}
          onSelectPlace={onSearchSelectPlace}
        />

        {/* Near Me */}
        <button
          onClick={onNearMe}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-brand-200 text-brand-600 text-sm font-semibold hover:bg-brand-50 transition"
        >
          <MapPinIcon className="h-4 w-4" />
          ห้องน้ำใกล้ฉัน
        </button>

        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap">
          {FILTER_CHIPS.map(chip => (
            <button
              key={chip.key}
              onClick={() => toggle(chip.key)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                filters[chip.key]
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-brand-300 hover:text-brand-600'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 min-h-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400">
            <ArrowPathIcon className="h-6 w-6 animate-spin" />
            <p className="text-sm">กำลังโหลด…</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-400">
            <span className="text-4xl">🔍</span>
            <p className="text-sm text-center">ไม่พบห้องน้ำในบริเวณนี้</p>
          </div>
        ) : (
          visible.map(t => (
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
