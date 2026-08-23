import React from 'react';
import Icon from '@/Components/Icons';

export default function OrderShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>

      {/* Responsive Modal Box */}
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Order Details</h3>
            <p className="text-sm text-slate-500 mt-0.5 font-mono text-indigo-600">{item.order_number}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Customer</span>
              <strong className="text-slate-900 block truncate" title={item.customer?.name}>{item.customer?.name}</strong>
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Outlet</span>
              <strong className="text-slate-900 block truncate" title={item.outlet?.name}>{item.outlet?.name}</strong>
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Order Status</span>
              <strong className="text-slate-900 block">{item.status}</strong>
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Payment</span>
              <strong className={`block ${item.payment_status === 'Paid' ? 'text-emerald-600' : 'text-rose-600'}`}>{item.payment_status}</strong>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Ordered Items</h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] tracking-wider font-semibold">
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {item.items?.map((food, index) => (
                    <tr key={index} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-bold text-slate-900">{food.name}</td>
                      <td className="px-4 py-3 font-semibold text-slate-700 font-mono">{food.qty}</td>
                      <td className="px-4 py-3 text-right font-black text-slate-900 font-mono">৳ {(food.price * food.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="bg-slate-900 text-white rounded-xl px-5 py-3 flex items-center gap-6 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Grand Total</span>
              <span className="text-xl font-black text-amber-400 font-mono">৳ {Number(item.total_amount).toFixed(2)}</span>
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
