'use client';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { markerColor } from '@/lib/utils';

/* ── Fix default icon paths (leaflet + webpack issue) ──────── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/* ── Custom toilet marker icon ──────────────────────────────── */
const makeIcon = (rating, selected = false) => {
  const color = markerColor(rating);
  const size  = selected ? 52 : 42;
  const ring  = selected ? 'box-shadow:0 0 0 4px rgba(6,182,212,0.4),0 4px 16px rgba(0,0,0,0.25)' : 'box-shadow:0 2px 8px rgba(0,0,0,0.25)';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:3px solid white;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      ${ring};
      display:flex;align-items:center;justify-content:center;
      transition:all .15s ease;
    ">
      <span style="transform:rotate(45deg);font-size:${selected?22:18}px;line-height:1;">🚽</span>
    </div>`,
    iconSize:    [size, size],
    iconAnchor:  [size / 2, size],
    popupAnchor: [0, -size],
  });
};

/* Pending pin (where user clicked to add) */
const pendingIcon = L.divIcon({
  className: '',
  html: `<div style="width:32px;height:32px;background:#6366f1;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(99,102,241,.35),0 4px 12px rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;">
    <svg style="width:14px;height:14px;fill:white" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
  </div>`,
  iconSize: [32, 32], iconAnchor: [16, 32],
});

/* ── Fly to helper ───────────────────────────────────────────── */
function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 16, { animate: true, duration: 1 });
  }, [target, map]);
  return null;
}

/* ── Map click handler ───────────────────────────────────────── */
function ClickHandler({ isAddingMode, onMapClick }) {
  useMapEvents({
    click(e) {
      if (isAddingMode) onMapClick(e.latlng);
    },
  });
  return null;
}

/* ── Main map component ──────────────────────────────────────── */
export default function MapView({
  toilets = [],
  selectedId,
  onSelectToilet,
  isAddingMode,
  onMapClick,
  flyTarget,
  pendingPin,
}) {
  const THAILAND = [13.7563, 100.5018];

  return (
    <div className={`w-full h-full ${isAddingMode ? 'adding-mode' : ''}`}>
      <MapContainer
        center={THAILAND}
        zoom={12}
        zoomControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        <ClickHandler isAddingMode={isAddingMode} onMapClick={onMapClick} />
        {flyTarget && <FlyTo target={flyTarget} />}

        {/* Toilet markers */}
        {toilets.map(toilet => (
          <Marker
            key={toilet.id}
            position={[parseFloat(toilet.lat), parseFloat(toilet.lng)]}
            icon={makeIcon(toilet.avg_rating, toilet.id === selectedId)}
            eventHandlers={{ click: () => onSelectToilet?.(toilet) }}
          />
        ))}

        {/* Pending pin while adding */}
        {pendingPin && (
          <Marker position={[pendingPin.lat, pendingPin.lng]} icon={pendingIcon} />
        )}
      </MapContainer>

      {/* Adding mode overlay hint */}
      {isAddingMode && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] px-5 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-medium shadow-2xl flex items-center gap-2 animate-fade-in">
          <span className="text-lg">📍</span> คลิกบนแผนที่เพื่อระบุตำแหน่งห้องน้ำ
        </div>
      )}
    </div>
  );
}
