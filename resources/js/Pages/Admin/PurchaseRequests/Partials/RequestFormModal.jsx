import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function RequestFormModal({ item, users, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    requested_by: item?.requested_by ?? auth?.user?.id ?? '',
    title: item?.title ?? '',
    description: item?.description ?? '',
    estimated_amount: item?.estimated_amount ?? '',
    expected_date: item?.expected_date ?? '',
    status: item?.status ?? 'Pending',
    admin_remark: item?.admin_remark ?? '',
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.purchase.requests.update', item.id), options);
    else post(route('admin.purchase.requests.store'), options);
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
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Purchase Request' : 'New Purchase Request'}</h3>
            <p className="text-sm text-slate-500 mt-1">Submit or manage purchase requisitions.</p>
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
                <label className={labelClass}>Campus <span className="text-rose-500">*</span></label>
                <select
                  value={data.campus_id || ''}
                  onChange={(e) => setData('campus_id', e.target.value)}
                  disabled={!isSuperAdmin}
                  required
                  className={`${inputClass} ${!isSuperAdmin ? 'bg-slate-100 opacity-70' : 'bg-white'}`}
                >
                  <option value="" disabled>Select Campus</option>
                  {campuses?.map(campus => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
                </select>
                {errors.campus_id && <p className="text-rose-500 text-xs mt-1">{errors.campus_id}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Request Title (Purpose) <span className="text-rose-500">*</span></label>
                <input
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  autoFocus
                  required
                  placeholder="e.g. Need 10 new computers for Lab"
                  className={inputClass}
                />
                {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className={labelClass}>Requested By <span className="text-rose-500">*</span></label>
                <select value={data.requested_by} onChange={(e) => setData('requested_by', e.target.value)} required className={`${inputClass} bg-white`}>
                  <option value="" disabled>Select Requester</option>
                  {users?.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                {errors.requested_by && <p className="text-rose-500 text-xs mt-1">{errors.requested_by}</p>}
              </div>

              <div>
                <label className={labelClass}>Estimated Amount (৳) <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  value={data.estimated_amount}
                  onChange={(e) => setData('estimated_amount', e.target.value)}
                  min="0"
                  required
                  placeholder="0.00"
                  className={`${inputClass} font-mono font-bold text-emerald-600 bg-white`}
                />
                {errors.estimated_amount && <p className="text-rose-500 text-xs mt-1">{errors.estimated_amount}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Description / Item List <span className="text-rose-500">*</span></label>
                <textarea
                  rows="3"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="List the items needed and quantities..."
                  required
                  className={`${inputClass} resize-none`}
                />
                {errors.description && <p className="text-rose-500 text-xs mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className={labelClass}>Expected Date <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  value={data.expected_date}
                  onChange={(e) => setData('expected_date', e.target.value)}
                  required
                  className={`${inputClass} font-mono`}
                />
                {errors.expected_date && <p className="text-rose-500 text-xs mt-1">{errors.expected_date}</p>}
              </div>

              <div>
                <label className={labelClass}>Status (Admin Action)</label>
                <select value={data.status} onChange={(e) => setData('status', e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Admin Remark (If rejected/approved)</label>
                <textarea
                  rows="2"
                  value={data.admin_remark}
                  onChange={(e) => setData('admin_remark', e.target.value)}
                  placeholder="Reasons or comments..."
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
              {processing ? 'Saving...' : (isEdit ? 'Update Request' : 'Save Request')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
