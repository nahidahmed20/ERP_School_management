import React from 'react';
import Icon from '@/Components/Icons';

export default function VaccineShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      
      {/* Responsive Modal Box */}
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200" 
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Vaccination Details</h3>
            <p className="text-sm text-slate-500 mt-0.5">Administered vaccine and next due schedule.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
        
        {/* Body (Scrollable) */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
          
          <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-50 p-5 rounded-xl border border-slate-100 mb-6 shadow-sm">
             <div className="flex items-center gap-4 mb-4 sm:mb-0">
               <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center border border-indigo-200 shrink-0">
                 <Icon name="shield" className="w-7 h-7" />
               </div>
               <div>
                 <strong className="text-lg font-black text-slate-900 block">{item.vaccine_name}</strong>
                 <span className="text-xs font-semibold text-slate-500 block mt-0.5">Patient: <span className="font-bold text-slate-700">{item.student?.name}</span></span>
               </div>
             </div>
             
             <div className="text-center sm:text-right bg-white sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none border sm:border-none border-slate-200 w-full sm:w-auto">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Dose Number</span>
                <strong className="text-base font-black text-slate-800">{item.dose_number || 'N/A'}</strong>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 shadow-sm flex flex-col justify-center text-center">
              <span className="block font-bold text-emerald-600/70 uppercase text-[11px] tracking-wider mb-1">Date Administered</span>
              <strong className="text-lg font-bold text-emerald-700 font-mono">{new Date(item.date_administered).toLocaleDateString()}</strong>
            </div>
            <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 shadow-sm flex flex-col justify-center text-center">
              <span className="block font-bold text-rose-600/70 uppercase text-[11px] tracking-wider mb-1">Next Due Date</span>
              <strong className="text-lg font-bold text-rose-700 font-mono">{item.next_due_date ? new Date(item.next_due_date).toLocaleDateString() : 'None'}</strong>
            </div>
          </div>

          {item.remarks && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="alert-circle" className="w-4 h-4 text-slate-400" />
                <span className="font-bold text-slate-500 uppercase text-xs tracking-wider">Remarks / Notes</span>
              </div>
              <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{item.remarks}</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end rounded-b-2xl shrink-0">
          <button type="button" className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-all shadow-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}