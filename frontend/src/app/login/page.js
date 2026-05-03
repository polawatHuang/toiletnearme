'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/lib/api';

export default function LoginPage() {
  const { login } = useAuth();
  const router     = useRouter();
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async data => {
    setError(''); setLoading(true);
    try {
      const res = await authAPI.login(data);
      login(res.data);
      router.push('/');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-cyan-50 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-500 to-brand-700 px-8 py-10 text-white text-center">
            <span className="text-5xl">🚽</span>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight">ToiletMap Thailand</h1>
            <p className="mt-1 text-brand-100 text-sm">เข้าสู่ระบบเพื่อใช้งานเต็มรูปแบบ</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-8 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">อีเมล</label>
              <input
                type="email"
                placeholder="you@example.com"
                {...register('email', { required: 'กรุณากรอกอีเมล' })}
                className="w-full rounded-xl border-slate-200 focus:ring-brand-400 focus:border-brand-400 text-sm"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">รหัสผ่าน</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password', { required: 'กรุณากรอกรหัสผ่าน' })}
                  className="w-full rounded-xl border-slate-200 focus:ring-brand-400 focus:border-brand-400 text-sm pr-10"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPw ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold shadow hover:from-brand-600 hover:to-brand-700 transition disabled:opacity-60"
            >
              {loading ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
            </button>

            <p className="text-center text-sm text-slate-600">
              ยังไม่มีบัญชี?{' '}
              <Link href="/register" className="font-semibold text-brand-600 hover:underline">สมัครสมาชิก</Link>
            </p>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          🔒 ข้อมูลของคุณปลอดภัยและเข้ารหัสทุกครั้ง
        </p>
      </div>
    </div>
  );
}
