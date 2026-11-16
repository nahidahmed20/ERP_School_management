import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors } = useForm({
    name: item?.name || '',
    phone: item?.phone || '',
    date: item?.date || new Date().toISOString().split('T')[0],
    description: item?.description || '',
    next_follow_up_date: item?.next_follow_up_date || '',
    call_duration: item?.call_duration || '',
    call_type: item?.call_type || 'Incoming',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route('admin.frontoffice.call-logs.update', item.id), {
        onSuccess: () => onClose(),
      });
    } else {
      post(route('admin.frontoffice.call-logs.store'), {
        onSuccess: () => onClose(),
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
        style={{ padding: 0, overflow: 'hidden', maxWidth: '36rem', width: '100%' }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Call Log' : 'Add New Call Log'}</h3>
            <p className="text-sm text-slate-500 mt-1">Record incoming or outgoing phone calls.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]">
          <div className="p-6 overflow-y-auto space-y-5">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div>
                <label className={labelClass}>Caller / Receiver Name <span className="text-rose-500">*</span></label>
                <input 
                  value={data.name} 
                  onChange={(e) => setData('name', e.target.value)} 
                  placeholder="e.g. John Doe" 
                  className={inputClass} 
                  required 
                  autoFocus
                />
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className={labelClass}>Phone Number <span className="text-rose-500">*</span></label>
                <input 
                  value={data.phone} 
                  onChange={(e) => setData('phone', e.target.value)} 
                  placeholder="01XXXXXXXXX" 
                  className={`${inputClass} font-mono`} 
                  required 
                />
                {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className={labelClass}>Call Date <span className="text-rose-500">*</span></label>
                <input 
                  type="date" 
                  value={data.date} 
                  onChange={(e) => setData('date', e.target.value)} 
                  className={`${inputClass} font-mono`} 
                  required 
                />
              </div>

              <div>
                <label className={labelClass}>Call Type <span className="text-rose-500">*</span></label>
                <select value={data.call_type} onChange={(e) => setData('call_type', e.target.value)} required className={inputClass}>
                  <option value="Incoming">Incoming</option>
                  <option value="Outgoing">Outgoing</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Call Duration</label>
                <input 
                  value={data.call_duration} 
                  onChange={(e) => setData('call_duration', e.target.value)} 
                  placeholder="e.g. 3 mins" 
                  className={inputClass} 
                />
              </div>

              <div>
                <label className={labelClass}>Next Follow-up Date</label>
                <input 
                  type="date" 
                  value={data.next_follow_up_date} 
                  onChange={(e) => setData('next_follow_up_date', e.target.value)} 
                  className={`${inputClass} font-mono`} 
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Description / Notes</label>
                <textarea 
                  rows="3" 
                  value={data.description} 
                  onChange={(e) => setData('description', e.target.value)} 
                  placeholder="কথোপকথনের বিস্তারিত..." 
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
              {processing ? 'Saving...' : 'Save Call Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}