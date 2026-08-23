import React from 'react';
import Icon from '@/Components/Icons';

export default function IssueShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>

      {/* Responsive Modal Box */}
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Issue Details</h3>
            <p className="text-sm text-slate-500 mt-0.5">Borrower and book issuance information.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Borrower</span>
              <strong className="text-base font-bold text-slate-900 block">{item.user?.name}</strong>
              <span className="text-xs text-slate-500 font-mono">{item.user?.email}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Book Details</span>
              <strong className="text-base font-bold text-slate-900 block">{item.book?.title}</strong>
              <span className="text-xs text-slate-500 font-mono">ISBN: {item.book?.isbn_no || 'N/A'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Issue Date</span>
              <span className="font-semibold text-slate-800 font-mono">{item.issue_date}</span>
            </div>
            <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100">
              <span className="block font-bold text-rose-600/70 uppercase text-xs mb-1">Due Date</span>
              <span className="font-semibold text-rose-700 font-mono">{item.due_date}</span>
            </div>
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              <span className="block font-bold text-emerald-600/70 uppercase text-xs mb-1">Return Date</span>
              <span className="font-semibold text-emerald-700 font-mono">{item.return_date || 'Not Yet'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Fine Amount</span>
              <span className={`font-black text-lg font-mono ${Number(item.fine_amount) > 0 ? 'text-rose-600' : 'text-slate-800'}`}>৳ {item.fine_amount}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
              <span className="block font-bold text-slate-400 uppercase text-xs mb-1">Status</span>
              <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border w-max ${
                item.status === 'Returned' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                item.status === 'Overdue' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                'bg-sky-50 text-sky-700 border-sky-200'
              }`}>
                {item.status}
              </span>
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 px-1">Notes</span>
            <div className="text-sm text-slate-700 bg-slate-50/50 border border-slate-200 p-4 rounded-xl min-h-[60px] whitespace-pre-wrap leading-relaxed">
              {item.note || <span className="text-slate-400 italic">কোনো নোট দেওয়া নেই।</span>}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end rounded-b-2xl shrink-0">
          <button type="button" className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
