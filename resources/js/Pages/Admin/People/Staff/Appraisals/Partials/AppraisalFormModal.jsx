import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function AppraisalFormModal({ item, staffList, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, reset, errors } = useForm({
    staff_id: item?.staff_id ?? '',
    appraisal_date: item?.appraisal_date ? item.appraisal_date.split('T')[0] : new Date().toISOString().split('T')[0],
    period: item?.period ?? 'Year 2026',
    rating: item?.rating ?? 5.0,
    remarks: item?.remarks ?? '',
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.staff-appraisals.update', item.id), options);
    else post(route('admin.staff-appraisals.store'), options);
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] shadow-2xl overflow-hidden transform transition-all flex flex-col ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Performance Review' : 'New Staff Appraisal'}</h3>
            <p className="text-sm text-slate-500 mt-1">Evaluate staff performance score and remarks.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-slate-100">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="sm:col-span-2">
                <label className={labelClass}>Select Staff Member <span className="text-rose-500">*</span></label>
                <select value={data.staff_id} onChange={e => setData('staff_id', e.target.value)} required disabled={isEdit} className={`${inputClass} disabled:bg-slate-100 disabled:opacity-60`}>
                  <option value="" disabled>Choose...</option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name || ''} ({s.staff_id_no})</option>
                  ))}
                </select>
                {errors.staff_id && <p className="text-rose-500 text-xs mt-1">{errors.staff_id}</p>}
              </div>

              <div>
                <label className={labelClass}>Appraisal Date <span className="text-rose-500">*</span></label>
                <input type="date" value={data.appraisal_date} onChange={e => setData('appraisal_date', e.target.value)} required className={`${inputClass} font-mono`} />
                {errors.appraisal_date && <p className="text-rose-500 text-xs mt-1">{errors.appraisal_date}</p>}
              </div>

              <div>
                <label className={labelClass}>Evaluation Period <span className="text-rose-500">*</span></label>
                <input type="text" value={data.period} onChange={e => setData('period', e.target.value)} required placeholder="e.g. Q1 2026 or Year 2025-2026" className={inputClass} />
                {errors.period && <p className="text-rose-500 text-xs mt-1">{errors.period}</p>}
              </div>

              <div className="sm:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <label className={labelClass} style={{ marginBottom: 0 }}>Performance Rating (1.0 to 5.0) <span className="text-rose-500">*</span></label>
                  <span className="text-lg font-black text-indigo-600 font-mono bg-white px-3 py-0.5 rounded-lg border border-slate-200 shadow-sm">{data.rating} / 5.0</span>
                </div>
                <input 
                  type="range" 
                  min="1" max="5" step="0.5" 
                  value={data.rating} 
                  onChange={e => setData('rating', parseFloat(e.target.value))} 
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2"
                />
                <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-1 font-mono">
                  <span>1.0 (Poor)</span>
                  <span>3.0 (Average)</span>
                  <span>5.0 (Excellent)</span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Evaluator Remarks / Comments</label>
                <textarea rows="4" value={data.remarks} onChange={e => setData('remarks', e.target.value)} placeholder="Provide detailed feedback on performance..." className={`${inputClass} resize-none`} />
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} disabled={processing} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
              <Icon name="star" className="w-4 h-4" />
              {processing ? 'Saving...' : 'Save Appraisal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}