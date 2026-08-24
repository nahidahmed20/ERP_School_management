import React from 'react';
import Icon from '@/Components/Icons';

export default function LessonShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      
      {/* Responsive Modal Box (Increased Width for better view) */}
      <div 
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Lesson Details</h3>
            <p className="text-sm text-slate-500 mt-0.5">Study material and resources overview.</p>
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
                 <Icon name="monitor" className="w-7 h-7" />
               </div>
               <div>
                 <span className="block text-[11px] font-bold text-indigo-500 uppercase tracking-wider mb-0.5">Lesson Title</span>
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

          {/* Course Name Banner */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
            <div>
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Parent Course</span>
              <strong className="text-base font-bold text-slate-800">{item.course?.title}</strong>
            </div>
            <Icon name="book-open" className="w-6 h-6 text-slate-300" />
          </div>

          {/* Media & Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Video Link Box */}
            <div className="bg-rose-50/60 p-5 rounded-xl border border-rose-100 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <span className="flex items-center gap-2 text-sm font-bold text-rose-900 mb-2">
                  <Icon name="play-circle" className="w-5 h-5 text-rose-600" /> Video Material
                </span>
                {item.video_url ? (
                  <a href={item.video_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-rose-600 hover:text-rose-800 hover:underline break-all block mt-3 bg-white p-3 rounded-lg border border-rose-100">
                    {item.video_url}
                  </a>
                ) : (
                  <div className="mt-3 p-3 bg-white/60 rounded-lg border border-rose-100/50">
                    <span className="text-sm text-rose-400 italic">No video link provided.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Document Box */}
            <div className="bg-sky-50/60 p-5 rounded-xl border border-sky-100 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <span className="flex items-center gap-2 text-sm font-bold text-sky-900 mb-2">
                  <Icon name="download" className="w-5 h-5 text-sky-600" /> File / Document
                </span>
                {item.document_path ? (
                  <div className="mt-3">
                    <a href={`/storage/${item.document_path}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-full gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm active:scale-95">
                      <Icon name="download" className="w-4 h-4" /> Download Material
                    </a>
                  </div>
                ) : (
                  <div className="mt-3 p-3 bg-white/60 rounded-lg border border-sky-100/50">
                    <span className="text-sm text-sky-400 italic">No file attached.</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Description Section */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
               <Icon name="file-text" className="w-4 h-4 text-slate-400" /> Description / Reading Text
            </span>
            <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {item.description ? (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  {item.description}
                </div>
              ) : (
                <span className="italic text-slate-400 block p-4 bg-slate-50 rounded-lg border border-slate-100">No additional text details provided.</span>
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