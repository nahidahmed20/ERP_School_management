import React from 'react';
import Icon from '@/Components/Icons';

export default function LogShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      
      {/* Responsive Modal Box (Increased Width to max-w-3xl) */}
      <div 
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200" 
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Medical Visit Details</h3>
            <p className="text-sm text-slate-500 mt-0.5">Patient symptoms, treatment, and outcome.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
        
        {/* Body (Scrollable & Spacious Layout) */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* Top Patient Profile Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-xl mb-6 shadow-sm">
             <div className="flex items-center gap-4 mb-4 sm:mb-0">
               <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center border border-indigo-200 shrink-0">
                 <Icon name="user" className="w-7 h-7" />
               </div>
               <div>
                 <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Patient Name</span>
                 <strong className="text-lg font-black text-slate-900 block">{item.patient?.name}</strong>
                 <span className="text-xs font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded mt-1 inline-block">{item.patient?.role}</span>
               </div>
             </div>
             <div className="sm:text-right w-full sm:w-auto bg-white sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none border sm:border-none border-slate-200">
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date &amp; Time</span>
                <strong className="text-base font-bold text-slate-800 font-mono bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 inline-block">
                  {new Date(item.visit_time).toLocaleString()}
                </strong>
             </div>
          </div>

          {/* Details 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Medical Context */}
            <div className="space-y-6">
              <div className="bg-rose-50/70 p-5 rounded-xl border border-rose-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="alert-circle" className="w-4 h-4 text-rose-500" />
                  <span className="font-bold text-rose-600 uppercase text-xs tracking-wider">Symptoms / Reason</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 leading-relaxed">{item.symptoms}</p>
              </div>

              <div className="bg-emerald-50/70 p-5 rounded-xl border border-emerald-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="activity" className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold text-emerald-600 uppercase text-xs tracking-wider">Treatment Given</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 leading-relaxed">{item.treatment_given || <span className="text-slate-400 italic font-normal">N/A</span>}</p>
              </div>
            </div>

            {/* Right Column: Administrative Context */}
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <span className="block font-bold text-slate-400 uppercase text-xs tracking-wider mb-1.5">Diagnosis</span>
                <p className="text-sm font-medium text-slate-700">{item.diagnosis || <span className="text-slate-400 italic font-normal">N/A</span>}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                  <span className="block font-bold text-slate-400 uppercase text-xs tracking-wider mb-1">Room No</span>
                  <strong className="text-xl font-black text-indigo-600 font-mono">{item.room?.room_number}</strong>
                </div>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                  <span className="block font-bold text-slate-400 uppercase text-xs tracking-wider mb-2">Action Taken</span>
                  <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-200 text-slate-800 text-center leading-tight">
                    {item.action_taken}
                  </span>
                </div>
              </div>
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