'use client';
import { useEffect, useState } from 'react';
import { reviewAPI } from '@/lib/api';
import { fmtDate, fmtRating } from '@/lib/utils';
import { TrashIcon, ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const LIMIT = 30;

  const load = async () => {
    setLoading(true);
    try {
      const res = await reviewAPI.list({ limit: LIMIT, page });
      setReviews(res.data.reviews || []);
      setTotal(res.data.total || 0);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const filtered = search
    ? reviews.filter(r =>
        r.user_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.toilet_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.comment?.toLowerCase().includes(search.toLowerCase())
      )
    : reviews;

  const handleDelete = async id => {
    if (!confirm('ลบรีวิวนี้?')) return;
    await reviewAPI.delete(id);
    setReviews(prev => prev.filter(r => r.id !== id));
    setTotal(prev => prev - 1);
  };

  const STARS = ['', '★', '★★', '★★★', '★★★★', '★★★★★'];
  const STAR_CLS = { 5: 'text-emerald-600 bg-emerald-50', 4: 'text-emerald-600 bg-emerald-50', 3: 'text-amber-600 bg-amber-50', 2: 'text-red-500 bg-red-50', 1: 'text-red-500 bg-red-50' };

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">รีวิวทั้งหมด</h1>
          <p className="text-slate-500 text-sm">{total} รายการ</p>
        </div>
        <div className="sm:ml-auto relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหา…"
            className="pl-9 pr-3 py-2 rounded-xl border-slate-200 text-sm focus:ring-brand-400 focus:border-brand-400" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><ArrowPathIcon className="h-6 w-6 animate-spin text-slate-400" /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wide">
                    <th className="text-left px-5 py-3">ผู้รีวิว</th>
                    <th className="text-left px-3 py-3">ห้องน้ำ</th>
                    <th className="text-center px-3 py-3">คะแนน</th>
                    <th className="text-left px-3 py-3">ความคิดเห็น</th>
                    <th className="text-center px-3 py-3">วันที่</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {r.user_name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span className="font-medium text-slate-700">{r.user_name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-600 max-w-[150px]">
                        <span className="truncate block">{r.toilet_name}</span>
                      </td>
                      <td className="text-center px-3 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${STAR_CLS[r.rating]}`}>
                          {r.rating}.0 {STARS[r.rating]}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-600 max-w-xs">
                        <p className="line-clamp-2 text-xs leading-relaxed">{r.comment || <span className="text-slate-400 italic">ไม่มีความคิดเห็น</span>}</p>
                      </td>
                      <td className="text-center px-3 py-3 text-slate-400 text-xs whitespace-nowrap">{fmtDate(r.created_at)}</td>
                      <td className="px-3 py-3">
                        <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
              <span>หน้า {page} / {Math.max(1, Math.ceil(total / LIMIT))}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40 hover:bg-slate-50 transition">
                  ← ก่อนหน้า
                </button>
                <button onClick={() => setPage(p => p + 1)} disabled={page * LIMIT >= total}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm disabled:opacity-40 hover:bg-slate-50 transition">
                  ถัดไป →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
