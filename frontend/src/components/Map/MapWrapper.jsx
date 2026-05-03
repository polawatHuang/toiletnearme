'use client';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('./MapView'), {
  ssr:     false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <span className="text-4xl animate-bounce">🗺️</span>
        <p className="text-sm font-medium">กำลังโหลดแผนที่…</p>
      </div>
    </div>
  ),
});

export default function MapWrapper(props) {
  return <MapView {...props} />;
}
