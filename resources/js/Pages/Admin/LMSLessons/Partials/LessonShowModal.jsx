import React from 'react';
import Icon from '@/Components/Icons';

export default function LessonShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] shadow-2xl overflow-hidden transform transition-all flex flex-col ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Lesson / Study Material</h3>
            <p className="text-sm text-slate-500 mt-1">Detailed view of the selected lesson.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-slate-100">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Course</span>
            <strong className="text-base text-slate-900">{item.course?.title}</strong>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-xl font-bold text-slate-800">{item.title}</h4>
            <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase w-fit ${item.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
              {item.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Video Link Box */}
            <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-100 flex flex-col justify-between">
              <div>
                <span className="flex items-center gap-2 text-sm font-bold text-rose-900 mb-1.5">
                  <Icon name="play-circle" className="w-4 h-4 text-rose-600" /> Video Material
                </span>
                {item.video_url ? (
                  <a href={item.video_url} target="_blank" rel="noreferrer" className="text-xs font-medium text-rose-600 hover:underline break-all block">
                    {item.video_url}
                  </a>
                ) : (
                  <span className="text-xs text-rose-400 italic">No video link provided.</span>
                )}
              </div>
            </div>

            {/* Document Box */}
            <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-100 flex flex-col justify-between">
              <div>
                <span className="flex items-center gap-2 text-sm font-bold text-sky-900 mb-1.5">
                  <Icon name="download" className="w-4 h-4 text-sky-600" /> File / PDF
                </span>
                {item.document_path ? (
                  <a href={`/storage/${item.document_path}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition-colors mt-1">
                    <Icon name="download" className="w-3.5 h-3.5" /> Download Material
                  </a>
                ) : (
                  <span className="text-xs text-sky-400 italic">No file attached.</span>
                )}
              </div>
            </div>

          </div>

          {/* Description */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description / Reading Text</span>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {item.description || <span className="italic text-slate-400">No additional text details.</span>}
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end rounded-b-2xl shrink-0">
          <button type="button" className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}