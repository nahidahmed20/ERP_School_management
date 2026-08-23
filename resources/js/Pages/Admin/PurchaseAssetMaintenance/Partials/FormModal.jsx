import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, assets, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    asset_id: item?.asset_id || '',
    title: item?.title || '',
    maintenance_type: item?.maintenance_type || 'Repair',
    service_provider: item?.service_provider || '',
    cost: item?.cost || '',
    start_date: item?.start_date || new Date().toISOString().split('T')[0],
    end_date: item?.end_date || '',
    status: item?.status || 'Pending',
    details: item?.details || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route('admin.purchase.asset-maintenance.update', item.id), {
        onSuccess: () => { reset(); onClose(); }
      });
    } else {
      post(route('admin.purchase.asset-maintenance.store'), {
        onSuccess: () => { reset(); onClose(); }
      });
    }
  };

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
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Maintenance Task' : 'Add Maintenance Task'}</h3>
            <p className="text-sm text-slate-500 mt-1">Record asset repair, servicing, or upgrade details.</p>
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
                <label className={labelClass}>Select Asset <span className="text-rose-500">*</span></label>
                <select
                  value={data.asset_id}
                  onChange={(e) => setData('asset_id', e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="" disabled>-- অ্যাসেট সিলেক্ট করুন --</option>
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>{asset.name}</option>
                  ))}
                </select>
                {errors.asset_id && <p className="text-rose-500 text-xs mt-1">{errors.asset_id}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Task Title <span className="text-rose-500">*</span></label>
                <input
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  placeholder="e.g. AC Gas Refill, RAM Upgrade"
                  required
                  className={inputClass}
                  autoFocus
                />
                {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className={labelClass}>Maintenance Type <span className="text-rose-500">*</span></label>
                <select value={data.maintenance_type} onChange={(e) => setData('maintenance_type', e.target.value)} required className={`${inputClass} bg-white`}>
                  <option value="Repair">Repair (মেরামত)</option>
                  <option value="Servicing">Servicing (সার্ভিসিং)</option>
                  <option value="Upgrade">Upgrade (আপগ্রেড)</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Estimated / Actual Cost <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  value={data.cost}
                  onChange={(e) => setData('cost', e.target.value)}
                  placeholder="0.00"
                  required
                  className={`${inputClass} font-mono text-lg font-bold text-rose-600 bg-white`}
                />
              </div>

              <div>
                <label className={labelClass}>Service Provider <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input
                  value={data.service_provider}
                  onChange={(e) => setData('service_provider', e.target.value)}
                  placeholder="Shop name or technician"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Status <span className="text-rose-500">*</span></label>
                <select value={data.status} onChange={(e) => setData('status', e.target.value)} required className={`${inputClass} bg-white`}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Start Date <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  value={data.start_date}
                  onChange={(e) => setData('start_date', e.target.value)}
                  required
                  className={`${inputClass} font-mono`}
                />
                {errors.start_date && <p className="text-rose-500 text-xs mt-1">{errors.start_date}</p>}
              </div>

              <div>
                <label className={labelClass}>End Date <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input
                  type="date"
                  value={data.end_date}
                  onChange={(e) => setData('end_date', e.target.value)}
                  min={data.start_date}
                  className={`${inputClass} font-mono`}
                />
                {errors.end_date && <p className="text-rose-500 text-xs mt-1">{errors.end_date}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Details / Issue Description</label>
                <textarea
                  rows="3"
                  value={data.details}
                  onChange={(e) => setData('details', e.target.value)}
                  placeholder="সমস্যার বিস্তারিত বর্ণনা বা কী কাজ করা হয়েছে..."
                  className={`${inputClass} resize-none`}
                />
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
              {processing ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
