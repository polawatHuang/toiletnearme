'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/lib/api';

export default function RegisterPage() {
  const { login } = useAuth();
  const router     = useRouter();
  const [showPw,  setShowPw]  = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async ({ name, email, password }) => {
    setError(''); setLoading(true);
    try {
      const res = await authAPI.register({ name, email, password });
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
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-brand-500 to-brand-700 px-8 py-10 text-white text-center">
            <span className="text-5xl">🚽</span>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight">สมัครสมาชิก</h1>
            <p className="mt-1 text-brand-100 text-sm">ร่วมช่วยกันแชร์จุดห้องน้ำทั่วไทย</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-8 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">ชื่อ-นามสกุล</label>
              <input
                placeholder="สมชาย ใจดี"
                {...register('name', { required: 'กรุณากรอกชื่อ', minLength: { value: 2, message: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร' } })}
                className="w-full rounded-xl border-slate-200 focus:ring-brand-400 focus:border-brand-400 text-sm"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">รหัสผ่าน</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  {...register('password', { required: 'กรุณากรอกรหัสผ่าน', minLength: { value: 6, message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' } })}
                  className="w-full rounded-xl border-slate-200 focus:ring-brand-400 focus:border-brand-400 text-sm pr-10"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPw ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">ยืนยันรหัสผ่าน</label>
              <input
                type="password"
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                {...register('confirmPassword', {
                  required: 'กรุณายืนยันรหัสผ่าน',
                  validate: v => v === watch('password') || 'รหัสผ่านไม่ตรงกัน',
                })}
                className="w-full rounded-xl border-slate-200 focus:ring-brand-400 focus:border-brand-400 text-sm"
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold shadow hover:from-brand-600 hover:to-brand-700 transition disabled:opacity-60"
            >
              {loading ? 'กำลังสมัคร…' : 'สมัครสมาชิก'}
            </button>

            <p className="text-center text-sm text-slate-600">
              มีบัญชีแล้ว?{' '}
              <Link href="/login" className="font-semibold text-brand-600 hover:underline">เข้าสู่ระบบ</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
