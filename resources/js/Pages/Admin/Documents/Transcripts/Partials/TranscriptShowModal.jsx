import React from 'react';
import Icon from '@/Components/Icons';

export default function TranscriptShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      
      {/* Responsive Modal Box */}
      <div 
        className="w-full max-w-4xl bg-slate-100 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-white shrink-0 rounded-t-2xl shadow-sm z-10">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Transcript Preview</h3>
            <p className="text-sm font-semibold text-indigo-600 mt-0.5">{item.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-slate-50 border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
        
        {/* Modal Body (Scrollable Preview Area) */}
        <div className="p-6 overflow-y-auto flex-1 flex justify-center items-center custom-scrollbar">
          
          {/* A4 Paper Simulation */}
          <div className="w-full max-w-[700px] bg-white relative shadow-xl border border-slate-200 flex flex-col font-sans text-slate-900 p-8 sm:p-12 aspect-[1/1.414]">
            
            {/* Watermark Overlay (If any) */}
            {item.watermark_image && (
              <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.06] flex items-center justify-center">
                <img src={`/storage/${item.watermark_image}`} alt="Watermark" className="w-[60%] h-[60%] object-contain" />
              </div>
            )}

            {/* Header */}
            <div className="w-full text-center border-b-[3px] border-slate-800 pb-4 mb-6 z-10">
              <h1 className="m-0 text-2xl sm:text-3xl font-black uppercase tracking-wide text-slate-900">{item.title || 'Academic Transcript'}</h1>
              <h3 className="m-0 text-sm sm:text-base text-slate-600 mt-2 font-semibold tracking-wider">{item.header_text || 'Official Record of Student Progress'}</h3>
            </div>

            {/* Student Info Dummy */}
            <div className="w-full grid grid-cols-2 gap-y-3 gap-x-6 text-xs sm:text-sm mb-6 z-10 font-medium">
              <div><span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block mb-0.5">Student Name</span> <span className="text-slate-900 font-bold">[ Student Name ]</span></div>
              <div><span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block mb-0.5">Student ID</span> <span className="text-slate-900 font-bold">[ ID Number ]</span></div>
              <div><span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block mb-0.5">Class / Program</span> <span className="text-slate-900 font-bold">[ Class Name ]</span></div>
              <div><span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block mb-0.5">Grading System</span> <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{item.grading_system}</span></div>
            </div>

            {/* Mock Grades Table */}
            <table className="w-full border-collapse text-xs sm:text-sm mb-6 z-10 shadow-sm border border-slate-300">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-2.5 text-left text-slate-700 font-bold uppercase tracking-wider text-[11px]">Subject</th>
                  <th className="border border-slate-300 p-2.5 text-center text-slate-700 font-bold uppercase tracking-wider text-[11px] w-20">Marks</th>
                  <th className="border border-slate-300 p-2.5 text-center text-slate-700 font-bold uppercase tracking-wider text-[11px] w-20">Grade</th>
                  <th className="border border-slate-300 p-2.5 text-center text-slate-700 font-bold uppercase tracking-wider text-[11px] w-20">GPA</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-2.5 font-semibold text-slate-800">Mathematics</td>
                  <td className="border border-slate-300 p-2.5 text-center font-mono">85</td>
                  <td className="border border-slate-300 p-2.5 text-center font-bold text-emerald-700 bg-emerald-50/50">A+</td>
                  <td className="border border-slate-300 p-2.5 text-center font-bold font-mono">5.0</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2.5 font-semibold text-slate-800">English Language</td>
                  <td className="border border-slate-300 p-2.5 text-center font-mono">78</td>
                  <td className="border border-slate-300 p-2.5 text-center font-bold text-emerald-600 bg-emerald-50/30">A</td>
                  <td className="border border-slate-300 p-2.5 text-center font-bold font-mono">4.0</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2.5 font-semibold text-slate-800">Physics</td>
                  <td className="border border-slate-300 p-2.5 text-center font-mono">92</td>
                  <td className="border border-slate-300 p-2.5 text-center font-bold text-emerald-700 bg-emerald-50/50">A+</td>
                  <td className="border border-slate-300 p-2.5 text-center font-bold font-mono">5.0</td>
                </tr>
              </tbody>
            </table>

            <div className="w-full flex justify-end z-10 mb-12">
              <div className="bg-slate-800 text-white px-6 py-2 rounded shadow flex items-center gap-4">
                <span className="text-xs uppercase tracking-widest font-bold text-slate-300">CGPA / Total</span>
                <span className="text-xl font-black font-mono">[ Value ]</span>
              </div>
            </div>

            {/* Signatures & Footer */}
            <div className="w-full flex justify-between items-end mt-auto z-10">
              {/* Left Empty Signature space */}
              <div className="w-[150px] text-center">
                <div className="border-t-[1.5px] border-slate-800 pt-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">Prepared By</div>
              </div>

              {/* Right Configurable Signature */}
              <div className="w-[180px] text-center flex flex-col items-center">
                {item.authorized_signature_image ? (
                  <img src={`/storage/${item.authorized_signature_image}`} alt="Sig" className="h-10 object-contain mb-2" />
                ) : (
                  <div className="h-10 mb-2"></div>
                )}
                <div className="border-t-[1.5px] border-slate-800 pt-1.5 text-[11px] font-bold text-slate-900 w-full uppercase tracking-wider">
                  {item.authorized_signature_title || 'Authorized Signature'}
                </div>
              </div>
            </div>

            <div className="w-full text-center mt-10 text-[10px] text-slate-500 border-t border-dashed border-slate-300 pt-3 z-10 font-semibold tracking-wide">
              {item.footer_text || 'This transcript is invalid without the official seal and signature.'}
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex flex-col-reverse sm:flex-row items-center justify-end gap-3 rounded-b-2xl shrink-0 z-10 shadow-sm">
          <button type="button" className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded-xl transition-all shadow-sm active:scale-95" onClick={onClose}>
            Close
          </button>
          <button type="button" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95" onClick={() => window.print()}>
            <Icon name="printer" className="w-4 h-4" /> Print Demo
          </button>
        </div>
      </div>
    </div>
  );
}