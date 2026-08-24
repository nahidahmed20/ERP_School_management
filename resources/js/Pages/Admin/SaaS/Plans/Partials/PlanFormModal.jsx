import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function PlanFormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, reset, errors } = useForm({
    name: item?.name ?? '',
    price: item?.price ?? '',
    currency: item?.currency ?? 'BDT',
    billing_cycle: item?.billing_cycle ?? 'Monthly',
    features: item?.features ? item.features.join('\n') : '', // join array with new lines for textarea
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.saas.plans.update', item.id), options);
    else post(route('admin.saas.plans.store'), options);
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>

      {/* Responsive Modal Box */}
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Subscription Plan' : 'Create New Plan'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure pricing, billing cycle, and plan features.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div className="sm:col-span-2">
                <label className={labelClass}>Plan Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={data.name}
                  onChange={e => setData('name', e.target.value)}
                  required
                  placeholder="e.g. Premium Plan"
                  className={inputClass}
                  autoFocus
                />
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className={labelClass}>Currency <span className="text-rose-500">*</span></label>
                <select value={data.currency} onChange={e => setData('currency', e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="BDT">BDT (৳)</option>
                  <option value="USD">USD ($)</option>
                </select>
                {errors.currency && <p className="text-rose-500 text-xs mt-1">{errors.currency}</p>}
              </div>

              <div>
                <label className={labelClass}>Price <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  value={data.price}
                  onChange={e => setData('price', e.target.value)}
                  required
                  placeholder="e.g. 5000"
                  className={inputClass}
                />
                {errors.price && <p className="text-rose-500 text-xs mt-1">{errors.price}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Billing Cycle <span className="text-rose-500">*</span></label>
                <select value={data.billing_cycle} onChange={e => setData('billing_cycle', e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="Lifetime">Lifetime (One-time)</option>
                </select>
                {errors.billing_cycle && <p className="text-rose-500 text-xs mt-1">{errors.billing_cycle}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Plan Features (One feature per line)</label>
                <textarea
                  rows="5"
                  value={data.features}
                  onChange={e => setData('features', e.target.value)}
                  placeholder="Unlimited Students&#10;Custom Domain&#10;Premium Support"
                  className={`${inputClass} resize-none leading-relaxed`}
                ></textarea>
                <span className="text-xs text-slate-400 mt-1.5 block flex items-center gap-1">
                  <Icon name="info" className="w-3.5 h-3.5" /> Press Enter to add a new feature.
                </span>
                {errors.features && <p className="text-rose-500 text-xs mt-1">{errors.features}</p>}
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer group w-max">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={data.is_active}
                      onChange={(e) => setData('is_active', e.target.checked)}
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-0 checked:bg-emerald-600 checked:border-emerald-600 cursor-pointer transition-colors"
                    />
                    <svg className="absolute w-3.5 h-3.5 top-[3px] left-[3px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Active Plan (Visible to clients)</span>
                </label>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
              <Icon name="save" className="w-4 h-4" />
              {processing ? 'Saving...' : (isEdit ? 'Update Plan' : 'Create Plan')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
