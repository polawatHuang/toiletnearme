import { ImageResponse } from 'next/og';

export const runtime     = 'edge';
export const alt         = 'แวะจุดขี้';
export const size        = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleTouchIcon() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0e7490, #06b6d4)',
        borderRadius: 40,
        fontSize: 100,
      }}>
        🚽
      </div>
    ),
    { ...size },
  );
}
