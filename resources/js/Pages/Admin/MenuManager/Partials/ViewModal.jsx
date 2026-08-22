import Icon from '@/Components/Icons';

export default function ViewModal({ item, onClose }) {
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
        {/* Header Profile */}
        <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-start justify-between relative">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center text-indigo-600 shrink-0">
              <Icon name={item.icon || 'folder'} className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{item.label}</h2>
              <p className="text-sm font-mono text-slate-500 mt-0.5">{item.key}</p>
            </div>
          </div>
          
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Content Sections */}
        <div className="p-6 space-y-6 bg-white">
          
          {/* Section: Placement */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Placement Details</h3>
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="block text-[11px] font-semibold text-slate-500 uppercase">Group</span>
                <span className="mt-1 block text-sm font-bold text-slate-800">{item.group}</span>
              </div>
              <div>
                <span className="block text-[11px] font-semibold text-slate-500 uppercase">Parent</span>
                <span className="mt-1 block text-sm font-medium text-slate-700">{item.parent ?? <span className="text-slate-400 italic">Top-level Item</span>}</span>
              </div>
              <div>
                <span className="block text-[11px] font-semibold text-slate-500 uppercase">Order Level</span>
                <span className="mt-1 block text-sm font-bold text-slate-800">{item.order}</span>
              </div>
              <div>
                <span className="block text-[11px] font-semibold text-slate-500 uppercase">Current Status</span>
                <span className={`mt-1 inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${item.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {item.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </section>

          {/* Section: Routing & UI */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Routing & Display</h3>
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="col-span-2">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase">Assigned Route</span>
                {item.route_name ? (
                  <code className="mt-1 inline-block text-sm font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 break-all">
                    {item.route_name}
                  </code>
                ) : (
                  <span className="mt-1 block text-sm text-slate-400 italic">Not applicable</span>
                )}
              </div>
              <div>
                <span className="block text-[11px] font-semibold text-slate-500 uppercase">Icon Config</span>
                <span className="mt-1 block text-sm font-medium text-slate-700">{item.icon ?? <span className="text-slate-400 italic">None</span>}</span>
              </div>
              <div>
                <span className="block text-[11px] font-semibold text-slate-500 uppercase">Badge Count</span>
                <span className="mt-1 block text-sm font-bold text-rose-600">{item.badge_count ?? <span className="text-slate-400 font-normal italic">—</span>}</span>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm">
            Close View
          </button>
        </div>
      </div>
    </div>
  );
}