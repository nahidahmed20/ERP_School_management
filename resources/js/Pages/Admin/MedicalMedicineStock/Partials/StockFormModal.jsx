import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function StockFormModal({ item, rooms, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    medical_room_id: item?.medical_room_id ?? '',
    medicine_name: item?.medicine_name ?? '',
    category: item?.category ?? 'Tablet',
    quantity: item?.quantity ?? 0,
    expiry_date: item?.expiry_date ? item.expiry_date.split('T')[0] : '',
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.medical.medicine-stock.update', item.id), options);
    else post(route('admin.medical.medicine-stock.store'), options);
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
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Medicine Stock' : 'Add Medicine to Stock'}</h3>
            <p className="text-sm text-slate-500 mt-1">Manage medicine inventory and expiry tracking.</p>
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
                <label className={labelClass}>Assign to Campus <span className="text-rose-500">*</span></label>
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
                <label className={labelClass}>Select Medical Room <span className="text-rose-500">*</span></label>
                <select value={data.medical_room_id} onChange={e => setData('medical_room_id', e.target.value)} required className={`${inputClass} bg-white`}>
                  <option value="" disabled>Select Room</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>Room: {r.room_number}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Medicine Name <span className="text-rose-500">*</span></label>
                <input 
                  value={data.medicine_name} 
                  onChange={e => setData('medicine_name', e.target.value)} 
                  required 
                  autoFocus 
                  placeholder="e.g. Paracetamol 500mg"
                  className={inputClass} 
                />
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <select value={data.category} onChange={e => setData('category', e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="Tablet">Tablet</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Bandage">Bandage/First Aid</option>
                  <option value="Ointment">Ointment / Cream</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Quantity in Stock <span className="text-rose-500">*</span></label>
                <input 
                  type="number" 
                  min="0" 
                  value={data.quantity} 
                  onChange={e => setData('quantity', e.target.value)} 
                  required 
                  className={`${inputClass} font-mono`} 
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Expiry Date (Optional)</label>
                <input 
                  type="date" 
                  value={data.expiry_date} 
                  onChange={e => setData('expiry_date', e.target.value)} 
                  className={`${inputClass} font-mono`} 
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
              {processing ? 'Saving...' : 'Save Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}