import React from 'react';
import Icon from '@/Components/Icons';

export default function AttemptShowModal({ item, onClose }) {
  if (!item) return null;

  const isPassed = item.status === 'Passed';
  const isFailed = item.status === 'Failed';

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      
      {/* Responsive Modal Box */}
      <div 
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Exam Result Details</h3>
            <p className="text-sm text-slate-500 mt-0.5">Comprehensive view of student's exam performance.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* Top Hero Section: Student & Exam */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-indigo-50/50 border border-indigo-100 rounded-xl shadow-sm">
             <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center border border-indigo-200 shrink-0">
                 <Icon name="user" className="w-7 h-7" />
               </div>
               <div>
                 <strong className="text-lg font-black text-slate-900 block leading-tight">{item.student?.name}</strong>
                 <span className="text-xs font-semibold text-slate-500 block mt-0.5 font-mono">{item.student?.email}</span>
               </div>
             </div>
             
             <div className="text-left md:text-right w-full md:w-auto bg-white md:bg-transparent p-3 md:p-0 rounded-lg md:rounded-none border md:border-none border-slate-200">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Exam Attempted</span>
                <strong className="text-base font-bold text-indigo-800">{item.exam?.title}</strong>
             </div>
          </div>

          {/* Results Grid - Emphasized */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="block font-bold text-slate-500 uppercase text-xs tracking-wider mb-2">Attempt Date</span>
              <strong className="text-lg font-bold text-slate-800 font-mono">{item.attempt_date}</strong>
            </div>
            
            {/* Marks Box */}
            <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-200 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
              <span className="block font-bold text-emerald-700/70 uppercase text-xs tracking-wider mb-1 z-10">Obtained Marks</span>
              <div className="z-10 flex items-baseline gap-1">
                <strong className="text-3xl font-black text-emerald-700 font-mono">{item.obtained_marks}</strong>
                <span className="text-xs font-bold text-emerald-600/60 uppercase">/ {item.exam?.total_marks}</span>
              </div>
            </div>

            {/* Status Box */}
            <div className={`p-5 rounded-xl border shadow-sm flex flex-col items-center justify-center text-center ${
                isPassed ? 'bg-emerald-50 border-emerald-200' : (isFailed ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200')
            }`}>
              <span className={`block font-bold uppercase text-xs tracking-wider mb-2 ${
                  isPassed ? 'text-emerald-600/70' : (isFailed ? 'text-rose-600/70' : 'text-amber-600/70')
              }`}>
                Final Status
              </span>
              <strong className={`text-xl font-black uppercase tracking-widest ${
                  isPassed ? 'text-emerald-700' : (isFailed ? 'text-rose-700' : 'text-amber-700')
              }`}>
                {item.status}
              </strong>
            </div>

          </div>

          {/* Teacher Remarks Section */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
               <Icon name="message-square" className="w-4 h-4 text-slate-400" /> Teacher Remarks / Feedback
            </span>
            <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {item.admin_remarks ? (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  {item.admin_remarks}
                </div>
              ) : (
                <span className="italic text-slate-400 block p-4 bg-slate-50 rounded-lg border border-slate-100">No remarks provided by the teacher.</span>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end rounded-b-2xl shrink-0">
          <button type="button" className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-all shadow-sm active:scale-95" onClick={onClose}>
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}