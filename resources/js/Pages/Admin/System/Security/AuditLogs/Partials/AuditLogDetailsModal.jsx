import Icon from '@/Components/Icons';

export default function AuditLogDetailsModal({ log, onClose }) {
  // Extract pure model name without namespace
  const modelName = log.model_type.split('\\').pop();

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>

      {/* Responsive Modal Box */}
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-xl font-bold text-slate-900 m-0">Audit Log Details</h3>
              <span className={`inline-flex px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase border ${
                log.action === 'created' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                log.action === 'updated' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                log.action === 'deleted' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {log.action}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-500">
              Action performed on <strong className="text-slate-800">{modelName} (ID: {log.model_id})</strong> at <span className="font-mono">{new Date(log.created_at).toLocaleString()}</span>
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">

          {/* User & IP Card */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm gap-4">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Performed By</div>
              {log.user ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                    {log.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-slate-900 block leading-tight">{log.user.name}</strong>
                    <span className="text-xs text-slate-500 font-medium">{log.user.email}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-600">
                  <Icon name="cpu" className="w-6 h-6 text-slate-400" />
                  <strong className="text-sm font-bold italic">System / Automated Task</strong>
                </div>
              )}
            </div>

            <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">IP Address</div>
              <div className="flex items-center sm:justify-end gap-1.5">
                <Icon name="globe" className="w-4 h-4 text-slate-400" />
                <strong className="text-sm font-bold text-slate-900 font-mono">{log.ip_address || 'N/A'}</strong>
              </div>
            </div>
          </div>

          {/* Data Payloads Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Old Values (If any) */}
            {(log.action === 'updated' || log.action === 'deleted') && (
              <div className="flex flex-col h-full">
                <h4 className="flex items-center gap-1.5 text-sm font-bold text-rose-700 mb-2">
                  <Icon name="minus-circle" className="w-4 h-4" /> Previous Data (Old Values)
                </h4>
                <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl shadow-inner flex-1 overflow-x-auto custom-scrollbar">
                  <pre className="text-xs font-mono leading-relaxed text-rose-800">
                    {log.old_values ? JSON.stringify(log.old_values, null, 2) : 'No old data recorded.'}
                  </pre>
                </div>
              </div>
            )}

            {/* New Values (If any) */}
            {(log.action === 'created' || log.action === 'updated') && (
              <div className="flex flex-col h-full">
                <h4 className="flex items-center gap-1.5 text-sm font-bold text-emerald-700 mb-2">
                  <Icon name="plus-circle" className="w-4 h-4" /> New Data (Changed Values)
                </h4>
                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl shadow-inner flex-1 overflow-x-auto custom-scrollbar">
                  <pre className="text-xs font-mono leading-relaxed text-emerald-800">
                    {log.new_values ? JSON.stringify(log.new_values, null, 2) : 'No new data recorded.'}
                  </pre>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end rounded-b-2xl shrink-0">
          <button type="button" className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm active:scale-95" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
