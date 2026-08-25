import React from 'react';
import Icon from '@/Components/Icons';

export default function QueueDetailsModal({ job, onClose }) {
  if (!job) return null;

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      
      {/* Responsive Modal Box */}
      <div 
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Job Execution Details</h3>
            <p className="text-xs font-mono font-semibold text-slate-500 mt-1">Logged on {new Date(job.created_at).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Job Class</div>
              <strong className="text-sm font-bold text-indigo-700 font-mono leading-tight break-all">{job.job_name}</strong>
            </div>
            
            <div className={`p-4 rounded-xl border shadow-sm ${
              job.status === 'Failed' ? 'bg-rose-50/50 border-rose-100' : 
              job.status === 'Completed' ? 'bg-emerald-50/50 border-emerald-100' : 
              job.status === 'Processing' ? 'bg-blue-50/50 border-blue-100' : 
              'bg-amber-50/50 border-amber-100'
            }`}>
              <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                job.status === 'Failed' ? 'text-rose-500' : 
                job.status === 'Completed' ? 'text-emerald-500' : 
                job.status === 'Processing' ? 'text-blue-500' : 
                'text-amber-500'
              }`}>Execution Status</div>
              <div className="flex items-center gap-2 mt-1">
                {job.status === 'Processing' && <Icon name="loader" className="w-6 h-6 text-blue-600 animate-spin" />}
                {job.status === 'Completed' && <Icon name="check-circle" className="w-6 h-6 text-emerald-600" />}
                {job.status === 'Failed' && <Icon name="x-circle" className="w-6 h-6 text-rose-600" />}
                {job.status === 'Pending' && <Icon name="clock" className="w-6 h-6 text-amber-600" />}
                
                <strong className={`text-xl font-black leading-tight ${
                  job.status === 'Failed' ? 'text-rose-700' : 
                  job.status === 'Completed' ? 'text-emerald-700' : 
                  job.status === 'Processing' ? 'text-blue-700' : 
                  'text-amber-700'
                }`}>
                  {job.status}
                </strong>
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-3 bg-slate-50 font-semibold text-slate-600 w-1/3 border-r border-slate-100">Queue Name</td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold tracking-wide uppercase bg-slate-100 text-slate-600 border border-slate-200">
                      {job.queue_name}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 bg-slate-50 font-semibold text-slate-600 w-1/3 border-r border-slate-100">Started Processing</td>
                  <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                    {job.started_at ? new Date(job.started_at).toLocaleString() : <span className="text-slate-400 italic">N/A</span>}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 bg-slate-50 font-semibold text-slate-600 w-1/3 border-r border-slate-100">Finished Processing</td>
                  <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                    {job.finished_at ? new Date(job.finished_at).toLocaleString() : <span className="text-slate-400 italic">N/A</span>}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Error Message Section */}
          {job.status === 'Failed' && job.error_message && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl shadow-sm animate-in fade-in slide-in-from-bottom-2 flex flex-col">
              <h4 className="flex items-center gap-1.5 text-sm font-bold text-rose-800 mb-2">
                <Icon name="alert-triangle" className="w-4 h-4" /> Exception / Error Trace
              </h4>
              <div className="bg-white/60 p-3 rounded-lg border border-rose-100 flex-1 overflow-x-auto custom-scrollbar">
                <pre className="text-xs font-mono font-medium text-rose-700 leading-relaxed whitespace-pre-wrap break-all">
                  {job.error_message}
                </pre>
              </div>
            </div>
          )}

          {/* Raw JSON Payload */}
          <div className="flex flex-col">
            <h4 className="flex items-center gap-1.5 text-sm font-bold text-slate-800 mb-2">
              <Icon name="code" className="w-4 h-4 text-slate-500" /> Job Payload (Data Sent)
            </h4>
            <div className="bg-slate-900 text-slate-300 p-4 rounded-xl overflow-x-auto shadow-inner border border-slate-800 flex-1 custom-scrollbar">
              <pre className="text-xs font-mono leading-relaxed">
                {job.payload ? JSON.stringify(job.payload, null, 2) : 'No payload data available.'}
              </pre>
            </div>
          </div>

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