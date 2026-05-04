'use client';
import { useEffect, useState } from 'react';
import {
  XMarkIcon, MapPinIcon, ClockIcon, StarIcon,
  CurrencyDollarIcon, PencilIcon, TrashIcon, ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';
import StarRating from '@/components/ui/StarRating';
import ReviewSection from '@/components/ReviewSection';
import { fmtRating, ratingColor, ratingBg } from '@/lib/utils';
import { toiletAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function ToiletDetail({ toilet, onClose, onReview, onUpdated, onDeleted, variant }) {
  const { user } = useAuth();
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const [deleting, setDeleting] = useState(false);

  const isSheet = variant === 'sheet';

  const handleDelete = async () => {
    if (!confirm(`ลบ "${toilet.name}" ออกจากระบบ?`)) return;
    setDeleting(true);
    try { await toiletAPI.delete(toilet.id); onDeleted?.(); }
    catch (e) { alert(e.message); setDeleting(false); }
  };

  return (
    <div className={`glass shadow-2xl border border-white/60 flex flex-col ${
      isSheet
        ? 'rounded-t-3xl max-h-[78vh]'
        : 'rounded-2xl max-h-[calc(100vh-6rem)] overflow-hidden'
    }`}>
      {/* Photo header */}
      <div className={`relative h-40 overflow-hidden shrink-0 ${
        isSheet ? 'rounded-t-3xl' : 'rounded-t-2xl'
      }`}>
        {/* Drag handle — sheet only */}
        {isSheet && (
          <div className="absolute top-0 inset-x-0 flex justify-center pt-2.5 z-10 pointer-events-none">
            <div className="w-10 h-1 rounded-full bg-white/60" />
          </div>
        )}
        {toilet.photo_url
          ? <img src={`${API}${toilet.photo_url}`} alt={toilet.name} className="w-full h-full object-cover" />
          : (
            <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center">
              <span className="text-6xl">🚽</span>
            </div>
          )
        }
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Rating badge */}
        <div className={`absolute bottom-3 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-sm font-bold ${ratingBg(toilet.avg_rating)}`}>
          <StarIcon className="h-4 w-4" />
          {fmtRating(toilet.avg_rating)}
          <span className="text-xs font-normal opacity-80">({toilet.review_count})</span>
        </div>

        {/* Close btn */}
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Title */}
        <h2 className="text-lg font-extrabold text-slate-800 leading-snug">{toilet.name}</h2>

        {/* Stars */}
        <div className="flex items-center gap-2 mt-1">
          <StarRating value={toilet.avg_rating} size="md" />
          <span className={`text-sm font-bold ${ratingColor(toilet.avg_rating)}`}>{fmtRating(toilet.avg_rating)}</span>
        </div>

        {/* Address */}
        {toilet.address && (
          <p className="flex items-start gap-1.5 text-sm text-slate-600 mt-2">
            <MapPinIcon className="h-4 w-4 mt-0.5 shrink-0 text-brand-500" />
            {toilet.address}
          </p>
        )}

        {/* Meta chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {toilet.opening_hours && (
            <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 rounded-full px-3 py-1">
              <ClockIcon className="h-3.5 w-3.5" /> {toilet.opening_hours}
            </span>
          )}
          {toilet.has_fee ? (
            <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 rounded-full px-3 py-1">
              <CurrencyDollarIcon className="h-3.5 w-3.5" /> ค่าเข้า {toilet.fee_amount ? `฿${toilet.fee_amount}` : ''}
            </span>
          ) : (
            <span className="text-xs text-emerald-700 bg-emerald-50 rounded-full px-3 py-1">✓ ฟรี</span>
          )}
          {toilet.is_wheelchair_accessible && (
            <span className="text-xs text-blue-700 bg-blue-50 rounded-full px-3 py-1">♿ รองรับผู้พิการ</span>
          )}
        </div>

        {/* Description */}
        {toilet.description && (
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">{toilet.description}</p>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onReview}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-semibold shadow hover:from-brand-600 hover:to-brand-700 transition"
          >
            <ChatBubbleLeftIcon className="h-4 w-4" /> รีวิว
          </button>
          {user?.role === 'admin' && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition disabled:opacity-60"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Reviews */}
        <div className="mt-5">
          <ReviewSection toiletId={toilet.id} />
        </div>
      </div>
    </div>
  );
}
