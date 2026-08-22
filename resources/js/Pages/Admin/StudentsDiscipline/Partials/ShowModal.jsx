import Icon from '@/Components/Icons';

export default function ShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Record Details</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          
          {/* Student Info Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold font-serif shrink-0 text-lg">
              {item.student?.first_name?.charAt(0)}
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Student</span>
              <strong className="text-base text-slate-900 block">{item.student?.first_name} {item.student?.last_name || ''}</strong>
              <div className="text-xs text-slate-500 mt-1">
                Adm: <span className="font-bold text-slate-700">{item.student?.admission_no}</span> • Class: <span className="font-bold text-slate-700">{item.student?.current_enrollment?.school_class?.name || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Record Details */}
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Title / Subject</span>
            <div className="text-base font-bold text-slate-800">{item.title}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Type</span>
              <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-xs font-bold uppercase tracking-wide">
                {item.type}
              </span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Incident Date</span>
              <div className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Icon name="calendar" className="w-4 h-4 text-slate-400" /> {item.incident_date}
              </div>
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</span>
            <div className="text-sm text-slate-700 bg-slate-50 border border-slate-100 p-3 rounded-xl min-h-[60px] whitespace-pre-wrap leading-relaxed">
              {item.description || <span className="italic text-slate-400">No description provided.</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Action Taken</span>
              <div className="text-sm text-slate-700 font-medium">
                {item.action_taken || <span className="italic text-slate-400">No action recorded.</span>}
              </div>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Reported By</span>
              <div className="text-sm text-slate-700 font-medium">
                {item.reported_by || <span className="italic text-slate-400">N/A</span>}
              </div>
            </div>
          </div>

        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm">
            Close View
          </button>
        </div>
      </div>
    </div>
  );
}