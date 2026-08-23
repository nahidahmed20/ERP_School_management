import React from 'react';
import Icon from '@/Components/Icons';

export default function PaymentShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>

      {/* Responsive Modal Box */}
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Payment Receipt</h3>
            <p className="text-sm text-slate-500 mt-0.5">Transaction verification and details.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">

          <div className="text-center bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon name="check" className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 font-mono">৳ {Number(item.amount).toFixed(2)}</h2>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 mt-1 block">Payment Successful</span>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3 text-sm">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Paid By</span>
              <strong className="text-slate-900">{item.user?.name}</strong>
            </div>
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Date</span>
              <strong className="text-slate-900 font-mono">{new Date(item.payment_date).toLocaleDateString()}</strong>
            </div>
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Method</span>
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-slate-200 text-slate-700">{item.payment_method}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Transaction ID</span>
              <strong className="text-slate-900 font-mono">{item.transaction_id || 'N/A'}</strong>
            </div>
          </div>

          {item.remarks && (
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 px-1">Remarks</span>
              <div className="text-sm text-slate-700 bg-slate-50/50 border border-slate-200 p-3.5 rounded-xl whitespace-pre-wrap leading-relaxed">
                {item.remarks}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-center rounded-b-2xl shrink-0">
          <button type="button" className="w-full py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
