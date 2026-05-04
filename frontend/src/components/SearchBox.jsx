'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  ClockIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { toiletAPI } from '@/lib/api';
import { geocode } from '@/lib/utils';

const RECENT_KEY = 'tnm_recent';
const MAX_RECENT = 5;

function getRecent() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}
function saveRecent(item) {
  const prev = getRecent().filter(r => r.label !== item.label);
  localStorage.setItem(RECENT_KEY, JSON.stringify([item, ...prev].slice(0, MAX_RECENT)));
}

function DistLabel({ d }) {
  if (d == null) return null;
  const text = d < 1 ? `${Math.round(d * 1000)} ม.` : `${d.toFixed(1)} กม.`;
  return <span className="text-xs text-slate-400 shrink-0 tabular-nums">{text}</span>;
}

function RatingBadge({ value }) {
  const n = parseFloat(value) || 0;
  if (n === 0) return null;
  const cls = n >= 4.5
    ? 'bg-emerald-100 text-emerald-700'
    : n >= 3.5
    ? 'bg-amber-100 text-amber-700'
    : 'bg-red-100 text-red-600';
  return <span className={`shrink-0 text-xs font-bold px-1.5 py-0.5 rounded-md ${cls}`}>{n.toFixed(1)}</span>;
}

export default function SearchBox({ userLat, userLng, onSelectToilet, onSelectPlace, value, onQueryChange }) {
  const [query,     setQuery]     = useState(value ?? '');
  const [open,      setOpen]      = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [toilets,   setToilets]   = useState([]);
  const [places,    setPlaces]    = useState([]);
  const [recent,    setRecent]    = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);

  const inputRef    = useRef(null);
  const wrapRef     = useRef(null);
  const timerRef    = useRef(null);
  const skipSyncRef = useRef(false); // prevent echo-loop

  /* load recent when dropdown opens */
  useEffect(() => { if (open) setRecent(getRecent()); }, [open]);

  /* close on outside click */
  useEffect(() => {
    const handler = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* sync when Navbar changes searchValue externally */
  useEffect(() => {
    if (value === undefined) return;
    if (skipSyncRef.current) { skipSyncRef.current = false; return; }
    setQuery(value);
    setActiveIdx(-1);
    if (value.trim().length >= 2) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => doSearch(value.trim()), 320);
      setOpen(true);
    } else {
      setToilets([]);
      setPlaces([]);
      if (!value) setOpen(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const doSearch = useCallback(async q => {
    setLoading(true);
    try {
      const [toiletRes, placeRes] = await Promise.allSettled([
        toiletAPI.suggest({ q, lat: userLat, lng: userLng }),
        geocode(q),
      ]);
      setToilets(toiletRes.status === 'fulfilled' ? (toiletRes.value.data?.toilets ?? []) : []);
      setPlaces(placeRes.status  === 'fulfilled' ? placeRes.value.slice(0, 4) : []);
    } finally {
      setLoading(false);
    }
  }, [userLat, userLng]);

  const handleChange = e => {
    const val = e.target.value;
    skipSyncRef.current = true; // we're the source — don't re-sync from parent
    setQuery(val);
    onQueryChange?.(val);       // keep Navbar in sync
    setActiveIdx(-1);
    setOpen(true);
    clearTimeout(timerRef.current);
    if (val.trim().length < 2) { setToilets([]); setPlaces([]); return; }
    timerRef.current = setTimeout(() => doSearch(val.trim()), 320);
  };

  /* flat list for keyboard navigation */
  const hasQuery    = query.trim().length >= 2;
  const resultItems = hasQuery
    ? [...toilets.map(t => ({ kind: 'toilet', t })), ...places.map(p => ({ kind: 'place', p }))]
    : recent.map(r => ({ kind: 'recent', r }));

  const pickToilet = t => {
    saveRecent({ kind: 'toilet', label: t.name, sub: t.address, id: t.id, lat: t.lat, lng: t.lng });
    skipSyncRef.current = true;
    setQuery(t.name);
    onQueryChange?.(t.name);
    setOpen(false);
    setRecent(getRecent());
    onSelectToilet?.(t);
  };

  const pickPlace = p => {
    const label = p.display_name?.split(',')[0] ?? p.display_name;
    saveRecent({ kind: 'place', label, sub: p.display_name, lat: p.lat, lng: p.lng });
    skipSyncRef.current = true;
    setQuery(label);
    onQueryChange?.(label);
    setOpen(false);
    setRecent(getRecent());
    onSelectPlace?.({ lat: p.lat, lng: p.lng, label });
  };

  const pickRecent = r => {
    skipSyncRef.current = true;
    setQuery(r.label);
    onQueryChange?.(r.label);
    setOpen(false);
    if (r.kind === 'toilet') onSelectToilet?.({ id: r.id, name: r.label, lat: r.lat, lng: r.lng });
    else                     onSelectPlace?.({ lat: r.lat, lng: r.lng, label: r.label });
  };

  const pickItem = item => {
    if (item.kind === 'toilet') pickToilet(item.t);
    else if (item.kind === 'place') pickPlace(item.p);
    else pickRecent(item.r);
  };

  const handleKey = e => {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, resultItems.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    if (e.key === 'Escape')    { setOpen(false); }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && resultItems[activeIdx]) {
        pickItem(resultItems[activeIdx]);
      } else if (query.trim()) {
        // fallback: geocode and fly
        geocode(query.trim()).then(r => { if (r[0]) { onSelectPlace?.(r[0]); setOpen(false); } });
      }
    }
  };

  const clearQuery = () => {
    skipSyncRef.current = true;
    setQuery('');
    onQueryChange?.('');
    setToilets([]);
    setPlaces([]);
    inputRef.current?.focus();
  };

  const showDropdown = open && (loading || hasQuery || recent.length > 0);
  const showEmpty    = !loading && hasQuery && toilets.length === 0 && places.length === 0;

  return (
    <div className="relative w-full" ref={wrapRef}>
      {/* ── Input ── */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder="ค้นหาห้องน้ำ หรือสถานที่…"
          autoComplete="off"
          className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border-slate-200 focus:ring-brand-400 focus:border-brand-400 bg-white"
        />
        {query && (
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={clearQuery}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full transition"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Dropdown ── */}
      {showDropdown && (
        <div className="absolute z-[2000] top-full mt-1.5 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-80 overflow-y-auto">

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400">
              <svg className="h-4 w-4 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-20" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" className="opacity-75" />
              </svg>
              กำลังค้นหา…
            </div>
          )}

          {/* ── Recent searches ── */}
          {!hasQuery && !loading && recent.length > 0 && (
            <>
              <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                ค้นหาล่าสุด
              </p>
              {recent.map((r, i) => (
                <button
                  key={i}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => pickRecent(r)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${activeIdx === i ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                >
                  <ClockIcon className="h-4 w-4 text-slate-300 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-slate-700 truncate">{r.label}</p>
                    {r.sub && <p className="text-xs text-slate-400 truncate">{r.sub}</p>}
                  </div>
                </button>
              ))}
            </>
          )}

          {/* ── Toilet results ── */}
          {!loading && hasQuery && toilets.length > 0 && (
            <>
              <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                🚽 ห้องน้ำที่ตรงกัน
              </p>
              {toilets.map((t, i) => (
                <button
                  key={t.id}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => pickToilet(t)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${activeIdx === i ? 'bg-brand-50' : 'hover:bg-brand-50'}`}
                >
                  <RatingBadge value={t.avg_rating} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{t.name}</p>
                    <p className="text-xs text-slate-400 truncate">{t.address}</p>
                  </div>
                  <DistLabel d={t.distance} />
                </button>
              ))}
            </>
          )}

          {/* ── Place results ── */}
          {!loading && hasQuery && places.length > 0 && (
            <>
              <p className={`px-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 ${toilets.length > 0 ? 'pt-2 border-t border-slate-50 mt-1' : 'pt-3'}`}>
                📍 สถานที่
              </p>
              {places.map((p, i) => {
                const label = p.display_name?.split(',')[0] ?? p.display_name;
                const idx   = toilets.length + i;
                return (
                  <button
                    key={i}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => pickPlace(p)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${activeIdx === idx ? 'bg-amber-50' : 'hover:bg-amber-50'}`}
                  >
                    <div className="shrink-0 w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                      <MapPinIcon className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{label}</p>
                      <p className="text-xs text-slate-400 truncate">{p.display_name}</p>
                    </div>
                  </button>
                );
              })}
            </>
          )}

          {/* ── Empty state ── */}
          {showEmpty && (
            <p className="px-4 py-6 text-sm text-center text-slate-400">
              ไม่พบผลลัพธ์สำหรับ &ldquo;<span className="font-medium text-slate-600">{query}</span>&rdquo;
            </p>
          )}
        </div>
      )}
    </div>
  );
}
