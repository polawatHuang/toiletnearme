'use client';
export default function StarRating({ value = 0, max = 5, size = 'md', onChange }) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  const sz = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-lg';

  return (
    <div className="flex items-center gap-0.5">
      {stars.map(star => (
        <button
          key={star}
          type={onChange ? 'button' : undefined}
          onClick={() => onChange?.(star)}
          className={`${sz} leading-none transition-transform ${onChange ? 'cursor-pointer hover:scale-125' : 'cursor-default'}`}
          style={{ color: star <= Math.round(value) ? '#f59e0b' : '#d1d5db' }}
          aria-label={`${star} stars`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
