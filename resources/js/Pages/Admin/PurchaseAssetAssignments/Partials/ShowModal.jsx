import Icon from '@/Components/Icons';

export default function ShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div 
        className="mm-modal" 
        onClick={(e) => e.stopPropagation()} 
        style={{ padding: 0, overflow: 'hidden', maxWidth: '600px', width: '100%' }}
      >
        {/* Header */}
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Assignment Details</h3>
            <p className="text-sm text-slate-500 mt-0.5">Asset allocation history and condition.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          
          <div className="flex flex-col sm:flex-row gap-5 border-b border-slate-100 pb-5">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
              <Icon name="box" className="w-8 h-8 text-slate-400" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900">{item.asset?.name}</h3>
              <div className="text-sm font-semibold text-indigo-700 mt-1 flex items-center gap-1.5">
                <Icon name="user" className="w-4 h-4" /> Assigned to: {item.assignee_name}
              </div>
            </div>

            <div className="text-left sm:text-right mt-2 sm:mt-0">
              <span className={`inline-flex px-3 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border ${
                item.status === 'Returned' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                item.status === 'Damaged' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                item.status === 'Lost' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}>
                {item.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 text-sm">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Assigned Date</span>
              <span className="font-semibold text-slate-800 font-mono">{item.assigned_date}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Due Date</span>
              <span className="font-medium text-slate-800 font-mono">{item.due_date || 'No due date'}</span>
            </div>
          </div>

          {item.returned_date && (
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-sm">
              <span className="block font-bold text-emerald-600/70 uppercase text-xs mb-1">Returned Date</span>
              <span className="font-bold text-emerald-700 font-mono">{item.returned_date}</span>
            </div>
          )}

          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 px-1">Notes / Condition</span>
            <div className="text-sm text-slate-700 bg-slate-50/50 border border-slate-200 p-4 rounded-xl min-h-[60px] whitespace-pre-wrap leading-relaxed">
              {item.note || <span className="text-slate-400 italic">No notes provided.</span>}
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