import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

export default function FeeCollection({ payments, totalCollection, classes, filters }) {
  const [startDate, setStartDate] = useState(filters.start_date || '');
  const [endDate, setEndDate] = useState(filters.end_date || '');
  const [classId, setClassId] = useState(filters.class_id || '');

  const applyFilters = (e) => {
    e?.preventDefault();
    router.get(route('admin.reports.fees'), {
      start_date: startDate,
      end_date: endDate,
      class_id: classId
    }, { preserveState: true });
  };

  // --- Export Functions ---
  const handlePrint = () => window.print();

  const exportToCSV = () => {
    if (!payments.length) return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    const headers = ['Date', 'Transaction ID', 'Student Name', 'Admission No', 'Class', 'Fee Type', 'Amount Paid'];
    const rows = payments.map(payment => [
      payment.payment_date || 'N/A',
      payment.transaction_id || 'N/A',
      payment.student?.first_name || 'N/A',
      payment.student?.admission_no || 'N/A',
      payment.student?.current_enrollment?.school_class?.name || 'N/A',
      payment.fee_assignment?.fee_group?.name || 'N/A',
      payment.amount_paid || '0'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Fee_Collection_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!payments.length) return;
    let text = "Date\tTrx ID\tStudent\tClass\tFee Type\tAmount\n";
    payments.forEach(payment => {
      text += `${payment.payment_date}\t${payment.transaction_id || '-'}\t${payment.student?.first_name}\t${payment.student?.current_enrollment?.school_class?.name}\t${payment.fee_assignment?.fee_group?.name}\t${payment.amount_paid}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  const Taka = () => (
    <span className="font-sans font-normal mr-0.5">৳</span>
  );

  return (
    <AuthenticatedLayout>
      <Head title="Fee Collection Report" />

      {/* Print Specific CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          nav, aside, header, .no-print, button, a, select, input { display: none !important; }
          body, html { background: #fff !important; color: #000 !important; }
          .printable-area { width: 100% !important; border: none !important; box-shadow: none !important; }
          
          /* Adjust summary card for print to save ink */
          .summary-widget {
            background: #fff !important;
            color: #000 !important;
            border: 2px solid #cbd5e1 !important;
            box-shadow: none !important;
          }
          .summary-widget * { color: #000 !important; }
          .summary-widget svg, .summary-widget .bg-white\\/10 { display: none !important; }
          
          /* Force table borders for print */
          table th, table td { border-bottom: 1px solid #e2e8f0 !important; color: #000 !important; }
        }
      `}} />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Reports</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Fee Collection Report</h1>
            <p className="text-sm text-slate-500 mt-1">তারিখ এবং ক্লাস অনুযায়ী ফি কালেকশনের বিস্তারিত রিপোর্ট।</p>
          </div>
        </div>

        {/* --- Filter Section --- */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 no-print">
          <form onSubmit={applyFilters} className="flex flex-col md:flex-row items-end gap-4 w-full">
            
            <div className="w-full md:flex-1">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                <Icon name="calendar" className="w-4 h-4 text-slate-400" /> Start Date
              </label>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                required 
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
              />
            </div>

            <div className="w-full md:flex-1">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                <Icon name="calendar" className="w-4 h-4 text-slate-400" /> End Date
              </label>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
                required 
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
              />
            </div>

            <div className="w-full md:flex-1">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                <Icon name="users" className="w-4 h-4 text-slate-400" /> Class (Optional)
              </label>
              <select 
                value={classId} 
                onChange={e => setClassId(e.target.value)} 
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
              >
                <option value="">All Classes</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="w-full md:w-auto">
              <button 
                type="submit" 
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/20 active:scale-95 whitespace-nowrap"
              >
                Generate Report
              </button>
            </div>
          </form>
        </div>

        {/* Export Actions Toolbar */}
        <div className="flex justify-end no-print">
          <div className="flex items-center justify-end gap-1.5 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
            <button onClick={copyToClipboard} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all flex items-center gap-1.5" title="Copy to Clipboard">Copy</button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={exportToCSV} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all flex items-center gap-1.5" title="Export CSV">CSV</button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={() => alert('Backend Excel plugin needed')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all flex items-center gap-1.5" title="Export Excel">Excel</button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={() => alert('Backend PDF plugin needed')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all flex items-center gap-1.5" title="Export PDF">PDF</button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={handlePrint} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all flex items-center gap-1.5" title="Print Report">Print</button>
          </div>
        </div>

        {/* --- Report Content Area --- */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 printable-area overflow-hidden">
          
          <div className="p-6 sm:p-8">
            {/* Report Header (Visible mainly on print) */}
            <div className="text-center mb-8 pb-6 border-b-2 border-dashed border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Fee Collection Report</h2>
              <div className="inline-flex items-center gap-3 text-sm font-semibold text-slate-600 bg-slate-50 px-5 py-2 rounded-full border border-slate-100">
                <span>Period: <span className="text-indigo-600">{startDate || 'N/A'}</span> to <span className="text-indigo-600">{endDate || 'N/A'}</span></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span>Class: <span className="text-indigo-600">{classId ? classes.find(c => c.id == classId)?.name : 'All Classes'}</span></span>
              </div>
            </div>

            {/* Premium Summary Widget */}
            <div className="summary-widget relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 sm:p-8 mb-8 flex justify-between items-center text-white shadow-lg shadow-emerald-500/30">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mt-10 -mr-10 blur-2xl"></div>
              <div className="relative z-10">
                <div className="text-sm font-bold text-emerald-50 uppercase tracking-wider mb-1.5">Total Collection Amount</div>
                <div className="text-4xl sm:text-5xl font-black tracking-tight">
                  <Taka />{Number(totalCollection).toLocaleString()}
                </div>
              </div>
              <div className="relative z-10 bg-white/20 p-4 sm:p-5 rounded-full backdrop-blur-md shrink-0">
                <Icon name="currency-dollar" className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>

            {/* Data Table */}
            <div className="rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date &amp; Trx ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Info</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fee Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-16 text-center text-slate-500">
                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                          <Icon name="document-search" className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-base font-bold text-slate-700">কোনো ডাটা পাওয়া যায়নি।</p>
                        <p className="text-sm font-medium text-slate-500 mt-1">অনুগ্রহ করে ভিন্ন ডেট বা ক্লাস নির্বাচন করুন।</p>
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <strong className="text-sm font-bold text-slate-900 block">{payment.payment_date}</strong>
                          <span className="text-xs font-mono font-medium text-slate-500 block mt-0.5">Trx: {payment.transaction_id || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <strong className="text-sm font-bold text-slate-900 block">{payment.student?.first_name}</strong>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono text-slate-500">Adm: {payment.student?.admission_no}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Class: {payment.student?.current_enrollment?.school_class?.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-sky-50 text-sky-700 border border-sky-200">
                            {payment.fee_assignment?.fee_group?.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <strong className="text-base font-black text-emerald-600 tracking-tight">
                            <Taka />{Number(payment.amount_paid).toLocaleString()}
                          </strong>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </AuthenticatedLayout>
  );
}