import { useForm, router } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, assets, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    asset_id: item?.asset_id || '',
    assignee_name: item?.assignee_name || '',
    assigned_date: item?.assigned_date || new Date().toISOString().split('T')[0],
    due_date: item?.due_date || '',
    returned_date: item?.returned_date || '',
    status: item?.status || 'Assigned',
    note: item?.note || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route('admin.purchase.asset-assignments.update', item.id), { 
        onSuccess: () => { reset(); onClose(); } 
      });
    } else {
      post(route('admin.purchase.asset-assignments.store'), { 
        onSuccess: () => { reset(); onClose(); } 
      });
    }
  };

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div 
        className="mm-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ padding: 0, overflow: 'hidden', maxWidth: '800px', width: '100%' }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Assignment' : 'Assign Asset'}</h3>
            <p className="text-sm text-slate-500 mt-1">Issue an asset to a staff member.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]">
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            
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

              <div>
                <label className={labelClass}>Assignee Name <span className="text-rose-500">*</span></label>
                <input 
                  value={data.assignee_name} 
                  onChange={(e) => setData('assignee_name', e.target.value)} 
                  placeholder="কাকে দেওয়া হচ্ছে" 
                  required 
                  className={inputClass} 
                  autoFocus
                />
                {errors.assignee_name && <p className="text-rose-500 text-xs mt-1">{errors.assignee_name}</p>}
              </div>

              <div>
                <label className={labelClass}>Status <span className="text-rose-500">*</span></label>
                <select value={data.status} onChange={(e) => setData('status', e.target.value)} required className={`${inputClass} bg-white`}>
                  <option value="Assigned">Assigned (দেওয়া হয়েছে)</option>
                  <option value="Returned">Returned (ফেরত দিয়েছে)</option>
                  <option value="Damaged">Damaged (ক্ষতিগ্রস্ত)</option>
                  <option value="Lost">Lost (হারিয়ে গেছে)</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Assigned Date <span className="text-rose-500">*</span></label>
                <input 
                  type="date" 
                  value={data.assigned_date} 
                  onChange={(e) => setData('assigned_date', e.target.value)} 
                  required 
                  className={`${inputClass} font-mono`} 
                />
                {errors.assigned_date && <p className="text-rose-500 text-xs mt-1">{errors.assigned_date}</p>}
              </div>

              <div>
                <label className={labelClass}>Due Date <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input
                  type="date"
                  value={data.due_date}
                  onChange={(e) => setData('due_date', e.target.value)}
                  min={data.assigned_date} 
                  className={`${inputClass} font-mono`} 
                />
                {errors.due_date && <p className="text-rose-500 text-xs mt-1">{errors.due_date}</p>}
              </div>

              {data.status === 'Returned' && (
                <div className="sm:col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className={labelClass}>Returned Date</label>
                  <input 
                    type="date" 
                    value={data.returned_date} 
                    onChange={(e) => setData('returned_date', e.target.value)} 
                    className={`${inputClass} font-mono border-emerald-200 bg-emerald-50/30`} 
                  />
                </div>
              )}

              <div className="sm:col-span-2">
                <label className={labelClass}>Note / Condition</label>
                <textarea 
                  rows="3" 
                  value={data.note} 
                  onChange={(e) => setData('note', e.target.value)} 
                  placeholder="কোনো বিশেষ নোট (যেমন: চার্জারসহ)..." 
                  className={`${inputClass} resize-none`} 
                />
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
              <Icon name="save" className="w-4 h-4" />
              {processing ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}