import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt     = 'แวะจุดขี้ – หาห้องน้ำทั่วประเทศไทย';
export const size    = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #0e7490 0%, #06b6d4 50%, #22d3ee 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex' }} />

        {/* Icon */}
        <div style={{ fontSize: 100, marginBottom: 20, display: 'flex' }}>🚽</div>

        {/* Title */}
        <div style={{
          fontSize: 72, fontWeight: 900, color: '#ffffff',
          letterSpacing: '-2px', textAlign: 'center',
          textShadow: '0 4px 24px rgba(0,0,0,0.3)',
          display: 'flex',
        }}>
          แวะจุดขี้
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: 32, color: 'rgba(255,255,255,0.9)',
          marginTop: 12, textAlign: 'center',
          display: 'flex',
        }}>
          หาห้องน้ำทั่วประเทศไทย · ฟรี
        </div>

        {/* Badge row */}
        <div style={{ display: 'flex', gap: 16, marginTop: 40 }}>
          {['📍 ค้นหาห้องน้ำใกล้คุณ', '⭐ รีวิวจากผู้ใช้จริง', '🗺️ แผนที่ทั่วไทย'].map(t => (
            <div key={t} style={{
              background: 'rgba(255,255,255,0.15)', borderRadius: 999,
              padding: '8px 20px', color: 'white', fontSize: 22,
              border: '1px solid rgba(255,255,255,0.3)',
              display: 'flex',
            }}>{t}</div>
          ))}
        </div>

        {/* Domain */}
        <div style={{ position: 'absolute', bottom: 28, right: 40, color: 'rgba(255,255,255,0.6)', fontSize: 20, display: 'flex' }}>
          แวะจุดขี้.com
        </div>
      </div>
    ),
    { ...size },
  );
}
