import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function Invoice({ sale }) {
  const handlePrint = () => {
    window.print();
  };

  const isDue = sale.due_amount > 0;

  const code = String(sale.invoice_number || 'INVOICE');
  const barcodeWidths = Array.from(code).map(ch => (ch.charCodeAt(0) % 4) + 1);
  const Barcode = () => (
    <span className="inline-flex items-end gap-0.5 h-4" aria-hidden="true">
      {barcodeWidths.map((w, i) => <span key={i} style={{ width: `${w}px` }} className="block h-full bg-slate-900" />)}
    </span>
  );

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 font-sans text-slate-900">
      <Head title={`Invoice - ${sale.invoice_number}`} />

      {/* --- Action Buttons (Hidden in Print) --- */}
      <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center no-print">
        <Link href={route('admin.sales.index')} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-semibold bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm transition-all">
          <Icon name="arrow-left" className="w-4 h-4" /> Back to Sales
        </Link>
        <button onClick={handlePrint} className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-sm px-6 py-2.5 rounded-xl shadow-md transition-all">
          <Icon name="printer" className="w-4 h-4" /> Print Invoice
        </button>
      </div>

      {/* --- Invoice Paper --- */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-12 relative overflow-hidden print:shadow-none print:border-none print:p-0">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-dashed border-slate-200 pb-8 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Your School/Company Name</h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">123 Education Street, City Name, 1200</p>
            <p className="text-xs text-slate-500 mt-0.5">Phone: +880 1234 567890 &nbsp;·&nbsp; Email: info@yourschool.com</p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center sm:justify-end gap-2 mb-2">
              <Icon name="receipt" className="w-4 h-4" /> Invoice
            </div>
            <Barcode />
            <div className="text-lg font-black font-mono text-slate-900 mt-1 flex items-center sm:justify-end gap-3">
              {sale.invoice_number}
              <span className={`inline-flex px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                !isDue ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {!isDue ? 'Paid' : 'Due'}
              </span>
            </div>
            <div className="text-xs text-slate-500 font-mono mt-1">
              {new Date(sale.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Customer & Payment Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Billed To</h4>
            <strong className="text-base font-bold text-slate-900 block">{sale.customer_name}</strong>
            {sale.customer_phone && <span className="text-xs text-slate-600 block mt-1 font-mono">Phone: {sale.customer_phone}</span>}
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Payment Info</h4>
            <div className="text-xs text-slate-700 space-y-1">
              <div><strong>Method:</strong> {sale.payment_method}</div>
              <div><strong>Cashier:</strong> {sale.seller?.name || 'Admin'}</div>
              <div><strong>Status:</strong> <span className={isDue ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>{isDue ? 'Due' : 'Paid'}</span></div>
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider font-semibold">
                <th className="px-4 py-3.5 rounded-l-xl">#</th>
                <th className="px-4 py-3.5">Item Description</th>
                <th className="px-4 py-3.5 text-center">Qty</th>
                <th className="px-4 py-3.5 text-right">Unit Price</th>
                <th className="px-4 py-3.5 text-right rounded-r-xl">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sale.items?.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3.5 font-mono text-slate-400 text-xs">{index + 1}</td>
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-slate-900 block">{item.product?.name}</span>
                    <span className="text-xs text-slate-500 font-mono">
                      {item.product?.item_code && `Code: ${item.product.item_code}`}
                      {item.size && ` · Size: ${item.size}`}
                      {item.color && ` · Color: ${item.color}`}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center font-bold font-mono text-slate-800">{item.quantity}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-slate-700">৳ {Number(item.unit_price).toFixed(2)}</td>
                  <td className="px-4 py-3.5 text-right font-black font-mono text-slate-900">৳ {Number(item.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="flex justify-end mb-12">
          <div className="w-full sm:w-80 space-y-2.5 text-sm">
            <div className="flex justify-between text-slate-600 px-2">
              <span>Subtotal</span>
              <span className="font-mono font-bold text-slate-900">৳ {Number(sale.subtotal).toFixed(2)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-rose-600 px-2">
                <span>Discount</span>
                <span className="font-mono font-bold">− ৳ {Number(sale.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="bg-slate-900 text-white rounded-xl p-4 flex justify-between items-center shadow-md">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Grand Total</span>
              <span className="text-xl font-black text-amber-400 font-mono">৳ {Number(sale.total_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600 px-2 pt-1">
              <span>Paid Amount</span>
              <span className="font-mono font-bold text-slate-900">৳ {Number(sale.paid_amount).toFixed(2)}</span>
            </div>
            {isDue && (
              <div className="flex justify-between text-rose-600 font-bold px-2 pt-1 border-t border-dashed border-slate-200">
                <span>Due Amount</span>
                <span className="font-mono">৳ {Number(sale.due_amount).toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-dashed border-slate-200 pt-8 text-center space-y-1">
          <h3 className="text-base font-bold text-slate-900">Thank you for your purchase!</h3>
          <p className="text-xs text-slate-500">If you have any questions about this invoice, please contact our support.</p>

          <div className="flex justify-between items-center mt-16 px-6">
            <div className="border-t border-dotted border-slate-400 w-40 pt-2 text-xs text-slate-500 font-mono">Customer Signature</div>
            <div className="border-t border-dotted border-slate-400 w-40 pt-2 text-xs text-slate-500 font-mono">Authorized Signature</div>
          </div>
        </div>

      </div>
    </div>
  );
}
