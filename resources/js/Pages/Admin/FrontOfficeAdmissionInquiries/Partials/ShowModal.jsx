import Icon from '@/Components/Icons';

export default function ShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Inquiry Details</h3>
            <p className="text-sm text-slate-500 mt-0.5">Lead and admission interest overview.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Applicant Name</span>
              <strong className="text-base text-slate-900 mt-0.5 block">{item.applicant_name}</strong>
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</span>
              <span className={`inline-flex px-3 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border mt-1 ${
                item.status === 'Converted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                item.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                item.status === 'Follow-up' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {item.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm px-1">
            <div>
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Guardian Name</span>
              <span className="font-semibold text-slate-800">{item.guardian_name}</span>
            </div>
            <div>
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Phone Number</span>
              <span className="font-mono font-semibold text-indigo-600">{item.phone}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm px-1">
            <div>
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Class Interested</span>
              <span className="inline-flex px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-bold">
                {item.class_interested}
              </span>
            </div>
            <div>
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Inquiry Date</span>
              <span className="font-mono font-semibold text-slate-800">{item.inquiry_date}</span>
            </div>
          </div>

          <div className="px-1 border-t border-slate-100 pt-4">
            <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Next Follow-up Date</span>
            <span className="font-mono font-semibold text-amber-600">{item.next_follow_up_date || 'N/A'}</span>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 px-1">Notes / Remarks</span>
            <div className="text-sm text-slate-700 bg-slate-50/50 border border-slate-200 p-3.5 rounded-xl min-h-[60px] whitespace-pre-wrap leading-relaxed">
              {item.notes || <span className="text-slate-400 italic">No notes provided.</span>}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end rounded-b-2xl shrink-0">
          <button type="button" className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}