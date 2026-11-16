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
            <h3 className="text-xl font-bold text-slate-900">Alumni Details</h3>
            <p className="text-sm text-slate-500 mt-0.5">Profile and professional overview.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          
          <div className="flex items-center gap-5 border-b border-slate-100 pb-5">
            {item.photo ? (
              <img src={`/storage/${item.photo}`} alt={item.name} className="w-20 h-20 rounded-full object-cover border-2 border-indigo-100 shadow-sm shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center border border-slate-200 shrink-0">
                <Icon name="user" className="w-10 h-10" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-slate-900">{item.name}</h3>
              <span className="inline-block mt-1 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                Batch of {item.passing_year}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 text-sm">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Phone Number</span>
              <span className="font-mono font-semibold text-slate-800">{item.phone}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Email Address</span>
              <span className="font-medium text-slate-800">{item.email || 'N/A'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 text-sm">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Current Profession</span>
              <span className="font-semibold text-slate-800">{item.current_profession || 'N/A'}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Organization</span>
              <span className="font-semibold text-slate-800">{item.organization || 'N/A'}</span>
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 px-1">Current Address</span>
            <div className="text-sm text-slate-700 bg-slate-50/50 border border-slate-200 p-4 rounded-xl min-h-[60px] whitespace-pre-wrap leading-relaxed">
              {item.address || <span className="text-slate-400 italic">Address not provided.</span>}
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