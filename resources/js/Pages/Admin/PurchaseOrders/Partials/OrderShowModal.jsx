import React from 'react';
import Icon from '@/Components/Icons';

export default function OrderShowModal({ item, onClose }) {
  if (!item) return null;

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
            <h3 className="text-xl font-bold text-slate-900">Order Details - <span className="font-mono text-indigo-600">{item.order_number}</span></h3>
            <p className="text-sm text-slate-500 mt-0.5">Full specification of ordered items and vendor breakdown.</p>
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
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Vendor Details</span>
              <strong className="text-slate-900 block truncate" title={item.vendor?.name}>{item.vendor?.name}</strong>
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Order Date</span>
              <strong className="text-slate-900 font-mono block">{item.order_date}</strong>
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Expected Delivery</span>
              <strong className="text-slate-900 font-mono block">{item.delivery_date || 'N/A'}</strong>
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Status</span>
              <span className={`inline-flex px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${
                item.status === 'Received' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                item.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                item.status === 'Ordered' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {item.status}
              </span>
            </div>
          </div>

          {/* Ordered Items Table */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Ordered Items</h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] tracking-wider font-semibold">
                    <th className="px-4 py-3">Product Detail</th>
                    <th className="px-4 py-3">Variants</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Unit Price</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {item.items?.map(oi => (
                    <tr key={oi.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{oi.purchase_item?.name}</div>
                        {oi.purchase_item?.item_code && <div className="text-[11px] font-mono text-indigo-600 mt-0.5">Code: {oi.purchase_item.item_code}</div>}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 space-y-0.5">
                        {oi.size && <div>Size: <span className="font-semibold text-slate-900">{oi.size}</span></div>}
                        {oi.color && <div>Color: <span className="font-semibold text-slate-900">{oi.color}</span></div>}
                        {(!oi.size && (!oi.color || oi.color.length === 0)) && <span className="italic text-slate-400">—</span>}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {oi.quantity} <span className="text-xs text-slate-400">{oi.purchase_item?.unit}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700">
                        ৳ {Number(oi.unit_price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900 font-mono">
                        ৳ {Number(oi.subtotal).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {(!item.items || item.items.length === 0) && (
                    <tr><td colSpan="5" className="text-center py-8 text-slate-400 italic">No items found in this order</td></tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50/80 border-t border-slate-200">
                    <td colSpan="4" className="px-4 py-3.5 text-right font-bold text-slate-700 uppercase text-xs tracking-wider">Grand Total:</td>
                    <td className="px-4 py-3.5 text-right font-black text-emerald-600 text-lg font-mono">
                      ৳ {Number(item.total_amount).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Additional Notes & Address Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="block font-bold text-slate-400 uppercase text-xs mb-1.5 tracking-wider">Shipping Address</span>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{item.shipping_address || 'N/A'}</p>
             </div>
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="block font-bold text-slate-400 uppercase text-xs mb-1.5 tracking-wider">Terms & Notes</span>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{item.notes || 'N/A'}</p>
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
