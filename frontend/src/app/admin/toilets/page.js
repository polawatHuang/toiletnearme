'use client';
import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { toiletAPI } from '@/lib/api';
import { fmtRating, fmtDate } from '@/lib/utils';
import {
  PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon, ClockIcon,
  MagnifyingGlassIcon, ArrowPathIcon, XMarkIcon, PhotoIcon,
} from '@heroicons/react/24/outline';

const STATUS_OPTS = ['all','active','pending','inactive'];
const STATUS_LABEL = { active: 'เปิดใช้', pending: 'รออนุมัติ', inactive: 'ปิดใช้' };
const STATUS_CLS   = { active: 'bg-emerald-100 text-emerald-700', pending: 'bg-amber-100 text-amber-700', inactive: 'bg-red-100 text-red-700' };

export default function AdminToiletsPage() {
  const [toilets,  setToilets]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState('all');
  const [editing,  setEditing]  = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState('');

  const { register, handleSubmit, reset, watch } = useForm();
  const hasFee = watch('has_fee');

  const load = async () => {
    setLoading(true);
    try {
      const res = await toiletAPI.list({ status, search: search || undefined, limit: 200 });
      setToilets(res.data.toilets || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [status]);

  const handleSearch = e => { e.preventDefault(); load(); };

  const openEdit = t => {
    setEditing(t);
    setPreview(null);
    reset({
      name:                    t.name,
      description:             t.description || '',
      address:                 t.address || '',
      lat:                     t.lat,
      lng:                     t.lng,
      opening_hours:           t.opening_hours || '',
      has_fee:                 !!t.has_fee,
      fee_amount:              t.fee_amount || '',
      is_wheelchair_accessible:!!t.is_wheelchair_accessible,
      status:                  t.status,
    });
  };

  const onSave = async data => {
    setErr(''); setSaving(true);
    try {
      const form = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (k === 'photo') return;
        form.append(k, v ?? '');
      });
      if (data.photo?.[0]) form.append('photo', data.photo[0]);
      const res = await toiletAPI.update(editing.id, form);
      setToilets(prev => prev.map(t => t.id === editing.id ? res.data.toilet : t));
      setEditing(null);
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async t => {
    if (!confirm(`ลบ "${t.name}"?`)) return;
    await toiletAPI.delete(t.id);
    setToilets(prev => prev.filter(x => x.id !== t.id));
  };

  const handleStatus = async (t, s) => {
    await toiletAPI.updateStatus(t.id, s);
    setToilets(prev => prev.map(x => x.id === t.id ? { ...x, status: s } : x));
  };

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">ห้องน้ำทั้งหมด</h1>
          <p className="text-slate-500 text-sm">{toilets.length} รายการ</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          {STATUS_OPTS.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${status === s ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {s === 'all' ? 'ทั้งหมด' : STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหา…"
              className="pl-9 pr-3 py-2 rounded-xl border-slate-200 text-sm focus:ring-brand-400 focus:border-brand-400" />
          </div>
          <button type="submit" className="px-3 py-2 rounded-xl bg-brand-500 text-white text-sm">
            <MagnifyingGlassIcon className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><ArrowPathIcon className="h-6 w-6 animate-spin text-slate-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-3">ชื่อ / ที่อยู่</th>
                  <th className="text-center px-3 py-3">คะแนน</th>
                  <th className="text-center px-3 py-3">รีวิว</th>
                  <th className="text-center px-3 py-3">สถานะ</th>
                  <th className="text-center px-3 py-3">เพิ่มเมื่อ</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {toilets.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                          {t.photo_url ? <img src={`${API}${t.photo_url}`} alt="" className="w-full h-full object-cover" /> : <span className="text-lg">🚽</span>}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 leading-snug">{t.name}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[200px]">{t.address || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center px-3 py-3 font-bold text-amber-500">{fmtRating(t.avg_rating)}</td>
                    <td className="text-center px-3 py-3 text-slate-600">{t.review_count}</td>
                    <td className="text-center px-3 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_CLS[t.status]}`}>
                        {STATUS_LABEL[t.status]}
                      </span>
                    </td>
                    <td className="text-center px-3 py-3 text-slate-400 text-xs">{fmtDate(t.created_at)}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {t.status === 'pending' && (
                          <>
                            <button onClick={() => handleStatus(t, 'active')}  title="อนุมัติ" className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"><CheckCircleIcon className="h-4 w-4" /></button>
                            <button onClick={() => handleStatus(t, 'inactive')} title="ปฏิเสธ" className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"><XCircleIcon className="h-4 w-4" /></button>
                          </>
                        )}
                        {t.status === 'active' && (
                          <button onClick={() => handleStatus(t, 'inactive')} title="ปิดใช้" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition"><XCircleIcon className="h-4 w-4" /></button>
                        )}
                        {t.status === 'inactive' && (
                          <button onClick={() => handleStatus(t, 'active')} title="เปิดใช้" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition"><CheckCircleIcon className="h-4 w-4" /></button>
                        )}
                        <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 transition"><PencilIcon className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(t)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"><TrashIcon className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit modal */}
      <Transition appear show={!!editing} as={Fragment}>
        <Dialog as="div" className="relative z-[2000]" onClose={() => setEditing(null)}>
          <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-brand-600 to-brand-800 px-6 py-5 flex justify-between items-center">
                  <Dialog.Title className="text-lg font-extrabold text-white">แก้ไขห้องน้ำ</Dialog.Title>
                  <button onClick={() => setEditing(null)} className="p-1.5 rounded-full hover:bg-white/20 text-white"><XMarkIcon className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit(onSave)} className="px-6 py-6 space-y-4 max-h-[75vh] overflow-y-auto">
                  {err && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{err}</div>}

                  {/* Photo */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">รูปภาพ</label>
                    <label className="flex flex-col items-center justify-center w-full h-28 rounded-2xl border-2 border-dashed border-slate-200 cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition overflow-hidden">
                      {preview
                        ? <img src={preview} alt="" className="w-full h-full object-cover" />
                        : editing?.photo_url
                          ? <img src={`${API}${editing.photo_url}`} alt="" className="w-full h-full object-cover" />
                          : <div className="flex flex-col items-center gap-1 text-slate-400"><PhotoIcon className="h-6 w-6" /><span className="text-xs">เปลี่ยนรูปภาพ</span></div>
                      }
                      <input type="file" accept="image/*" className="hidden" {...register('photo')}
                        onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = ev => setPreview(ev.target.result); r.readAsDataURL(f); } }} />
                    </label>
                  </div>

                  {[['name','ชื่อ *','text',{required:'กรุณากรอกชื่อ'}],['address','ที่อยู่','text',{}],['opening_hours','เวลาเปิด-ปิด','text',{}]].map(([name,label,type,rules]) => (
                    <div key={name}>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                      <input type={type} {...register(name, rules)} className="w-full rounded-xl border-slate-200 focus:ring-brand-400 focus:border-brand-400 text-sm" />
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">คำอธิบาย</label>
                    <textarea rows={2} {...register('description')} className="w-full rounded-xl border-slate-200 focus:ring-brand-400 focus:border-brand-400 text-sm resize-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label><input type="number" step="any" {...register('lat')} className="w-full rounded-xl border-slate-200 text-sm focus:ring-brand-400" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label><input type="number" step="any" {...register('lng')} className="w-full rounded-xl border-slate-200 text-sm focus:ring-brand-400" /></div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">สถานะ</label>
                    <select {...register('status')} className="w-full rounded-xl border-slate-200 text-sm focus:ring-brand-400">
                      <option value="active">เปิดใช้</option>
                      <option value="pending">รออนุมัติ</option>
                      <option value="inactive">ปิดใช้</option>
                    </select>
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('has_fee')} className="rounded text-brand-500" /> มีค่าใช้จ่าย</label>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('is_wheelchair_accessible')} className="rounded text-brand-500" /> ♿ ผู้พิการ</label>
                  </div>

                  {hasFee && (
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">ค่าบริการ (฿)</label><input type="number" step="0.01" min="0" {...register('fee_amount')} className="w-full rounded-xl border-slate-200 text-sm focus:ring-brand-400" /></div>
                  )}

                  <button type="submit" disabled={saving} className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold shadow transition disabled:opacity-60">
                    {saving ? 'กำลังบันทึก…' : 'บันทึก'}
                  </button>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
