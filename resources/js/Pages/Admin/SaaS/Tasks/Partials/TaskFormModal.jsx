import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function TaskFormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, reset, errors } = useForm({
    name: item?.name ?? '',
    command: item?.command ?? '',
    frequency: item?.frequency ?? '0 0 * * *', // Default: Daily at midnight
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.saas.tasks.update', item.id), options);
    else post(route('admin.saas.tasks.store'), options);
  }

  // Quick select helper for cron expressions
  const handleQuickFreq = (e) => {
    setData('frequency', e.target.value);
  };

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
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Scheduled Task' : 'Add New Task'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure automated artisan commands and cron intervals.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
            
            <div className="grid grid-cols-1 gap-5">
              
              <div>
                <label className={labelClass}>Task Description / Name <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={data.name} 
                  onChange={e => setData('name', e.target.value)} 
                  required 
                  placeholder="e.g. Send Daily Absent SMS" 
                  className={inputClass} 
                  autoFocus 
                />
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className={labelClass}>Artisan Command <span className="text-rose-500">*</span></label>
                <div className="flex items-stretch shadow-sm rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                  <span className="flex items-center px-4 bg-slate-100 text-slate-500 text-sm font-mono font-semibold border-r border-slate-200">
                    php artisan
                  </span>
                  <input
                    type="text"
                    value={data.command}
                    onChange={e => setData('command', e.target.value)}
                    required
                    placeholder="e.g. sms:send-absent"
                    className="block w-full px-4 py-2.5 bg-slate-50 text-sm font-mono text-indigo-700 outline-none"
                  />
                </div>
                {errors.command && <p className="text-rose-500 text-xs mt-1">{errors.command}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Quick Frequency Selector</label>
                  <select onChange={handleQuickFreq} defaultValue="" className={`${inputClass} bg-white`}>
                    <option value="" disabled>Select a preset...</option>
                    <option value="* * * * *">Every Minute (* * * * *)</option>
                    <option value="0 * * * *">Hourly (0 * * * *)</option>
                    <option value="0 0 * * *">Daily at Midnight (0 0 * * *)</option>
                    <option value="0 0 * * 0">Weekly on Sunday (0 0 * * 0)</option>
                    <option value="0 0 1 * *">Monthly on 1st (0 0 1 * *)</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Cron Expression <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={data.frequency} 
                    onChange={e => setData('frequency', e.target.value)} 
                    required 
                    placeholder="* * * * *" 
                    className={`${inputClass} font-mono font-bold tracking-widest text-center`} 
                  />
                  <span className="text-xs text-slate-400 mt-1.5 block text-center">Minute, Hour, Day, Month, Weekday</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
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
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Enable this task to run on schedule</span>
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
              <Icon name="clock" className="w-4 h-4" />
              {processing ? 'Saving...' : (isEdit ? 'Update Task' : 'Save Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}