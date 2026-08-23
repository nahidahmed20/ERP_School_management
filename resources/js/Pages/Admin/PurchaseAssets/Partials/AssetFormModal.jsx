import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function AssetFormModal({ item, users, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const defaultTag = `AST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    asset_tag: item?.asset_tag ?? defaultTag,
    name: item?.name ?? '',
    category: item?.category ?? 'Electronics',
    assigned_to: item?.assigned_to ?? '',
    location: item?.location ?? '',
    purchase_date: item?.purchase_date ?? '',
    cost: item?.cost ?? '',
    status: item?.status ?? 'Available',
    note: item?.note ?? '',
  });

  const handleAssigneeChange = (e) => {
    const userId = e.target.value;
    setData(data => ({
      ...data,
      assigned_to: userId,
      status: userId ? 'Assigned' : 'Available'
    }));
  };

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.purchase.assets.update', item.id), options);
    else post(route('admin.purchase.assets.store'), options);
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
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Asset Record' : 'Register New Asset'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure asset details, status and assignments.</p>
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

              <div>
                <label className={labelClass}>Asset Tag / Barcode <span className="text-rose-500">*</span></label>
                <input
                  value={data.asset_tag}
                  onChange={(e) => setData('asset_tag', e.target.value)}
                  required
                  placeholder="e.g. AST-2026-0001"
                  className={`${inputClass} font-mono`}
                />
                {errors.asset_tag && <p className="text-rose-500 text-xs mt-1">{errors.asset_tag}</p>}
              </div>

              <div>
                <label className={labelClass}>Asset Name <span className="text-rose-500">*</span></label>
                <input
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  autoFocus
                  required
                  placeholder='e.g. Dell Monitor 24"'
                  className={inputClass}
                />
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <select value={data.category} onChange={(e) => setData('category', e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="Electronics">Electronics / IT</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Current Status <span className="text-rose-500">*</span></label>
                <select value={data.status} onChange={(e) => setData('status', e.target.value)} required className={`${inputClass} bg-white`}>
                  <option value="Available">Available (In Store)</option>
                  <option value="Assigned">Assigned (In Use)</option>
                  <option value="Maintenance">Maintenance / Repair</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Assign To (Staff/User)</label>
                <select value={data.assigned_to} onChange={handleAssigneeChange} className={`${inputClass} bg-indigo-50/30 border-indigo-200`}>
                  <option value="">-- Keep Unassigned --</option>
                  {users?.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>

              <div>
                <label className={labelClass}>Location / Room</label>
                <input
                  value={data.location}
                  onChange={(e) => setData('location', e.target.value)}
                  placeholder="e.g. Lab-01, Principal Room"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Purchase Date</label>
                <input
                  type="date"
                  value={data.purchase_date || ''}
                  onChange={(e) => setData('purchase_date', e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Cost (৳)</label>
                <input
                  type="number"
                  value={data.cost}
                  onChange={(e) => setData('cost', e.target.value)}
                  min="0"
                  step="0.01"
                  className={`${inputClass} font-mono text-emerald-600 font-bold`}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Additional Notes</label>
                <textarea
                  rows="3"
                  value={data.note}
                  onChange={(e) => setData('note', e.target.value)}
                  placeholder="Condition, serial numbers, etc..."
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
              {processing ? 'Saving...' : (isEdit ? 'Update Asset' : 'Register Asset')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
