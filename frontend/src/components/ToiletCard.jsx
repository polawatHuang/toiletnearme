'use client';
import { MapPinIcon, StarIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import StarRating from '@/components/ui/StarRating';
import { fmtRating, fmtDistance, ratingColor } from '@/lib/utils';

export default function ToiletCard({ toilet, selected, onClick }) {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex gap-3 p-3 rounded-2xl transition-all duration-200 ${
        selected
          ? 'bg-brand-50 ring-2 ring-brand-400 shadow-md'
          : 'hover:bg-slate-50 hover:shadow-sm'
      }`}
    >
      {/* Photo */}
      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
        {toilet.photo_url
          ? <img src={`${API}${toilet.photo_url}`} alt={toilet.name} className="w-full h-full object-cover" />
          : <span className="text-2xl">🚽</span>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 text-sm leading-snug truncate">{toilet.name}</p>

        {toilet.address && (
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 flex items-center gap-1">
            <MapPinIcon className="h-3 w-3 shrink-0" />
            {toilet.address}
          </p>
        )}

        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
          <StarRating value={toilet.avg_rating} size="sm" />
          <span className={`text-xs font-bold ${ratingColor(toilet.avg_rating)}`}>
            {fmtRating(toilet.avg_rating)}
          </span>
          <span className="text-xs text-slate-400">({toilet.review_count} รีวิว)</span>

          {toilet.distance != null && (
            <span className="ml-auto text-xs font-medium text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-full">
              {fmtDistance(toilet.distance)}
            </span>
          )}
        </div>

        <div className="mt-1 flex gap-2">
          {toilet.has_fee ? (
            <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 rounded-full px-2 py-0.5">
              <CurrencyDollarIcon className="h-3 w-3" /> มีค่าใช้จ่าย
            </span>
          ) : (
            <span className="text-xs text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">ฟรี</span>
          )}
          {toilet.is_wheelchair_accessible && (
            <span className="text-xs text-blue-700 bg-blue-50 rounded-full px-2 py-0.5">♿</span>
          )}
          {toilet.status === 'pending' && (
            <span className="text-xs text-orange-700 bg-orange-50 rounded-full px-2 py-0.5">รออนุมัติ</span>
          )}
        </div>
      </div>
    </button>
  );
}
