import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function ProcessModal({ item, onClose }) {
  const { data, setData, put, processing } = useForm({
    status: item.status,
    comment: '',
  });

  function submit(e) {
    e.preventDefault();
    put(route('admin.workflow-approvals.update', item.id), { onSuccess: () => onClose() });
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
            <h3 className="text-xl font-bold text-slate-900">Review Request</h3>
            <p className="text-sm text-slate-500 mt-1">Submitted by <span className="font-bold text-slate-700">{item.requester_name}</span></p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">

          {/* Request Info Block */}
          <div className="p-6 bg-white border-b border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-lg font-black text-slate-900 leading-tight">{item.title}</h4>
              <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                {item.type}
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
              {item.details}
            </p>
          </div>

          {/* Approval History Timeline */}
          {item.approval_chain && item.approval_chain.length > 0 && (
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                <Icon name="clock" className="w-4 h-4" /> Workflow History
              </h4>

              <div className="space-y-4 border-l-2 border-indigo-200 ml-2 pl-4 relative">
                {item.approval_chain.map((step, idx) => (
                  <div key={idx} className="relative bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    {/* Timeline Dot */}
                    <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[23px] top-5 border-2 border-white shadow-sm"></div>

                    <div className="flex justify-between items-center mb-1.5">
                      <strong className="text-sm font-bold text-slate-800">{step.user}</strong>
                      <span className="text-[10px] font-mono text-slate-500 font-semibold">{new Date(step.date).toLocaleString()}</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <span className="inline-flex w-2 h-2 rounded-full bg-indigo-400"></span> {step.action}
                    </div>
                    {step.comment && (
                      <div className="mt-2 text-sm text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        "{step.comment}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Form */}
          <form id="process-form" onSubmit={submit} className="p-6 bg-white">
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className={labelClass}>Action / Decision <span className="text-rose-500">*</span></label>
                <select value={data.status} onChange={e => setData('status', e.target.value)} required className={`${inputClass} bg-white font-semibold ${
                  data.status === 'Approved' ? 'text-emerald-700 border-emerald-300' :
                  data.status === 'Rejected' ? 'text-rose-700 border-rose-300' :
                  'text-slate-700'
                }`}>
                  <option value="Pending">Pending</option>
                  <option value="In Review">Mark as In Review</option>
                  <option value="Approved">Approve Request</option>
                  <option value="Rejected">Reject Request</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Remarks / Comments (Optional)</label>
                <textarea
                  rows="3"
                  value={data.comment}
                  onChange={e => setData('comment', e.target.value)}
                  placeholder="Explain reason for approval or rejection..."
                  className={`${inputClass} resize-none`}
                ></textarea>
              </div>
            </div>
          </form>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 rounded-b-2xl">
          <button type="button" onClick={onClose} disabled={processing} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
            Cancel
          </button>
          <button type="submit" form="process-form" disabled={processing} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
            <Icon name="check-circle" className="w-4 h-4" />
            {processing ? 'Updating...' : 'Update Workflow'}
          </button>
        </div>

      </div>
    </div>
  );
}
