import React from 'react';
import Icon from '@/Components/Icons';

export default function TemplateShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      
      {/* Responsive Modal Box */}
      <div 
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Certificate Preview</h3>
            <p className="text-sm text-slate-500 mt-0.5">{item.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
        
        {/* Modal Body (Scrollable Preview Area) */}
        <div className="p-6 bg-slate-100 overflow-y-auto flex-1 flex justify-center items-center custom-scrollbar">
          
          {/* Certificate Container */}
          <div className="w-full bg-white relative shadow-2xl flex flex-col justify-between items-center text-center font-serif" style={{ aspectRatio: '1.414 / 1', border: '12px solid #1e293b', padding: 'clamp(20px, 5%, 48px)' }}>
            
            {/* Top Text */}
            <div className="w-full">
              <h4 className="text-slate-500 uppercase tracking-[4px] m-0 text-[clamp(10px,1.5vw,16px)] font-semibold">
                Certificate of Achievement
              </h4>
              <h1 className="text-slate-900 mt-2 sm:mt-4 font-bold text-[clamp(24px,3.5vw,40px)] leading-tight">
                {item.title}
              </h1>
            </div>

            {/* Middle Text */}
            <div className="w-full max-w-[80%] mx-auto text-slate-700 leading-relaxed text-[clamp(12px,1.8vw,18px)]">
              <p className="m-0 mb-2 sm:mb-4 italic">This is proudly presented to</p>
              <h2 className="text-indigo-600 border-b-2 border-slate-300 inline-block pb-1 sm:pb-2 mb-3 sm:mb-6 font-bold text-[clamp(20px,3vw,32px)] px-8">
                [ Student Name Placeholder ]
              </h2>
              <div dangerouslySetInnerHTML={{ __html: item.content_body }} className="mx-auto" />
            </div>

            {/* Bottom Signatures */}
            <div className="flex justify-between items-end w-full mt-6 sm:mt-10 px-4 sm:px-12">
              <div className="border-t-2 border-slate-400 w-[120px] sm:w-[200px] pt-2 text-slate-500 text-[clamp(10px,1.2vw,14px)] font-medium">
                Date of Issue
              </div>
              <div className="border-t-2 border-slate-400 w-[120px] sm:w-[200px] pt-2 text-slate-500 text-[clamp(10px,1.2vw,14px)] font-medium">
                Authorized Signature
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex flex-col-reverse sm:flex-row items-center justify-end gap-3 rounded-b-2xl shrink-0">
          <button type="button" className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm active:scale-95" onClick={onClose}>
            Close
          </button>
          <button type="button" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95" onClick={() => window.print()}>
            <Icon name="printer" className="w-4 h-4" /> Print Preview
          </button>
        </div>
      </div>
    </div>
  );
}