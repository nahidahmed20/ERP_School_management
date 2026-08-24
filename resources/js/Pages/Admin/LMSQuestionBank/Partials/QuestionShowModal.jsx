import React from 'react';
import Icon from '@/Components/Icons';

export default function QuestionShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      
      {/* Responsive Modal Box (Increased width for nice MCQ view) */}
      <div 
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Question Preview</h3>
            <p className="text-sm text-slate-500 mt-0.5">Review question details, options, and correct answer.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* Tags & Meta Info */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide uppercase bg-slate-100 text-slate-700 border border-slate-200">
              <Icon name="book" className="w-3.5 h-3.5" /> Class: {item.school_class?.name}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide uppercase bg-slate-100 text-slate-700 border border-slate-200">
              <Icon name="file-text" className="w-3.5 h-3.5" /> Subject: {item.subject?.name}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide uppercase bg-sky-50 text-sky-700 border border-sky-200">
              <Icon name="tag" className="w-3.5 h-3.5" /> Type: {item.question_type}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Icon name="check-circle" className="w-3.5 h-3.5" /> Marks: {item.marks}
            </span>
          </div>

          {/* The Question Box */}
          <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 shadow-sm relative">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 rounded-l-2xl"></div>
            <div className="flex gap-4">
              <div className="text-2xl font-black text-indigo-300">Q.</div>
              <div className="text-lg font-bold text-slate-900 leading-relaxed whitespace-pre-wrap mt-1">
                {item.question}
              </div>
            </div>
          </div>

          {/* Options Grid (For MCQ) */}
          {item.question_type === 'MCQ' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['a', 'b', 'c', 'd'].map(opt => {
                const isCorrect = item.correct_answer === opt;
                return (
                  <div key={opt} className={`p-4 rounded-xl border flex items-start gap-4 transition-colors ${
                    isCorrect ? 'bg-emerald-50 border-emerald-400 shadow-sm' : 'bg-white border-slate-200'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
                      isCorrect ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {opt.toUpperCase()}
                    </div>
                    <div className={`flex-1 pt-1 font-medium ${isCorrect ? 'text-emerald-900' : 'text-slate-700'}`}>
                      {item[`option_${opt}`] || <span className="text-slate-300 italic">No option provided</span>}
                    </div>
                    {isCorrect && (
                      <div className="shrink-0 mt-1">
                        <Icon name="check-circle" className="w-5 h-5 text-emerald-600" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Answer Box (For True/False) */}
          {item.question_type === 'True/False' && (
            <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between">
              <span className="font-bold text-emerald-700 uppercase tracking-wider text-sm flex items-center gap-2">
                <Icon name="check-circle" className="w-5 h-5" /> Correct Answer
              </span>
              <strong className="text-xl font-black text-emerald-800">{item.correct_answer}</strong>
            </div>
          )}

          {/* Explanation Box */}
          {item.explanation && (
            <div className="bg-amber-50/50 p-5 rounded-xl border border-amber-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="info" className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-amber-700 uppercase text-xs tracking-wider">Explanation</span>
              </div>
              <p className="text-sm font-medium text-amber-900/80 leading-relaxed whitespace-pre-wrap">
                {item.explanation}
              </p>
            </div>
          )}

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