import React from 'react';
import Icon from '@/Components/Icons';

export default function LogDetailsModal({ log, onClose }) {
  if (!log) return null;

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>

      {/* Responsive Modal Box */}
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Sync Log Details</h3>
            <p className="text-xs font-mono font-semibold text-slate-500 mt-1">Logged at {new Date(log.created_at).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 shadow-sm">
              <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Punch Time</div>
              <strong className="text-lg font-black text-indigo-900 font-mono leading-tight">{new Date(log.punch_time).toLocaleTimeString()}</strong>
              <div className="text-xs text-indigo-700 font-semibold mt-0.5">{new Date(log.punch_time).toLocaleDateString()}</div>
            </div>

            <div className={`p-4 rounded-xl border shadow-sm ${log.sync_status === 'Success' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
              <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${log.sync_status === 'Success' ? 'text-emerald-500' : 'text-rose-500'}`}>Status</div>
              <div className="flex items-center gap-2 mt-1">
                <Icon name={log.sync_status === 'Success' ? 'check-circle' : 'x-circle'} className={`w-6 h-6 ${log.sync_status === 'Success' ? 'text-emerald-600' : 'text-rose-600'}`} />
                <strong className={`text-xl font-black leading-tight ${log.sync_status === 'Success' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {log.sync_status}
                </strong>
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-3 bg-slate-50 font-semibold text-slate-600 w-1/3 border-r border-slate-100">User Name</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{log.enrolled_user?.user_name || <span className="text-rose-500 italic flex items-center gap-1"><Icon name="alert-circle" className="w-4 h-4"/> Unknown User</span>}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 bg-slate-50 font-semibold text-slate-600 w-1/3 border-r border-slate-100">Biometric / Machine ID</td>
                  <td className="px-4 py-3 font-mono font-bold text-indigo-600">{log.biometric_id}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 bg-slate-50 font-semibold text-slate-600 w-1/3 border-r border-slate-100">Device Name</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{log.device?.name || <span className="text-slate-400 italic">Deleted / N/A</span>}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 bg-slate-50 font-semibold text-slate-600 w-1/3 border-r border-slate-100">Punch State</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold tracking-wide uppercase bg-slate-100 text-slate-600 border border-slate-200">
                      {log.punch_state}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Error Message Section */}
          {log.sync_status === 'Failed' && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl shadow-sm animate-in fade-in slide-in-from-bottom-2">
              <h4 className="flex items-center gap-1.5 text-sm font-bold text-rose-800 mb-1.5">
                <Icon name="alert-triangle" className="w-4 h-4" /> Error Message
              </h4>
              <p className="text-sm font-medium text-rose-700 leading-relaxed whitespace-pre-wrap">
                {log.error_message || 'Unknown error occurred during sync process.'}
              </p>
            </div>
          )}

          {/* Raw JSON Payload */}
          {log.raw_data && (
            <div>
              <h4 className="flex items-center gap-1.5 text-sm font-bold text-slate-800 mb-2">
                <Icon name="code" className="w-4 h-4 text-slate-500" /> Raw Device Payload (JSON)
              </h4>
              <div className="bg-slate-900 text-slate-300 p-4 rounded-xl overflow-x-auto shadow-inner border border-slate-800">
                <pre className="text-xs font-mono leading-relaxed">
                  {JSON.stringify(log.raw_data, null, 2)}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end rounded-b-2xl shrink-0">
          <button type="button" className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm active:scale-95" onClick={onClose}>
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
