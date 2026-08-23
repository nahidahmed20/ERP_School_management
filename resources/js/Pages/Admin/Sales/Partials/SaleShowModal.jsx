import React from 'react';
import Icon from '@/Components/Icons';

export default function SaleShowModal({ sale, onClose }) {
  if (!sale) return null;

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>

      {/* Responsive Modal Box */}
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Sale Details - <span className="font-mono text-indigo-600">{sale.invoice_number}</span></h3>
            <p className="text-sm text-slate-500 mt-0.5">Overview of purchased items and payment details.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">

          {/* Top Info Section */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Customer</span>
              <strong className="text-slate-900 block truncate" title={sale.customer_name}>{sale.customer_name}</strong>
              {sale.customer_phone && <span className="text-xs text-slate-500 font-mono">{sale.customer_phone}</span>}
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Date &amp; Time</span>
              <strong className="text-slate-900 block font-mono text-xs">{new Date(sale.created_at).toLocaleString()}</strong>
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Sold By</span>
              <strong className="text-slate-900 block">{sale.seller?.name || 'Admin'}</strong>
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Payment Status</span>
              <span className={`inline-flex px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${
                sale.due_amount > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {sale.due_amount > 0 ? 'Due' : 'Paid'} ({sale.payment_method})
              </span>
            </div>
          </div>

          {/* Sold Items Table */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Items Sold</h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] tracking-wider font-semibold">
                    <th className="px-4 py-3">Product Detail</th>
                    <th className="px-4 py-3">Variant</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Unit Price</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sale.items?.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{item.product?.name}</div>
                        {item.product?.item_code && <div className="text-[11px] font-mono text-indigo-600 mt-0.5">Code: {item.product.item_code}</div>}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 space-y-0.5">
                        {item.size && <div>Size: <span className="font-semibold text-slate-900">{item.size}</span></div>}
                        {item.color && <div>Color: <span className="font-semibold text-slate-900">{item.color}</span></div>}
                        {(!item.size && !item.color) && <span className="italic text-slate-400">—</span>}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700 font-mono">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700">
                        ৳ {Number(item.unit_price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900 font-mono">
                        ৳ {Number(item.subtotal).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {(!sale.items || sale.items.length === 0) && (
                    <tr><td colSpan="5" className="text-center py-8 text-slate-400 italic">No items found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="flex justify-end">
            <div className="w-full sm:w-80 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2.5 text-sm shadow-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-bold text-slate-900">৳ {Number(sale.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Discount:</span>
                <span className="font-mono font-bold">− ৳ {Number(sale.discount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-base pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-900">Total:</span>
                <span className="font-black text-emerald-600 font-mono text-lg">৳ {Number(sale.total_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-1">
                <span>Paid Amount:</span>
                <span className="font-mono font-bold text-slate-900">৳ {Number(sale.paid_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-rose-600 font-bold pt-1 border-t border-dashed border-slate-200">
                <span>Due Amount:</span>
                <span className="font-mono">৳ {Number(sale.due_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between rounded-b-2xl shrink-0">
          <a href={route('admin.sales.invoice', sale.id)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm">
            <Icon name="printer" className="w-4 h-4" /> Print Invoice
          </a>
          <button type="button" className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
