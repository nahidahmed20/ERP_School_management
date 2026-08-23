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
            <h3 className="text-xl font-bold text-slate-900">Postal Record Details</h3>
            <p className="text-sm text-slate-500 mt-0.5">Full details of the dispatch/receive entry.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Type</span>
              <span className={`inline-flex px-3 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border mt-1 ${
                item.type === 'Receive' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {item.type}
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Reference No</span>
              <strong className="text-sm font-mono text-slate-900 mt-0.5 block">{item.reference_no || 'N/A'}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm px-1">
            <div className="col-span-2">
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Title (To / From)</span>
              <span className="font-bold text-slate-900 text-lg">{item.title}</span>
            </div>
            <div>
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Date</span>
              <span className="font-mono font-semibold text-slate-800">{item.date}</span>
            </div>
          </div>

          <div className="px-1 border-t border-slate-100 pt-4">
            <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Address</span>
            <div className="text-sm font-medium text-slate-700">
              {item.address || <span className="text-slate-400 italic">No address provided.</span>}
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 px-1">Note / Description</span>
            <div className="text-sm text-slate-700 bg-slate-50/50 border border-slate-200 p-4 rounded-xl min-h-[60px] whitespace-pre-wrap leading-relaxed">
              {item.note || <span className="text-slate-400 italic">No note provided.</span>}
            </div>
          </div>

          <div className="px-1 border-t border-slate-100 pt-4 flex items-center justify-between">
            <span className="block font-bold text-slate-400 uppercase text-xs">Attachment File</span>
            {item.attachment ? (
              <a 
                href={`/storage/${item.attachment}`} 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg transition-colors border border-indigo-200 shadow-sm"
              >
                <Icon name="download" className="w-3.5 h-3.5" /> View Attached File
              </a>
            ) : (
              <span className="text-xs font-medium text-slate-400">No file attached.</span>
            )}
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