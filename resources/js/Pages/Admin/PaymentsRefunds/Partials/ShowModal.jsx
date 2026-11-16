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
            <h3 className="text-xl font-bold text-slate-900">Refund Details</h3>
            <p className="text-sm text-slate-500 mt-0.5">Information regarding this refund request.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          
          <div className="flex items-center gap-5 border-b border-slate-100 pb-5">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${
              item.status === 'Refunded' ? 'bg-sky-50 text-sky-600 border-sky-200' :
              item.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
              item.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-200' :
              'bg-amber-50 text-amber-600 border-amber-200'
            }`}>
              <Icon name="refresh" className="w-7 h-7" />
            </div>
            
            <div>
              <div className="text-3xl font-black text-rose-600 font-mono tracking-tight">
                {item.amount} <span className="text-lg text-rose-400">{item.transaction?.currency || 'BDT'}</span>
              </div>
              <div className="text-sm text-slate-500 mt-1">Original Trx: <span className="font-mono font-bold text-slate-700">{item.transaction?.transaction_id}</span></div>
            </div>

            <div className="ml-auto text-right">
              <span className={`inline-flex px-3 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border mt-1 ${
                item.status === 'Refunded' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                item.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                item.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {item.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 text-sm">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Original Paid Amount</span>
              <span className="font-semibold text-slate-800">
                {item.transaction?.amount || '0'} {item.transaction?.currency}
              </span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Refund Date</span>
              <span className="font-medium text-slate-800">{item.refund_date || 'Not yet refunded'}</span>
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 px-1">Reason for Refund</span>
            <div className="text-sm text-slate-700 bg-slate-50/50 border border-slate-200 p-4 rounded-xl min-h-[60px] whitespace-pre-wrap leading-relaxed">
              {item.reason}
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