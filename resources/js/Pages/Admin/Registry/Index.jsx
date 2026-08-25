import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Pagination from '@/Components/Pagination';
import Swal from 'sweetalert2'; 

const DIAG_LABELS = {
  php_version: 'PHP Version',
  laravel_version: 'Laravel Version',
  db_connection: 'DB Connection',
  db_status: 'Database Status',
  cache_driver: 'Cache Driver',
  queue_driver: 'Queue Driver',
  storage_writable: 'Storage Writable',
  debug_mode: 'Debug Mode',
  environment: 'Environment',
  server_time: 'Server Time',
};

export default function Index({ logs, filters, diagnostics }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [level, setLevel] = useState(filters.level ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    }
    if (flash?.error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
    }
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.registry'), {
      search, level, per_page: perPage, ...overrides,
    }, { preserveState: true, replace: true });
  }

  useEffect(() => {
    if (perPage !== (filters.per_page ?? '10')) {
      applyFilters({ per_page: perPage });
    }
  }, [perPage]);

  function confirmDelete() {
    router.delete(route('admin.registry.destroy', deletingItem.id), {
      onSuccess: () => setDeletingItem(null),
    });
  }

  function clearAll() {
    Swal.fire({
      title: 'Are you sure?',
      text: "সব Log চিরতরে মুছে ফেলা হবে। এটি রিকভার করা সম্ভব নয়!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, clear all!',
      cancelButtonText: 'Cancel',
      customClass: { popup: 'rounded-2xl' }
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(route('admin.registry.clear'));
      }
    });
  }

  // Helper function to colorize log levels
  const getLevelBadge = (lvl) => {
    switch (lvl?.toLowerCase()) {
      case 'info': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'warning': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'error': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-300 font-black';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  // --- Export Functions ---
  const handlePrint = () => window.print();

  const exportToCSV = () => {
    if (!logs.data.length) return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    const headers = ['Level', 'Action', 'Message', 'User', 'IP Address', 'Time'];
    const rows = logs.data.map(item => [
      item.level || 'N/A', 
      item.action || 'N/A', 
      item.message ? item.message.replace(/(\r\n|\n|\r)/gm, " ") : 'N/A', 
      item.user?.name || 'System', 
      item.ip_address || 'No IP',
      item.created_at || 'N/A'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `System_Logs_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!logs.data.length) return;
    let text = "Level\tAction\tUser\tIP Address\tTime\n";
    logs.data.forEach(item => {
      text += `${item.level}\t${item.action}\t${item.user?.name || 'System'}\t${item.ip_address || 'No IP'}\t${item.created_at}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  return (
    <AuthenticatedLayout>
      <Head title="System Registry & Diagnostics" />

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

      <div className="print-title">System Diagnostics &amp; Logs - {new Date().toLocaleDateString('en-GB')}</div>

      <div className="w-full space-y-8 sm:px-6 lg:px-8 py-8 no-print">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Settings &amp; Registry</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">System Diagnostics &amp; Logs</h1>
            <p className="text-sm text-slate-500 mt-1">সিস্টেমের স্বাস্থ্য পরীক্ষা করুন এবং কার্যকলাপের (Activity) লগ দেখুন।</p>
          </div>
          <button 
            onClick={clearAll}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <Icon name="trash" className="w-4 h-4" /> Clear All Logs
          </button>
        </div>

        {/* Diagnostics Grid */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-sm shrink-0">
              <Icon name="activity" className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">System Health</h2>
            <div className="h-px bg-slate-200 flex-1 ml-2"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Object.entries(diagnostics).map(([key, value]) => {
              const isFail = String(value).toLowerCase() === 'fail' || String(value).toLowerCase() === 'false';
              return (
                <div key={key} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center items-start transition-all hover:shadow-md relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 w-12 h-12 -mt-4 -mr-4 rounded-full opacity-10 transition-transform group-hover:scale-150 ${isFail ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{DIAG_LABELS[key] ?? key}</span>
                  <span className={`mt-1.5 text-sm font-bold truncate w-full ${isFail ? 'text-rose-600' : 'text-slate-800'}`} title={String(value)}>
                    {String(value)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Logs Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-sm shrink-0">
              <Icon name="list" className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Activity Logs</h2>
            <div className="h-px bg-slate-200 flex-1 ml-2"></div>
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
                <option value="25">25 / Page</option>
                <option value="50">50 / Page</option>
                <option value="100">100 / Page</option>
                <option value="all">All</option>
              </select>

              <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

              {/* Level Filter */}
              <select 
                value={level} 
                onChange={(e) => { setLevel(e.target.value); applyFilters({ level: e.target.value }); }}
                className="w-full sm:w-36 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                <option value="">All Levels</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="critical">Critical</option>
              </select>

              {/* Search */}
              <div className="relative flex-1 min-w-[200px] sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="search" className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by action or message..."
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
                Filter
              </button>
            </div>

            {/* Export Actions */}
            <div className="flex items-center justify-end gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl w-full xl:w-auto shadow-sm shrink-0 ml-auto">
              <button onClick={copyToClipboard} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Copy to Clipboard">Copy</button>
              <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
              <button onClick={exportToCSV} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Export CSV">CSV</button>
              <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
              <button onClick={() => alert('Backend Excel plugin needed')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-green-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Export Excel">Excel</button>
              <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
              <button onClick={() => alert('Backend PDF plugin needed')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Export PDF">PDF</button>
              <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
              <button onClick={handlePrint} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Print List">Print</button>
            </div>

          </div>

          {/* Main Table Card */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 print-table-wrapper">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center w-20">Level</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/3">Message</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User &amp; IP</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right no-print">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.data.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-100">
                          <Icon name="file-text" className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-sm font-semibold text-slate-600">কোনো Log পাওয়া যায়নি।</p>
                        <p className="text-xs text-slate-400 mt-1">System activity will appear here.</p>
                      </td>
                    </tr>
                  ) : (
                    logs.data.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase border ${getLevelBadge(item.level)}`}>
                            {item.level}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-[11px] font-bold tracking-tight bg-slate-100 text-slate-700 px-2 py-1 rounded-md border border-slate-200 font-mono">
                            {item.action}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-700 max-w-sm truncate" title={item.message}>
                            {item.message}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <strong className="text-sm font-bold text-slate-900 block leading-tight">{item.user?.name ?? 'System'}</strong>
                          <span className="text-[11px] font-mono font-semibold text-slate-500 block mt-0.5">{item.ip_address ?? 'No IP'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-slate-500 whitespace-nowrap block">{item.created_at}</span>
                        </td>
                        <td className="px-6 py-4 text-right no-print">
                          <button 
                            onClick={() => setDeletingItem(item)} 
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                            title="Delete Log"
                          >
                            <Icon name="trash" className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-100 bg-white px-6 py-4 rounded-b-2xl no-print">
              <Pagination meta={logs} />
            </div>
          </div>
        </section>

      </div>

      {deletingItem && (
        <ConfirmDeleteModal
          item={{ name: "this log entry" }}
          onCancel={() => setDeletingItem(null)}
          onConfirm={confirmDelete}
        />
      )}
    </AuthenticatedLayout>
  );
}