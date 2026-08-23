import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';

export default function ReportIndex({ sales, summary, filters }) {
  const [startDate, setStartDate] = useState(filters.start_date ?? '');
  const [endDate, setEndDate] = useState(filters.end_date ?? '');
  const [paymentMethod, setPaymentMethod] = useState(filters.payment_method ?? '');

  const applyFilters = () => {
    router.get(route('admin.sales.reports.index'), {
      start_date: startDate,
      end_date: endDate,
      payment_method: paymentMethod
    }, { preserveState: true, replace: true });
  };

  const handlePrint = () => window.print();

  const exportToCSV = () => {
    if (!sales.length) return alert('Export করার মতো কোনো ডেটা নেই।');
    const headers = ['Invoice Number', 'Customer Name', 'Phone', 'Payment Method', 'Date', 'Total', 'Paid', 'Due'];
    const rows = sales.map(item => [
      item.invoice_number || 'N/A',
      item.customer_name || 'N/A',
      item.customer_phone || 'N/A',
      item.payment_method || 'Cash',
      new Date(item.created_at).toLocaleDateString(),
      item.total_amount || '0',
      item.paid_amount || '0',
      item.due_amount || '0'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Sales_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link href={route('admin.sales.index')} className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-semibold mb-2 transition-colors">
              <Icon name="arrow-left" className="w-3.5 h-3.5"/> Back to Sales History
            </Link>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase block">Sales &amp; POS</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Sales Reports &amp; Analytics</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportToCSV} className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm">
              <Icon name="download" className="w-4 h-4" /> Export CSV
            </button>
            <button onClick={handlePrint} className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm">
              <Icon name="printer" className="w-4 h-4" /> Print Report
            </button>
          </div>
        </div>
      }
    >
      <Head title="Sales Reports" />

      {/* Print Specific CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          nav, aside, header, .no-print, button, a, select, input { display: none !important; }
          body, html { background: #ffffff !important; }
          .print-container { width: 100% !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
          .print-title { display: block !important; font-size: 22px !important; font-weight: bold !important; margin-bottom: 20px !important; }
        }
        @media screen { .print-title { display: none; } }
      `}} />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8 print-container">

        <div className="print-title">Sales Financial Report - {new Date().toLocaleDateString('en-GB')}</div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-4 no-print">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="bKash">bKash</option>
              <option value="Card">Card</option>
            </select>
          </div>

          <div className="flex items-end gap-2 mt-auto">
            <button onClick={applyFilters} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
              Generate Report
            </button>
            {(startDate || endDate || paymentMethod) && (
              <button onClick={() => { setStartDate(''); setEndDate(''); setPaymentMethod(''); router.get(route('admin.sales.reports.index')); }} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-xl transition-colors">
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Invoices</span>
            <span className="text-2xl font-black text-slate-900 font-mono">{summary.total_invoices}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Sales</span>
            <span className="text-2xl font-black text-indigo-600 font-mono">৳ {Number(summary.total_sales).toFixed(2)}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Collected</span>
            <span className="text-2xl font-black text-emerald-600 font-mono">৳ {Number(summary.total_paid).toFixed(2)}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Due</span>
            <span className="text-2xl font-black text-rose-600 font-mono">৳ {Number(summary.total_due).toFixed(2)}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Discount</span>
            <span className="text-2xl font-black text-amber-600 font-mono">৳ {Number(summary.total_discount).toFixed(2)}</span>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Total</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Paid</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      কোনো বিক্রয় রেকর্ড পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                        {sale.invoice_number}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 block">{sale.customer_name}</span>
                        <span className="text-xs text-slate-500 font-mono">{sale.customer_phone || '—'}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {sale.payment_method}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600 text-xs">
                        {new Date(sale.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-900 font-mono">
                        ৳ {Number(sale.total_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600 font-mono">
                        ৳ {Number(sale.paid_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-rose-600 font-mono">
                        ৳ {Number(sale.due_amount).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AuthenticatedLayout>
  );
}
