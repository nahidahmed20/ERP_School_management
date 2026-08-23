import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import VoucherFormModal from './Partials/VoucherFormModal';
import Swal from 'sweetalert2';

export default function Index({ vouchers, accounts, filters }) {
  const { flash } = usePage().props;
  
  const [search, setSearch] = useState(filters.search ?? '');
  const [typeFilter, setTypeFilter] = useState(filters.type ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    }
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.accounting.vouchers.index'), { 
      search, type: typeFilter, per_page: perPage, ...overrides 
    }, { preserveState: true, replace: true });
  }

  const getTypeStyle = (type) => {
    switch (type) {
      case 'Receipt': return 'bg-emerald-50 text-emerald-700 border-emerald-200'; // Money In
      case 'Payment': return 'bg-rose-50 text-rose-700 border-rose-200'; // Money Out
      case 'Contra': return 'bg-sky-50 text-sky-700 border-sky-200'; // Bank-Cash
      default: return 'bg-slate-100 text-slate-700 border-slate-300'; // Journal
    }
  };

  // --- Export Functions ---
  const handlePrint = () => window.print();

  const exportToCSV = () => {
    if (!vouchers.data.length) return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    const headers = ['Date', 'Voucher No', 'Type', 'Debit Account (DR)', 'Credit Account (CR)', 'Amount'];
    const rows = vouchers.data.map(item => [
      item.date || 'N/A', 
      item.voucher_no || 'N/A', 
      item.voucher_type || 'N/A', 
      item.debit_account?.name || 'N/A', 
      item.credit_account?.name || 'N/A', 
      item.amount || '0.00'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Accounting_Vouchers_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!vouchers.data.length) return;
    let text = "Date\tVoucher No\tType\tDebit Account\tCredit Account\tAmount\n";
    vouchers.data.forEach(item => {
      text += `${item.date}\t${item.voucher_no}\t${item.voucher_type}\t${item.debit_account?.name}\t${item.credit_account?.name}\t${item.amount}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Accounting Vouchers" />

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

      <div className="print-title">Accounting Vouchers - {new Date().toLocaleDateString('en-GB')}</div>

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8 no-print">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Finance & Accounts</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Accounting Vouchers</h1>
            <p className="text-sm text-slate-500 mt-1">ক্যাশ, ব্যাংক এবং অন্যান্য জার্নাল এন্ট্রির রেকর্ড পরিচালনা করুন।</p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/20 active:scale-95"
          >
            <Icon name="plus" className="w-4 h-4" /> Create Voucher
          </button>
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

            {/* Type Filter */}
            <select 
              value={typeFilter} 
              onChange={(e) => { setTypeFilter(e.target.value); applyFilters({ type: e.target.value }); }}
              className="w-full sm:w-56 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="">All Voucher Types</option>
              <option value="Receipt">Receipts (Money In)</option>
              <option value="Payment">Payments (Money Out)</option>
              <option value="Contra">Contra (Bank-Cash)</option>
              <option value="Journal">Journal (Adjustments)</option>
            </select>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search Voucher No..."
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
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date &amp; Voucher No</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Debit Account (DR)</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Credit Account (CR)</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right no-print">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vouchers.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-100">
                        <Icon name="folder" className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">No voucher entries found.</p>
                      <p className="text-xs text-slate-400 mt-1">Try a different search, or create a new voucher</p>
                    </td>
                  </tr>
                ) : (
                  vouchers.data.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <strong className="text-sm text-slate-900 block">{new Date(item.date).toLocaleDateString()}</strong>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[11px] font-mono font-bold tracking-widest">
                          {item.voucher_no}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border ${getTypeStyle(item.voucher_type)}`}>
                          {item.voucher_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-800">{item.debit_account?.name}</div>
                        <div className="text-[11px] font-medium text-slate-500 mt-0.5 font-mono">Code: {item.debit_account?.code || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-800">{item.credit_account?.name}</div>
                        <div className="text-[11px] font-medium text-slate-500 mt-0.5 font-mono">Code: {item.credit_account?.code || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[15px] font-black text-emerald-600 font-mono">
                          ৳ {item.amount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right no-print">
                        <div className="flex items-center justify-end gap-1.5">
                          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors shadow-sm" title="Print Voucher">
                            <Icon name="printer" className="w-3.5 h-3.5" /> Print
                          </button>
                          <button onClick={() => setDeletingItem(item)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete/Reverse Voucher">
                            <Icon name="trash" className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="no-print border-t border-slate-100 bg-white px-6 py-4 rounded-b-2xl">
            <Pagination meta={vouchers} />
          </div>
        </div>
      </div>

      {isFormOpen && (
        <VoucherFormModal 
          accounts={accounts} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
      
      {deletingItem && (
        <ConfirmDeleteModal 
          item={{ name: deletingItem.voucher_no }} 
          message="Are you sure you want to delete this voucher? This will reverse the transaction in your accounts."
          onCancel={() => setDeletingItem(null)} 
          onConfirm={() => {
            router.delete(route('admin.accounting.vouchers.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
          }} 
        />
      )}
    </AuthenticatedLayout>
  );
}