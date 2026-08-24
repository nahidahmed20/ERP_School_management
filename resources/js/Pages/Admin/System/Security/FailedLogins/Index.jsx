import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import Swal from 'sweetalert2';

export default function Index({ failedLogins, filters }) {
  const [search, setSearch] = useState(filters.search ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '50');

  function applyFilters(overrides = {}) {
    router.get(route('admin.security.failedlogins'), {
      search, per_page: perPage, ...overrides
    }, { preserveState: true, replace: true });
  }

  // Helper to extract basic browser info
  const getBrowserInfo = (agent) => {
    if (!agent) return 'Unknown Browser';
    if (agent.includes('Firefox')) return 'Firefox';
    if (agent.includes('Chrome') && !agent.includes('Edg')) return 'Chrome';
    if (agent.includes('Safari') && !agent.includes('Chrome')) return 'Safari';
    if (agent.includes('Edg')) return 'Edge';
    return 'Other Browser';
  };

  // --- Export Functions ---
  const handlePrint = () => window.print();

  const exportToCSV = () => {
    if (!failedLogins.data.length) return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    const headers = ['Attempted Email', 'IP Address', 'Browser Details', 'Attempt Time'];
    const rows = failedLogins.data.map(item => [
      item.email_attempted || 'N/A',
      item.ip_address || 'N/A',
      `${getBrowserInfo(item.user_agent)} - ${item.user_agent}`,
      item.attempted_at ? new Date(item.attempted_at).toLocaleString() : 'N/A'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Failed_Logins_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!failedLogins.data.length) return;
    let text = "Attempted Email\tIP Address\tBrowser Details\tAttempt Time\n";
    failedLogins.data.forEach(item => {
      text += `${item.email_attempted}\t${item.ip_address}\t${getBrowserInfo(item.user_agent)}\t${item.attempted_at ? new Date(item.attempted_at).toLocaleString() : '-'}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Failed Login Attempts" />

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

      <div className="print-title">System Failed Login Logs - {new Date().toLocaleDateString('en-GB')}</div>

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8 no-print">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-rose-600 uppercase">System / Security Logs</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Failed Login Attempts</h1>
            <p className="text-sm text-slate-500 mt-1">সিস্টেমে অবৈধভাবে অ্যাক্সেস করার ব্যর্থ চেষ্টাগুলো মনিটর করুন।</p>
          </div>
          <button
            onClick={() => applyFilters()}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95"
          >
            <Icon name="refresh" className="w-4 h-4 text-indigo-600" /> Refresh Logs
          </button>
        </div>

        {/* Alert Box for Security Warning */}
        <div className="bg-rose-50/80 border border-rose-200 p-4 rounded-xl flex items-start gap-4 shadow-sm animate-in fade-in duration-300">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200 shadow-sm mt-0.5">
            <Icon name="shield" className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-800 uppercase tracking-wider mb-0.5">Security Notice</h4>
            <p className="text-sm font-medium text-rose-700 leading-relaxed">
              These logs indicate unsuccessful attempts to access the system. Multiple attempts from the same IP may indicate a brute-force attack. Please review them carefully.
            </p>
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
              <option value="25">25 / Page</option>
              <option value="50">50 / Page</option>
              <option value="100">100 / Page</option>
              <option value="500">500 / Page</option>
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
                placeholder="Search Email or IP..."
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
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">SL</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Attempted Email</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">IP Address</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Browser Details</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Attempt Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {failedLogins.data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                      <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
                        <Icon name="check-circle" className="w-10 h-10 text-emerald-500" />
                      </div>
                      <p className="text-base font-bold text-slate-700">No failed login attempts recorded.</p>
                      <p className="text-sm font-medium text-emerald-600 mt-1">Your system is secure!</p>
                    </td>
                  </tr>
                ) : (
                  failedLogins.data.map((item, index) => (
                    <tr key={item.id} className="hover:bg-rose-50/40 transition-colors bg-white">
                      <td className="px-6 py-4 text-sm font-medium text-slate-500 font-mono">
                        {(failedLogins.from ?? 1) + index}
                      </td>
                      <td className="px-6 py-4">
                        <strong className="text-sm font-bold text-rose-600">{item.email_attempted}</strong>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg w-max border border-slate-200 shadow-sm">
                          <Icon name="globe" className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-bold text-indigo-600 font-mono tracking-tight">{item.ip_address}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <strong className="text-sm font-bold text-slate-800 block">{getBrowserInfo(item.user_agent)}</strong>
                        <span className="text-xs font-medium text-slate-500 block mt-0.5 truncate max-w-[250px]" title={item.user_agent}>
                          {item.user_agent}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <strong className="text-sm font-black text-slate-700 font-mono block">
                          {new Date(item.attempted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </strong>
                        <span className="text-xs font-semibold text-slate-500 font-mono block mt-0.5">
                          {new Date(item.attempted_at).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="no-print border-t border-slate-100 bg-white px-6 py-4 rounded-b-2xl">
            <Pagination meta={failedLogins} />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
