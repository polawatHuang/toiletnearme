/** Format a number to rating display */
export const fmtRating = n => (parseFloat(n) || 0).toFixed(1);

/** Format distance */
export const fmtDistance = km => {
  if (!km) return '';
  return km < 1 ? `${Math.round(km * 1000)} ม.` : `${km.toFixed(1)} กม.`;
};

/** Rating colour classes */
export const ratingColor = rating => {
  const r = parseFloat(rating) || 0;
  if (r >= 4.5) return 'text-emerald-500';
  if (r >= 3.5) return 'text-amber-500';
  return 'text-red-500';
};

export const ratingBg = rating => {
  const r = parseFloat(rating) || 0;
  if (r >= 4.5) return 'bg-emerald-500';
  if (r >= 3.5) return 'bg-amber-500';
  return 'bg-red-500';
};

/** Marker colour for Leaflet */
export const markerColor = rating => {
  const r = parseFloat(rating) || 0;
  if (r >= 4.0) return '#10b981'; // emerald
  if (r >= 3.0) return '#f59e0b'; // amber
  return '#ef4444';               // red
};

/** Geocode a place name → { lat, lng, display_name } via Nominatim */
export async function geocode(query) {
  const q = encodeURIComponent(`${query} Thailand`);
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=5&accept-language=th`,
    { headers: { 'User-Agent': 'ToiletNearMe/1.0' } },
  );
  const data = await res.json();
  return data.map(d => ({
    lat:          parseFloat(d.lat),
    lng:          parseFloat(d.lon),
    display_name: d.display_name,
  }));
}

/** Reverse geocode lat/lng → address string */
export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=th`,
      { headers: { 'User-Agent': 'ToiletNearMe/1.0' } },
    );
    const data = await res.json();
    return data.display_name || '';
  } catch {
    return '';
  }
}

/** Format date to Thai locale */
export const fmtDate = iso =>
  new Date(iso).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
