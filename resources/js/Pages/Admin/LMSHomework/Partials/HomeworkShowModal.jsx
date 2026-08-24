import React from 'react';
import Icon from '@/Components/Icons';

export default function HomeworkShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      
      {/* Responsive Modal Box (Increased Width to max-w-3xl) */}
      <div 
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Homework Details</h3>
            <p className="text-sm text-slate-500 mt-0.5">Comprehensive view of the assignment.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* Top Hero Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-indigo-50/50 border border-indigo-100 rounded-xl shadow-sm">
             <div className="flex items-center gap-4 mb-4 sm:mb-0">
               <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center border border-indigo-200 shrink-0">
                 <Icon name="edit-3" className="w-7 h-7" />
               </div>
               <div>
                 <span className="block text-[11px] font-bold text-indigo-500 uppercase tracking-wider mb-0.5">Assignment Title</span>
                 <strong className="text-lg font-black text-slate-900 block leading-tight">{item.title}</strong>
               </div>
             </div>
             
             <div className="text-left sm:text-right w-full sm:w-auto">
                <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase border shadow-sm ${
                    item.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {item.is_active ? 'Active (Visible)' : 'Inactive (Hidden)'}
                </span>
             </div>
          </div>

          {/* Academic Info & Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center text-center">
              <span className="block font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1">Target Class</span>
              <strong className="text-sm font-bold text-slate-800">{item.school_class?.name}</strong>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center text-center">
              <span className="block font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1">Subject</span>
              <strong className="text-sm font-bold text-slate-800">{item.subject?.name}</strong>
            </div>

            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 shadow-sm flex flex-col justify-center text-center">
              <span className="block font-bold text-emerald-600/70 uppercase text-[10px] tracking-wider mb-1">Assigned Date</span>
              <strong className="text-sm font-bold text-emerald-700 font-mono">{item.homework_date}</strong>
            </div>

            <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 shadow-sm flex flex-col justify-center text-center">
              <span className="block font-bold text-rose-600/70 uppercase text-[10px] tracking-wider mb-1">Submission Deadline</span>
              <strong className="text-sm font-bold text-rose-700 font-mono">{item.submission_date}</strong>
            </div>

          </div>

          {/* Marks & Attachment Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase text-xs tracking-wider">Total Marks</span>
                <strong className="text-lg font-black text-slate-900 font-mono">{item.total_marks || 'N/A'}</strong>
             </div>
             
             <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100 shadow-sm flex items-center justify-between">
                <span className="font-bold text-sky-600/80 uppercase text-xs tracking-wider">Attachment</span>
                {item.document_path ? (
                  <a href={`/storage/${item.document_path}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm active:scale-95">
                    <Icon name="download" className="w-3.5 h-3.5" /> Download
                  </a>
                ) : (
                  <span className="text-xs text-sky-400 italic">No file attached.</span>
                )}
             </div>
          </div>

          {/* Instructions / Description Section */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
               <Icon name="file-text" className="w-4 h-4 text-slate-400" /> Instructions &amp; Description
            </span>
            <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {item.description ? (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  {item.description}
                </div>
              ) : (
                <span className="italic text-slate-400 block p-4 bg-slate-50 rounded-lg border border-slate-100">No description provided.</span>
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