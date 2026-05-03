'use client';
import { useEffect, useState } from 'react';
import { reviewAPI } from '@/lib/api';
import StarRating from '@/components/ui/StarRating';
import { fmtDate, fmtRating } from '@/lib/utils';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';

export default function ReviewSection({ toiletId }) {
  const { user } = useAuth();
  const [reviews,  setReviews]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    reviewAPI.list({ toilet_id: toiletId, limit: 50 })
      .then(r => setReviews(r.data.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [toiletId]);

  const handleDelete = async id => {
    if (!confirm('ลบรีวิวนี้?')) return;
    try {
      await reviewAPI.delete(id);
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (e) { alert(e.message); }
  };

  if (loading) return (
    <div className="flex justify-center py-6">
      <ArrowPathIcon className="h-5 w-5 animate-spin text-slate-400" />
    </div>
  );

  return (
    <div>
      <h3 className="text-sm font-bold text-slate-700 mb-3">รีวิวทั้งหมด ({reviews.length})</h3>

      {reviews.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">ยังไม่มีรีวิว เป็นคนแรกที่รีวิว!</p>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="bg-slate-50 rounded-2xl p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
                    {r.user_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{r.user_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating value={r.rating} size="sm" />
                  <span className="text-xs text-slate-400">{fmtDate(r.created_at)}</span>
                </div>
              </div>
              {r.comment && (
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{r.comment}</p>
              )}
              {(user?.role === 'admin' || user?.id === r.user_id) && (
                <button onClick={() => handleDelete(r.id)} className="mt-1 text-xs text-red-400 hover:text-red-600 transition">
                  ลบ
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
