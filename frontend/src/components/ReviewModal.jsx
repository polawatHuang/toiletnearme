'use client';
import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import StarRating from '@/components/ui/StarRating';
import { reviewAPI, toiletAPI } from '@/lib/api';

export default function ReviewModal({ toilet, onClose, onReviewed }) {
  const [rating,  setRating]  = useState(5);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const { register, handleSubmit } = useForm();

  const onSubmit = async ({ comment }) => {
    if (!rating) { setError('กรุณาให้คะแนน'); return; }
    setError(''); setLoading(true);
    try {
      await reviewAPI.create({ toilet_id: toilet.id, rating, comment });
      // Fetch updated toilet
      const res = await toiletAPI.get(toilet.id);
      onReviewed?.(res.data.toilet);
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

        <div className="fixed inset-0 overflow-y-auto flex items-end sm:items-center justify-center p-0 sm:p-4">
          <Transition.Child as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0 translate-y-8 sm:scale-95" enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"  leaveFrom="opacity-100 translate-y-0 sm:scale-100" leaveTo="opacity-0 translate-y-8 sm:scale-95">
            <Dialog.Panel className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">

              {/* Header */}
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-5 flex items-center justify-between">
                <div>
                  <Dialog.Title className="text-lg font-extrabold text-white">เขียนรีวิว</Dialog.Title>
                  <p className="text-amber-50 text-xs mt-0.5 truncate">{toilet.name}</p>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 text-white transition">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
                )}

                {/* Star picker */}
                <div className="flex flex-col items-center gap-2 py-4">
                  <p className="text-sm font-medium text-slate-600">ให้คะแนนห้องน้ำนี้</p>
                  <StarRating value={rating} size="lg" onChange={setRating} />
                  <p className="text-2xl font-bold text-amber-500">{rating}.0</p>
                  <p className="text-sm text-slate-500">
                    {rating === 5 ? '😍 ยอดเยี่ยมมาก!' : rating === 4 ? '😊 ดีมาก' : rating === 3 ? '😐 ปานกลาง' : rating === 2 ? '😕 ไม่ค่อยดี' : '😠 แย่มาก'}
                  </p>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">ความคิดเห็น (ไม่บังคับ)</label>
                  <textarea
                    rows={4}
                    placeholder="บอกประสบการณ์ของคุณ เช่น ความสะอาด ความสะดวก ..."
                    {...register('comment')}
                    className="w-full rounded-xl border-slate-200 focus:ring-amber-400 focus:border-amber-400 text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold shadow hover:from-amber-500 hover:to-orange-600 transition disabled:opacity-60"
                >
                  {loading ? 'กำลังส่ง…' : '⭐ ส่งรีวิว'}
                </button>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
