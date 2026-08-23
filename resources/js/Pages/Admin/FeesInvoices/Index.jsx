import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import Swal from 'sweetalert2';

export default function Index({ payments, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    }
  }, [flash]);

  const applyFilters = (overrides = {}) => {
    router.get(route('admin.fees.payments.index'), { search, per_page: perPage, ...overrides }, { preserveState: true, replace: true });
  };

  const printReceipt = (payment) => {
    // Standard ERP variables (Adjust based on your actual backend relationships)
    const schoolName = "Your School Name Here";
    const schoolAddress = "123 Education Street, City, Country | Phone: +880 1234 567 890";
    const receiptNo = payment.transaction_id || `RCPT-${payment.id}`;
    const studentName = payment.student?.first_name + ' ' + (payment.student?.last_name || '');
    const admissionNo = payment.student?.admission_no || 'N/A';
    const className = payment.student?.class?.name || 'N/A';
    const rollNo = payment.student?.roll_no || 'N/A';
    const feeGroup = payment.fee_assignment?.fee_group?.name || 'General Fee';

    const printContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Money Receipt - ${receiptNo}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 0; padding: 0; }
          .receipt-container { max-width: 800px; margin: 20px auto; padding: 30px; border: 1px solid #ccc; background: #fff; }
          .header { text-align: center; border-bottom: 2px solid #2c3e50; padding-bottom: 15px; margin-bottom: 20px; }
          .school-name { font-size: 26px; font-weight: bold; color: #2c3e50; margin: 0; text-transform: uppercase; }
          .school-address { font-size: 13px; color: #555; margin-top: 5px; }
          .receipt-title { display: inline-block; background: #2c3e50; color: #fff; padding: 6px 20px; font-weight: bold; border-radius: 4px; margin-top: 15px; letter-spacing: 1px; }
          .info-section { display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 14px; }
          .info-box { width: 48%; }
          .info-table { width: 100%; }
          .info-table td { padding: 4px 0; }
          .info-table td:first-child { font-weight: bold; width: 120px; }
          .fee-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }
          .fee-table th, .fee-table td { border: 1px solid #ddd; padding: 10px 12px; }
          .fee-table th { background-color: #f8f9fa; text-align: left; font-weight: bold; color: #2c3e50; }
          .text-right { text-align: right !important; }
          .text-center { text-align: center !important; }
          .totals-wrapper { display: flex; justify-content: flex-end; margin-bottom: 40px; }
          .totals-table { width: 300px; border-collapse: collapse; font-size: 14px; }
          .totals-table td { padding: 6px 10px; border-bottom: 1px solid #eee; }
          .totals-table tr:last-child td { border-bottom: none; font-weight: bold; font-size: 16px; background-color: #f8f9fa; }
          .signatures { display: flex; justify-content: space-between; margin-top: 70px; }
          .signature-box { text-align: center; }
          .signature-line { border-top: 1px dashed #333; width: 180px; padding-top: 5px; font-size: 14px; font-weight: bold; }
          @media print { body { -webkit-print-color-adjust: exact; } .receipt-container { border: none; padding: 0; margin: 0; } }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h1 class="school-name">${schoolName}</h1>
            <div class="school-address">${schoolAddress}</div>
            <div class="receipt-title">MONEY RECEIPT</div>
          </div>
          <div class="info-section">
            <div class="info-box">
              <table class="info-table">
                <tr><td>Student Name</td><td>: ${studentName}</td></tr>
                <tr><td>Admission No</td><td>: ${admissionNo}</td></tr>
                <tr><td>Class & Roll</td><td>: ${className} (Roll: ${rollNo})</td></tr>
              </table>
            </div>
            <div class="info-box">
              <table class="info-table">
                <tr><td>Receipt No</td><td>: ${receiptNo}</td></tr>
                <tr><td>Date</td><td>: ${payment.payment_date}</td></tr>
                <tr><td>Method</td><td>: ${payment.payment_method}</td></tr>
              </table>
            </div>
          </div>
          <table class="fee-table">
            <thead>
              <tr>
                <th width="10%" class="text-center">Sl</th>
                <th width="50%">Fee Description</th>
                <th width="20%" class="text-center">Month/Year</th>
                <th width="20%" class="text-right">Amount (৳)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-center">1</td>
                <td>${feeGroup}</td>
                <td class="text-center">${new Date(payment.payment_date).toLocaleString('default', { month: 'short', year: 'numeric' })}</td>
                <td class="text-right">${Number(payment.amount_paid).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div class="totals-wrapper">
            <table class="totals-table">
              <tr><td>Sub Total</td><td class="text-right">৳${Number(payment.amount_paid).toFixed(2)}</td></tr>
              <tr><td>Discount / Fine</td><td class="text-right">৳0.00</td></tr>
              <tr><td><strong>Total Paid</strong></td><td class="text-right"><strong>৳${Number(payment.amount_paid).toFixed(2)}</strong></td></tr>
            </table>
          </div>
          <div class="signatures">
            <div class="signature-box"><div class="signature-line">Student / Guardian</div></div>
            <div class="signature-box"><div class="signature-line">Authorized Signature</div></div>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  // --- Export Functions ---
  const handlePrint = () => window.print();

  const exportToCSV = () => {
    if (!payments.data.length) return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    const headers = ['Date', 'Student Name', 'Admission No', 'Fee Detail', 'Method', 'Amount'];
    const rows = payments.data.map(item => [
      item.payment_date || 'N/A', 
      `${item.student?.first_name || ''} ${item.student?.last_name || ''}`.trim() || 'N/A', 
      item.student?.admission_no || 'N/A', 
      item.fee_assignment?.fee_group?.name || 'N/A', 
      item.payment_method || 'N/A', 
      item.amount_paid || '0.00'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Transactions_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!payments.data.length) return;
    let text = "Date\tStudent Name\tAdmission No\tFee Detail\tMethod\tAmount\n";
    payments.data.forEach(item => {
      text += `${item.payment_date}\t${item.student?.first_name || ''} ${item.student?.last_name || ''}\t${item.student?.admission_no}\t${item.fee_assignment?.fee_group?.name}\t${item.payment_method}\t${item.amount_paid}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Invoices & Transactions" />

      {/* Print Specific CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          nav, aside, header, .no-print, button, a, select, input { display: none !important; }
          body, html { background: #f8fafc !important; }
          .print-table-wrapper { width: 100% !important; border: none !important; box-shadow: none !important; }
          .print-title { display: block !important; font-size: 24px !important; font-weight: bold !important; margin-bottom: 20px !important; }
        }
        @media screen { .print-title { display: none; } }
      `}} />

      <div className="print-title">Transactions Directory - {new Date().toLocaleDateString('en-GB')}</div>

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8 no-print">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Finance & Accounts</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Invoices &amp; Transactions</h1>
            <p className="text-sm text-slate-500 mt-1">সকল পেমেন্ট ও লেনদেনের তালিকা এবং মানি রিসিট।</p>
          </div>
        </div>

        {/* Unified Modern Toolbar */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col xl:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            
            {/* Per Page */}
            <select
              value={perPage}
              onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}
              className="appearance-none bg-none pr-3 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer text-center font-mono"
              style={{ backgroundImage: 'none' }}
            >
              <option value="10">10 / Page</option>
              <option value="20">20 / Page</option>
              <option value="50">50 / Page</option>
              <option value="all">All</option>
            </select>

            <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by Admission No or Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Apply Button */}
            <button
              onClick={() => applyFilters()}
              className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              Search
            </button>
          </div>

          {/* Export Actions */}
          <div className="flex items-center justify-end gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl w-full xl:w-auto shadow-sm shrink-0 ml-auto">
            <button onClick={copyToClipboard} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Copy to Clipboard">
              Copy
            </button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={exportToCSV} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Export CSV">
              CSV
            </button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={() => alert('Backend Excel plugin needed')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-green-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Export Excel">
              Excel
            </button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={() => alert('Backend PDF plugin needed')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Export PDF">
              PDF
            </button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={handlePrint} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Print List">
              Print
            </button>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 print-table-wrapper">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Info</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fee Detail</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right no-print">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-100">
                        <Icon name="folder" className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">No transactions found</p>
                      <p className="text-xs text-slate-400 mt-1">Try searching with a different keyword</p>
                    </td>
                  </tr>
                ) : (
                  payments.data.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700 font-mono">
                        {payment.payment_date}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-900 block">
                          {payment.student?.first_name} {payment.student?.last_name}
                        </span>
                        <div className="text-xs font-medium text-slate-500 mt-0.5 font-mono">
                          Adm: #{payment.student?.admission_no}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold">
                          {payment.fee_assignment?.fee_group?.name || 'General Fee'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wide">
                          <Icon name="check" className="w-3.5 h-3.5 text-indigo-500" />
                          {payment.payment_method}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-emerald-600 font-mono">
                          ৳{payment.amount_paid}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right no-print">
                        <button
                          onClick={() => printReceipt(payment)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors shadow-sm"
                          title="Print Receipt"
                        >
                          <Icon name="printer" className="w-3.5 h-3.5" /> Print
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="no-print border-t border-slate-100 bg-white px-6 py-4 rounded-b-2xl">
            <Pagination meta={payments} />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}