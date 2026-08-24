import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function RequestModal({ campuses, activeCampusId, onClose }) {
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin';

  const { data, setData, post, processing, reset, errors } = useForm({
    campus_id: activeCampusId,
    title: '',
    type: 'Leave',
    requester_name: auth?.user?.name || '',
    details: '',
  });

  function submit(e) {
    e.preventDefault();
    post(route('admin.workflow-approvals.store'), { onSuccess: () => { reset(); onClose(); } });
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
            <h3 className="text-xl font-bold text-slate-900">Submit New Request</h3>
            <p className="text-sm text-slate-500 mt-1">Create a workflow request for approval.</p>
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
                <label className={labelClass}>Campus (Optional)</label>
                <select
                  value={data.campus_id || ''}
                  onChange={(e) => setData('campus_id', e.target.value)}
                  disabled={!isSuperAdmin}
                  className={`${inputClass} ${!isSuperAdmin ? 'bg-slate-100 opacity-70' : 'bg-white'}`}
                >
                  <option value="">Global / System</option>
                  {campuses?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.campus_id && <p className="text-rose-500 text-xs mt-1">{errors.campus_id}</p>}
              </div>

              <div>
                <label className={labelClass}>Request Type <span className="text-rose-500">*</span></label>
                <select value={data.type} onChange={e => setData('type', e.target.value)} required className={`${inputClass} bg-white`}>
                  <option value="Leave">Leave Application</option>
                  <option value="Expense">Expense / Purchase</option>
                  <option value="Discount">Fee Discount</option>
                  <option value="General">General Request</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Requester Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={data.requester_name}
                  onChange={e => setData('requester_name', e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Request Title / Subject <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={data.title}
                  onChange={e => setData('title', e.target.value)}
                  required
                  placeholder="e.g. Need 3 days leave for sickness"
                  className={inputClass}
                  autoFocus
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Detailed Description <span className="text-rose-500">*</span></label>
                <textarea
                  rows="4"
                  value={data.details}
                  onChange={e => setData('details', e.target.value)}
                  required
                  placeholder="Explain your request in detail..."
                  className={`${inputClass} resize-none`}
                ></textarea>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
              <Icon name="check-circle" className="w-4 h-4" />
              {processing ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
