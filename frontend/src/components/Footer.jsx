'use client';
import { PhoneIcon, EnvelopeIcon, GlobeAltIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Top accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600" />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* ── About ── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🚽</span>
              <span className="text-white text-lg font-bold">แวะจุดขี้</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              แพลตฟอร์มค้นหาห้องน้ำสาธารณะในประเทศไทยที่ใหญ่ที่สุด
              เราเชื่อว่าการเข้าถึงห้องน้ำสะอาดเป็นสิทธิพื้นฐานของทุกคน
              ค้นหาห้องน้ำใกล้คุณได้ทันที ถ้าถูกใจฝากช่วยกันรีวิว ช่วยกันแชร์เว็บไซต์นี้ให้เพื่อนด้วยนะ 😊
            </p>
            <div className="flex items-center gap-1.5 mt-5 text-xs text-brand-400 font-medium">
              <MapPinIcon className="h-4 w-4" />
              ครอบคลุมทั่วประเทศไทย
            </div>
          </div>

          {/* ── Contact ── */}
          <div>
            <h3 className="text-white font-bold mb-5 text-base">
              📐 รับออกแบบ &amp; พัฒนาเว็บไซต์
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="tel:095-724-9324"
                  className="flex items-center gap-3 group text-slate-400 hover:text-white transition-colors"
                >
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-brand-600 transition-colors">
                    <PhoneIcon className="h-4 w-4" />
                  </span>
                  <span>095-724-9324 <span className="text-slate-500">(คุณโจ้)</span></span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:polawathuang@gmail.com"
                  className="flex items-center gap-3 group text-slate-400 hover:text-white transition-colors"
                >
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-brand-600 transition-colors">
                    <EnvelopeIcon className="h-4 w-4" />
                  </span>
                  <span>polawathuang@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="https://polawathuang.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group text-slate-400 hover:text-white transition-colors"
                >
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-brand-600 transition-colors">
                    <GlobeAltIcon className="h-4 w-4" />
                  </span>
                  <span>ดูผลงานเว็บไซต์อื่นๆ <span className="text-brand-400">→</span></span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <span>&copy; {currentYear} แวะจุดขี้.com — All rights reserved.</span>
          <span>Made with <span className="text-rose-400">♥</span> for your happiness</span>
        </div>
      </div>
    </footer>
  );
}