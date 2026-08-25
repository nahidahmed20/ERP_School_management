import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function BackupFormModal({ onClose }) {
  const { data, setData, post, processing, reset } = useForm({
    type: 'Database',
  });

  function submit(e) {
    e.preventDefault();
    post(route('admin.saas.backups.store'), {
      onSuccess: () => { reset(); onClose(); }
    });
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      
      {/* Responsive Modal Box */}
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Generate New Backup</h3>
            <p className="text-sm text-slate-500 mt-1">Select the type of data to secure.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">

            <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-xl flex items-start gap-3 shadow-sm">
              <Icon name="info" className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-blue-800 mb-0.5">Background Process</h4>
                <p className="text-xs font-medium text-blue-700 leading-relaxed">
                  Generating a backup might take a few minutes depending on the data size. The process will run securely in the background.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className={labelClass}>Select Backup Type <span className="text-rose-500">*</span></label>
                <select value={data.type} onChange={e => setData('type', e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="Database">Database Only (Recommended, Fast)</option>
                  <option value="Files">Application Files Only</option>
                  <option value="Full Backup">Full Backup (Database + Files)</option>
                </select>
                
                {data.type === 'Full Backup' && (
                  <div className="mt-3 bg-rose-50 border border-rose-200 p-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                    <Icon name="alert-triangle" className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="text-xs font-semibold text-rose-700 leading-tight">
                      Warning: Full backups can take up significant disk space and processing time.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-md shadow-slate-900/20 disabled:opacity-70 active:scale-95">
              {processing ? (
                <><Icon name="loader" className="w-4 h-4 animate-spin" /> Starting Process...</>
              ) : (
                <><Icon name="database" className="w-4 h-4" /> Generate Backup</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}