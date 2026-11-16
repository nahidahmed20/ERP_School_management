import Icon from '@/Components/Icons';

export default function ShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div 
        className="mm-modal" 
        onClick={(e) => e.stopPropagation()} 
        style={{ padding: 0, overflow: 'hidden', maxWidth: '32rem', width: '100%' }}
      >
        {/* Header */}
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Interview Details</h3>
            <p className="text-sm text-slate-500 mt-0.5">Overview of the candidate's interview.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="sm:col-span-2 border-b border-slate-200 pb-3 mb-1">
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Applicant</span>
              <strong className="text-lg text-slate-900 mt-0.5 block">{item.applicant?.name}</strong>
              <span className="text-xs font-semibold text-indigo-600 mt-0.5 block">Applied for: {item.applicant?.job_post?.title}</span>
            </div>
            
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Interviewer</span>
              <strong className="text-sm text-slate-800 mt-0.5 block">{item.interviewer_name}</strong>
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</span>
              <span className={`inline-flex px-3 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border mt-1 ${
                item.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                item.status === 'Scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {item.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm px-1">
            <div>
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Date &amp; Time</span>
              <span className="font-semibold text-slate-800">{item.interview_date} <span className="text-slate-500 font-mono text-xs ml-1">at {item.interview_time}</span></span>
            </div>
            <div>
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Location</span>
              <span className="font-medium text-slate-700">{item.location || 'N/A'}</span>
            </div>
          </div>

          <div className="px-1 border-t border-slate-100 pt-4">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Remarks / Feedback</span>
            <div className="text-sm text-slate-700 bg-slate-50/50 border border-slate-200 p-4 rounded-xl min-h-[80px] whitespace-pre-wrap leading-relaxed">
              {item.remarks || <span className="text-slate-400 italic">No remarks provided.</span>}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end rounded-b-2xl">
          <button type="button" className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}