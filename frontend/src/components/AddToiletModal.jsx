'use client';
import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { XMarkIcon, PhotoIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { toiletAPI } from '@/lib/api';

export default function AddToiletModal({ lat, lng, address, onClose, onAdded }) {
  const [preview,  setPreview]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { address, has_fee: false, is_wheelchair_accessible: false },
  });

  const hasFee = watch('has_fee');

  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const onSubmit = async data => {
    setError(''); setLoading(true);
    try {
      const form = new FormData();
      form.append('name',        data.name);
      form.append('description', data.description || '');
      form.append('address',     data.address || '');
      form.append('lat',         lat);
      form.append('lng',         lng);
      form.append('has_fee',     data.has_fee ? '1' : '0');
      form.append('fee_amount',  data.fee_amount || '');
      form.append('is_wheelchair_accessible', data.is_wheelchair_accessible ? '1' : '0');
      form.append('opening_hours', data.opening_hours || '');
      if (data.photo?.[0]) form.append('photo', data.photo[0]);

      const res = await toiletAPI.create(form);
      onAdded?.(res.data.toilet);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show as={Fragment}>
      <Dialog as="div" className="relative z-[2000]" onClose={onClose}>
        <Transition.Child as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150"  leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
            <Transition.Child as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 translate-y-8 sm:scale-95" enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"  leaveFrom="opacity-100 translate-y-0 sm:scale-100" leaveTo="opacity-0 translate-y-8 sm:scale-95">
              <Dialog.Panel className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-brand-500 to-brand-700 px-6 py-5 flex items-center justify-between">
                  <div>
                    <Dialog.Title className="text-lg font-extrabold text-white">เพิ่มห้องน้ำ</Dialog.Title>
                    <p className="text-brand-100 text-xs mt-0.5 flex items-center gap-1">
                      <MapPinIcon className="h-3.5 w-3.5" />
                      {lat.toFixed(5)}, {lng.toFixed(5)}
                    </p>
                  </div>
                  <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 text-white transition">
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-5 max-h-[70vh] overflow-y-auto">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
                  )}

                  {/* Photo upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">รูปภาพ</label>
                    <label className="flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed border-slate-200 cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition overflow-hidden">
                      {preview
                        ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                        : (
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <PhotoIcon className="h-8 w-8" />
                            <span className="text-xs">คลิกเพื่ออัปโหลดรูปภาพ</span>
                          </div>
                        )
                      }
                      <input type="file" accept="image/*" className="hidden" {...register('photo')} onChange={handleFile} />
                    </label>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">ชื่อจุดห้องน้ำ *</label>
                    <input
                      placeholder="เช่น ห้องน้ำสยามพารากอน ชั้น B1"
                      {...register('name', { required: 'กรุณากรอกชื่อ' })}
                      className="w-full rounded-xl border-slate-200 focus:ring-brand-400 focus:border-brand-400 text-sm"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">ที่อยู่</label>
                    <input
                      placeholder="ที่อยู่หรือสถานที่"
                      {...register('address')}
                      className="w-full rounded-xl border-slate-200 focus:ring-brand-400 focus:border-brand-400 text-sm"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">คำอธิบาย</label>
                    <textarea
                      rows={3}
                      placeholder="บอกรายละเอียดเพิ่มเติม เช่น ความสะอาด การเข้าถึง..."
                      {...register('description')}
                      className="w-full rounded-xl border-slate-200 focus:ring-brand-400 focus:border-brand-400 text-sm resize-none"
                    />
                  </div>

                  {/* Opening hours */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">เวลาเปิด-ปิด</label>
                    <input
                      placeholder="เช่น 08:00–20:00 หรือ 24 ชั่วโมง"
                      {...register('opening_hours')}
                      className="w-full rounded-xl border-slate-200 focus:ring-brand-400 focus:border-brand-400 text-sm"
                    />
                  </div>

                  {/* Has fee */}
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="has_fee" {...register('has_fee')} className="rounded text-brand-500 focus:ring-brand-400" />
                    <label htmlFor="has_fee" className="text-sm font-medium text-slate-700">มีค่าบริการ</label>
                  </div>

                  {hasFee && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">ค่าบริการ (บาท)</label>
                      <input type="number" step="0.01" min="0" placeholder="5.00" {...register('fee_amount')}
                        className="w-full rounded-xl border-slate-200 focus:ring-brand-400 focus:border-brand-400 text-sm" />
                    </div>
                  )}

                  {/* Wheelchair */}
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="wheelchair" {...register('is_wheelchair_accessible')} className="rounded text-brand-500 focus:ring-brand-400" />
                    <label htmlFor="wheelchair" className="text-sm font-medium text-slate-700">♿ รองรับผู้พิการ</label>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold shadow hover:from-brand-600 hover:to-brand-700 transition disabled:opacity-60"
                  >
                    {loading ? 'กำลังบันทึก…' : '✓ บันทึกห้องน้ำ'}
                  </button>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
