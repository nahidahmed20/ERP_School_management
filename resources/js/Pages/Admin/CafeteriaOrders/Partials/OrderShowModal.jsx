import React from 'react';
import Icon from '@/Components/Icons';

export default function OrderShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm print:p-0 print:bg-transparent print:backdrop-blur-none" onClick={onClose}>
      
      {/* Print Specific CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #invoice-print-area, #invoice-print-area * { visibility: visible; }
          #invoice-print-area { position: absolute; left: 0; top: 0; width: 100%; border: none; box-shadow: none; border-radius: 0; }
          .no-print { display: none !important; }
        }
      `}} />

      {/* Modal Box */}
      <div
        id="invoice-print-area"
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:max-h-max print:overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Screen Only */}
        <div className="bg-slate-50 px-6 py-5 border-b flex justify-between rounded-t-2xl no-print">
          <div>
            <h3 className="text-xl font-bold">Order Details</h3>
            <p className="text-sm font-mono text-indigo-600">{item.order_number}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full border bg-white flex items-center justify-center text-slate-400 hover:text-slate-600"><Icon name="close" className="w-4 h-4" /></button>
        </div>

        {/* Invoice Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar print:overflow-visible print:p-0">
          
          {/* Invoice Print Header (Shows nicely on Print, simple on Screen) */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">INVOICE</h2>
            <p className="text-sm text-slate-500 mt-1 font-semibold">{item.outlet?.name}</p>
            <p className="text-xs text-slate-400 font-mono mt-1">Order No: {item.order_number} | Date: {new Date(item.created_at).toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm print:border-none print:p-2 print:bg-transparent">
            <div><span className="block text-[11px] font-semibold text-slate-500 uppercase">Customer Name</span><strong className="block text-slate-900">{item.customer?.name}</strong></div>
            <div className="text-right"><span className="block text-[11px] font-semibold text-slate-500 uppercase">Order Status</span><strong className="block text-slate-900">{item.status}</strong></div>
            <div><span className="block text-[11px] font-semibold text-slate-500 uppercase">Payment Status</span><strong className={`block ${item.payment_status === 'Paid' ? 'text-emerald-600' : 'text-rose-600'}`}>{item.payment_status}</strong></div>
            <div className="text-right"><span className="block text-[11px] font-semibold text-slate-500 uppercase">Printed By</span><strong className="block text-slate-900">System Admin</strong></div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-3 text-slate-800">Ordered Items</h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200 print:border-none">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-bold">
                  <tr><th className="px-4 py-3">Item Name</th><th className="px-4 py-3 text-center">Qty</th><th className="px-4 py-3 text-right">Price</th><th className="px-4 py-3 text-right">Total</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {item.items?.map((food, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 font-bold text-slate-800">{food.name}</td>
                      <td className="px-4 py-3 text-center font-mono font-semibold">{food.qty}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">৳{food.price}</td>
                      <td className="px-4 py-3 text-right font-black font-mono text-slate-900">৳{(food.price * food.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-1/2 bg-slate-900 text-white rounded-xl px-5 py-4 flex items-center justify-between shadow-sm print:bg-transparent print:text-slate-900 print:border-t-2 print:border-slate-900 print:rounded-none print:px-2 print:py-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">Grand Total</span>
              <span className="text-2xl font-black text-amber-400 font-mono print:text-slate-900">৳ {Number(item.total_amount).toFixed(2)}</span>
            </div>
          </div>
          
          {/* Print Footer Tag */}
          <div className="hidden print:block text-center pt-8 text-xs text-slate-400">
            <p>Thank you for your order!</p>
            <p>Powered by Smart School ERP</p>
          </div>
        </div>

        {/* Action Footer - Hidden on Print */}
        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3 rounded-b-2xl no-print shrink-0">
          <button type="button" className="px-5 py-2.5 bg-white border rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors" onClick={onClose}>Close</button>
          <button type="button" onClick={() => window.print()} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md">
            <Icon name="printer" className="w-4 h-4" /> Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}