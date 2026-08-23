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
            <h3 className="text-xl font-bold text-slate-900">Gateway Credentials</h3>
            <p className="text-sm text-slate-500 mt-0.5">Integration keys and webhook details.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            {item.logo ? (
              <div className="w-16 h-16 bg-white rounded-xl border border-slate-200 p-2 flex items-center justify-center shrink-0 shadow-sm">
                <img src={`/storage/${item.logo}`} alt={item.name} className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200 shrink-0">
                <Icon name="card" className="w-8 h-8" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-slate-900">{item.name}</h3>
              <div className="text-sm text-slate-500 mt-1 font-mono">slug: {item.slug}</div>
            </div>
            <div className="ml-auto text-right">
              <span className={`inline-block px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border mb-1.5 ${item.mode === 'live' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                {item.mode} MODE
              </span>
              <div className={`text-sm font-bold flex items-center justify-end gap-1.5 ${item.is_active ? 'text-emerald-600' : 'text-slate-500'}`}>
                <div className={`w-2 h-2 rounded-full ${item.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                {item.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="block font-bold text-slate-400 uppercase text-[11px] mb-1.5 tracking-wider">API Key / Store ID</span>
              <div className="font-mono text-sm text-slate-800 break-all bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                {item.api_key || <span className="text-slate-400 italic">Not provided</span>}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="block font-bold text-slate-400 uppercase text-[11px] mb-1.5 tracking-wider">API Secret / Password</span>
              <div className="font-mono text-sm text-slate-800 break-all bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                {item.api_secret ? '********************************' : <span className="text-slate-400 italic">Not provided</span>}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="block font-bold text-slate-400 uppercase text-[11px] mb-1.5 tracking-wider">Webhook Secret</span>
              <div className="font-mono text-sm text-slate-800 break-all bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                {item.webhook_secret ? '********************************' : <span className="text-slate-400 italic">Not provided</span>}
              </div>
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