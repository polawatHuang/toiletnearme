'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toiletAPI } from '@/lib/api';
import { MapPinIcon, ChatBubbleLeftRightIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      toiletAPI.stats(),
      toiletAPI.list({ status: 'pending', limit: 10 }),
    ])
      .then(([s, p]) => {
        setStats(s.data);
        setPending(p.data.toilets || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async id => {
    await toiletAPI.updateStatus(id, 'active');
    setPending(prev => prev.filter(t => t.id !== id));
    setStats(prev => ({ ...prev, pending: prev.pending - 1, active: prev.active + 1 }));
  };
  const handleReject = async id => {
    await toiletAPI.updateStatus(id, 'inactive');
    setPending(prev => prev.filter(t => t.id !== id));
    setStats(prev => ({ ...prev, pending: prev.pending - 1 }));
  };

  const cards = [
    { label: 'ห้องน้ำทั้งหมด',  value: stats?.total,    color: 'from-brand-500 to-brand-700',   icon: MapPinIcon },
    { label: 'รออนุมัติ',       value: stats?.pending,  color: 'from-amber-400 to-orange-500',  icon: ClockIcon },
    { label: 'รีวิวทั้งหมด',    value: stats?.reviews,  color: 'from-emerald-400 to-teal-600',  icon: ChatBubbleLeftRightIcon },
    { label: 'ผู้ใช้งาน',       value: stats?.users,    color: 'from-violet-500 to-purple-700', icon: UserGroupIcon },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">ภาพรวมระบบ ToiletMap Thailand</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, color, icon: Icon }) => (
          <div key={label} className={`rounded-2xl bg-gradient-to-br ${color} text-white p-5 shadow-lg`}>
            <Icon className="h-7 w-7 opacity-80 mb-3" />
            <p className="text-3xl font-extrabold">{loading ? '…' : (value ?? 0)}</p>
            <p className="text-sm opacity-80 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Pending toilets */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">รออนุมัติ ({pending.length})</h2>
          <Link href="/admin/toilets?status=pending" className="text-sm text-brand-600 hover:underline">ดูทั้งหมด →</Link>
        </div>
        {pending.length === 0 ? (
          <div className="px-6 py-10 text-center text-slate-400 text-sm">✅ ไม่มีรายการรออนุมัติ</div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {pending.map(t => (
              <li key={t.id} className="px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">🚽</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{t.name}</p>
                  <p className="text-xs text-slate-500 truncate">{t.address || `${parseFloat(t.lat).toFixed(4)}, ${parseFloat(t.lng).toFixed(4)}`}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleApprove(t.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition">
                    อนุมัติ
                  </button>
                  <button onClick={() => handleReject(t.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition">
                    ปฏิเสธ
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
