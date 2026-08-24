import React from 'react';
import Icon from '@/Components/Icons';

export default function RecordShowModal({ item, onClose }) {
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
            <h3 className="text-xl font-bold text-slate-900">Health Record Details</h3>
            <p className="text-sm text-slate-500 mt-0.5">Comprehensive medical profile.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
        
        {/* Body (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          
          <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-50 p-5 rounded-xl border border-slate-100 mb-6 shadow-sm">
             <div className="flex items-center gap-4 mb-4 sm:mb-0">
               <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center border border-indigo-200 shrink-0">
                 <Icon name="user" className="w-7 h-7" />
               </div>
               <div>
                 <strong className="text-lg font-black text-slate-900 block">{item.user?.name}</strong>
                 <span className="text-xs font-semibold text-slate-500 block mt-0.5">Patient Profile</span>
               </div>
             </div>
             
             <div className="text-center sm:text-right bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 w-full sm:w-auto">
                <span className="block text-[11px] font-bold text-rose-500 uppercase tracking-wider mb-0.5">Blood Group</span>
                <strong className="text-xl font-black text-rose-700">{item.blood_group || 'Unknown'}</strong>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center text-center">
              <span className="block font-bold text-slate-400 uppercase text-[11px] tracking-wider mb-1">Height</span>
              <strong className="text-base font-bold text-slate-800">{item.height || 'N/A'}</strong>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center text-center">
              <span className="block font-bold text-slate-400 uppercase text-[11px] tracking-wider mb-1">Weight</span>
              <strong className="text-base font-bold text-slate-800">{item.weight || 'N/A'}</strong>
            </div>
            <div className="col-span-2 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 shadow-sm flex items-center justify-between">
              <span className="font-bold text-indigo-400 uppercase text-xs tracking-wider">Emergency Contact</span>
              <strong className="text-base font-bold text-indigo-700 font-mono">{item.emergency_contact || 'N/A'}</strong>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="alert-circle" className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-amber-600 uppercase text-xs tracking-wider">Known Allergies</span>
              </div>
              <p className="text-sm font-medium text-slate-700 leading-relaxed">{item.allergies || <span className="text-slate-400 italic font-normal">None reported</span>}</p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="activity" className="w-4 h-4 text-slate-400" />
                <span className="font-bold text-slate-500 uppercase text-xs tracking-wider">Chronic Conditions</span>
              </div>
              <p className="text-sm font-medium text-slate-700 leading-relaxed">{item.chronic_conditions || <span className="text-slate-400 italic font-normal">None reported</span>}</p>
            </div>
          </div>

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