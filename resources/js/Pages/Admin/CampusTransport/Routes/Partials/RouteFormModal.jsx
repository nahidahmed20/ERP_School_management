import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function RouteFormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    title: item?.title ?? '',
    start_point: item?.start_point ?? '',
    end_point: item?.end_point ?? '',
    base_fare: item?.base_fare ?? '',
    stops: Array.isArray(item?.stops) ? item.stops.join('\n') : (item?.stops ?? ''),
    is_active: item?.is_active ?? true,
  });

  function handleSubmit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) {
      put(route('admin.transport.routes.update', item.id), options);
    } else {
      post(route('admin.transport.routes.store'), options);
    }
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>

      {/* Responsive Modal Box */}
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Transport Route' : 'Add New Transport Route'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure bus route details, start/end points, and stops.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div className="sm:col-span-2">
                <label className={labelClass}>Route Title <span className="text-rose-500">*</span></label>
                <input
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  placeholder="e.g. Route A - Dhanmondi Line"
                  required
                  className={inputClass}
                  autoFocus
                />
                {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className={labelClass}>Start Point</label>
                <input
                  value={data.start_point}
                  onChange={(e) => setData('start_point', e.target.value)}
                  placeholder="e.g. School Campus"
                  className={inputClass}
                />
                {errors.start_point && <p className="text-rose-500 text-xs mt-1">{errors.start_point}</p>}
              </div>

              <div>
                <label className={labelClass}>End Point</label>
                <input
                  value={data.end_point}
                  onChange={(e) => setData('end_point', e.target.value)}
                  placeholder="e.g. Uttara Sector 7"
                  className={inputClass}
                />
                {errors.end_point && <p className="text-rose-500 text-xs mt-1">{errors.end_point}</p>}
              </div>

              <div>
                <label className={labelClass}>Base Fare (৳) <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={data.base_fare}
                  onChange={(e) => setData('base_fare', e.target.value)}
                  placeholder="0.00"
                  required
                  className={`${inputClass} font-mono font-bold text-indigo-600`}
                />
                {errors.base_fare && <p className="text-rose-500 text-xs mt-1">{errors.base_fare}</p>}
              </div>

              <div>
                <label className={labelClass}>Status</label>
                <select
                  value={data.is_active ? 1 : 0}
                  onChange={(e) => setData('is_active', e.target.value === '1')}
                  required
                  className={`${inputClass} bg-white`}
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Stops (প্রতি লাইনে একটি করে স্টপেজ লিখুন)</label>
                <textarea
                  rows="4"
                  value={data.stops}
                  onChange={(e) => setData('stops', e.target.value)}
                  placeholder="e.g.&#10;Science Lab&#10;New Market&#10;Azimpur"
                  className={`${inputClass} resize-none font-mono`}
                />
                <span className="text-xs text-slate-400 mt-1 block">প্রতিটি স্টপ আলাদা লাইনে (Enter প্রেস করে) এন্ট্রি করুন।</span>
                {errors.stops && <p className="text-rose-500 text-xs mt-1">{errors.stops}</p>}
              </div>

            </div>
          </div>

          {/* Footer - Stacked on Mobile, Row on Desktop */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
              <Icon name="save" className="w-4 h-4" />
              {processing ? 'Saving...' : (isEdit ? 'Update Route' : 'Save Route')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
