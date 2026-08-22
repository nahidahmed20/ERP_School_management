import Icon from '@/Components/Icons';

export default function CampusViewModal({ item, onClose }) {
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
              <Icon name="building" className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{item.name}</h2>
              <p className="text-sm font-mono text-slate-500 mt-0.5">Code: {item.code}</p>
            </div>
          </div>
          
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Content Sections */}
        <div className="p-6 space-y-6 bg-white">
          
          {/* Section: Contact & Location */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Icon name="map-pin" className="w-3.5 h-3.5" /> Contact & Location
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="block text-[11px] font-semibold text-slate-500 uppercase">Phone Number</span>
                <span className="mt-1 block text-sm font-medium text-slate-800">{item.phone || <span className="text-slate-400 italic">Not Provided</span>}</span>
              </div>
              <div>
                <span className="block text-[11px] font-semibold text-slate-500 uppercase">Email Address</span>
                <span className="mt-1 block text-sm font-medium text-slate-800 break-all">{item.email || <span className="text-slate-400 italic">Not Provided</span>}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase">Physical Address</span>
                <span className="mt-1 block text-sm font-medium text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                  {item.address || <span className="text-slate-400 italic">No address recorded</span>}
                </span>
              </div>
            </div>
          </section>

          {/* Section: Additional Info */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Icon name="info" className="w-3.5 h-3.5" /> Additional Info
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="block text-[11px] font-semibold text-slate-500 uppercase">Established</span>
                <span className="mt-1 block text-sm font-bold text-slate-800">{item.established_year || <span className="text-slate-400 font-normal italic">N/A</span>}</span>
              </div>
              <div>
                <span className="block text-[11px] font-semibold text-slate-500 uppercase">Status & Tag</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide border ${item.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {item.is_main && (
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Main Campus
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition-all shadow-sm">
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}