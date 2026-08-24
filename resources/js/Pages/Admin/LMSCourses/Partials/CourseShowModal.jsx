import React from 'react';
import Icon from '@/Components/Icons';

export default function CourseShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      
      {/* Responsive Modal Box (Wider for better readability) */}
      <div 
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200" 
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Course Details</h3>
            <p className="text-sm text-slate-500 mt-0.5">Syllabus, instructor, and overview.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
        
        {/* Body (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* Top Hero Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-indigo-50/50 border border-indigo-100 rounded-xl mb-6 shadow-sm">
             <div className="flex items-center gap-4 mb-4 sm:mb-0">
               <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center border border-indigo-200 shrink-0">
                 <Icon name="book-open" className="w-7 h-7" />
               </div>
               <div>
                 <span className="block text-[11px] font-bold text-indigo-500 uppercase tracking-wider mb-0.5">Course Title</span>
                 <strong className="text-lg font-black text-slate-900 block">{item.title}</strong>
               </div>
             </div>
             
             <div className="text-left sm:text-right w-full sm:w-auto">
                <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase border shadow-sm ${
                    item.is_published ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {item.is_published ? 'Published' : 'Draft (Unpublished)'}
                </span>
             </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <span className="block font-bold text-slate-400 uppercase text-[11px] tracking-wider mb-1">Target Class</span>
              <strong className="text-base font-bold text-slate-800">{item.school_class?.name}</strong>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <span className="block font-bold text-slate-400 uppercase text-[11px] tracking-wider mb-1">Subject</span>
              <strong className="text-base font-bold text-slate-800">{item.subject?.name}</strong>
            </div>

            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 shadow-sm flex flex-col justify-center">
              <span className="block font-bold text-emerald-600/70 uppercase text-[11px] tracking-wider mb-1">Instructor</span>
              <strong className="text-base font-bold text-emerald-700">{item.teacher?.name || <span className="italic text-emerald-600/60 font-medium">Not Assigned</span>}</strong>
            </div>
          </div>

          {/* Description Block */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="file-text" className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-slate-500 uppercase text-xs tracking-wider">Course Description / Overview</span>
            </div>
            <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
              {item.description || <span className="text-slate-400 italic font-normal">No description provided.</span>}
            </p>
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