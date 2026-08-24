import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import AuditLogDetailsModal from './Partials/AuditLogDetailsModal';
import Swal from 'sweetalert2';

export default function Index({ auditLogs, filters }) {
  const [search, setSearch] = useState(filters.search ?? '');
  const [actionType, setActionType] = useState(filters.action_type ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '50');

  const [viewingLog, setViewingLog] = useState(null);

  function applyFilters(overrides = {}) {
    router.get(route('admin.security.auditlogs'), {
      search, action_type: actionType, per_page: perPage, ...overrides
    }, { preserveState: true, replace: true });
  }

  useEffect(() => {
    if (perPage !== (filters.per_page ?? '50') || actionType !== (filters.action_type ?? '')) {
      applyFilters({ per_page: perPage, action_type: actionType });
    }
  }, [perPage, actionType]);

  const getActionColor = (action) => {
    switch(action.toLowerCase()) {
      case 'created': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'updated': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'deleted': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  // --- Export Functions ---
  const handlePrint = () => window.print();

  const exportToCSV = () => {
    if (!auditLogs.data.length) return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    const headers = ['Date & Time', 'Performed By', 'Action', 'Module / Model', 'Model ID', 'IP Address'];
    const rows = auditLogs.data.map(item => [
      new Date(item.created_at).toLocaleString() || 'N/A',
      item.user ? `${item.user.name} (${item.user.role})` : 'System / Guest',
      item.action || 'N/A',
      item.model_type.split('\\').pop() || 'N/A',
      item.model_id || 'N/A',
      item.ip_address || 'N/A'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Audit_Logs_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!auditLogs.data.length) return;
    let text = "Date & Time\tPerformed By\tAction\tModule\tIP Address\n";
    auditLogs.data.forEach(item => {
      let user = item.user ? item.user.name : 'System / Guest';
      let module = item.model_type.split('\\').pop();
      text += `${new Date(item.created_at).toLocaleString()}\t${user}\t${item.action}\t${module}\t${item.ip_address}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Audit Logs" />

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

      <div className="print-title">System Audit Logs - {new Date().toLocaleDateString('en-GB')}</div>

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8 no-print">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">System / Security Logs</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">System Audit Logs</h1>
            <p className="text-sm text-slate-500 mt-1">সিস্টেমের গুরুত্বপূর্ণ পরিবর্তন (Create, Update, Delete) এবং অ্যাক্টিভিটিগুলো ট্র্যাক করুন।</p>
          </div>
          <button
            onClick={() => applyFilters()}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95"
          >
            <Icon name="refresh" className="w-4 h-4 text-indigo-600" /> Refresh Logs
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
              <option value="25">25 / Page</option>
              <option value="50">50 / Page</option>
              <option value="100">100 / Page</option>
              <option value="500">500 / Page</option>
              <option value="all">All</option>
            </select>

            <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

            {/* Action Type Filter */}
            <select
              value={actionType}
              onChange={(e) => { setActionType(e.target.value); applyFilters({ action_type: e.target.value }); }}
              className="w-full sm:w-40 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="">All Actions</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="deleted">Deleted</option>
            </select>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search Module or User..."
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
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date &amp; Time</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Performed By</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Action</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Module / Model</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">IP Address</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right no-print">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-100">
                        <Icon name="activity" className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">No audit logs available.</p>
                      <p className="text-xs text-slate-400 mt-1">System events will be logged here.</p>
                    </td>
                  </tr>
                ) : (
                  auditLogs.data.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <strong className="text-sm font-black text-slate-700 font-mono block">
                          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </strong>
                        <span className="text-xs font-semibold text-slate-500 font-mono block mt-0.5">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {item.user ? (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0 font-bold shadow-sm text-xs">
                              {item.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <strong className="text-sm font-bold text-slate-900 block leading-tight">{item.user.name}</strong>
                              <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase bg-slate-100 text-slate-600 border border-slate-200 mt-1">
                                {item.user.role || 'User'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-500">
                            <Icon name="cpu" className="w-4 h-4" />
                            <span className="text-sm font-bold italic">System / Guest</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border ${getActionColor(item.action)}`}>
                          {item.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg w-max shadow-sm">
                          <strong className="text-sm font-bold text-slate-800 block leading-tight">{item.model_type.split('\\').pop()}</strong>
                          <span className="text-[11px] font-mono text-slate-500 font-semibold block mt-0.5">ID: {item.model_id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Icon name="globe" className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-sm font-bold text-indigo-600 font-mono tracking-tight">{item.ip_address}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right no-print">
                        <button
                          className="px-4 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg shadow-sm transition-all"
                          onClick={() => setViewingLog(item)}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="no-print border-t border-slate-100 bg-white px-6 py-4 rounded-b-2xl">
            <Pagination meta={auditLogs} />
          </div>
        </div>
      </div>

      {viewingLog && <AuditLogDetailsModal log={viewingLog} onClose={() => setViewingLog(null)} />}
    </AuthenticatedLayout>
  );
}
