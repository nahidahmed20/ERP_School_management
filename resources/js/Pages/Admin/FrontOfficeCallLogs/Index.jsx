import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import FormModal from './Partials/FormModal';
import ShowModal from './Partials/ShowModal';
import Swal from 'sweetalert2';

export default function Index({ callLogs, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [typeFilter, setTypeFilter] = useState(filters.call_type ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showItem, setShowItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
      setFormOpen(false);
    }
  }, [flash]);

  const applyFilters = (overrides = {}) => {
    router.get(route('admin.frontoffice.call-logs.index'), { search, call_type: typeFilter, per_page: perPage, ...overrides }, { preserveState: true, replace: true });
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      router.delete(route('admin.frontoffice.call-logs.destroy', deleteId), {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const getTypeBadge = (type) => {
    if (type === 'Incoming') return <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">Incoming</span>;
    return <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-blue-50 text-blue-700 border border-blue-200">Outgoing</span>;
  };

  // --- Export Functions ---
  const handlePrint = () => window.print();

  const exportToCSV = () => {
    if (!callLogs.data.length) return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    const headers = ['Name', 'Phone', 'Call Type', 'Date', 'Duration', 'Follow-up'];
    const rows = callLogs.data.map(item => [
      item.name || 'N/A', 
      item.phone || 'N/A', 
      item.call_type || 'N/A', 
      item.date || 'N/A', 
      item.call_duration || 'N/A', 
      item.next_follow_up_date || 'N/A'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Phone_Call_Logs_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!callLogs.data.length) return;
    let text = "Name\tPhone\tType\tDate\tDuration\tFollow-up\n";
    callLogs.data.forEach(item => {
      text += `${item.name}\t${item.phone}\t${item.call_type}\t${item.date}\t${item.call_duration || '-'}\t${item.next_follow_up_date || '-'}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  const totalCount = callLogs?.total ?? callLogs?.data?.length ?? 0;
  const incomingCount = callLogs?.data?.filter(c => c.call_type === 'Incoming').length ?? 0;
  const outgoingCount = callLogs?.data?.filter(c => c.call_type === 'Outgoing').length ?? 0;

  return (
    <AuthenticatedLayout>
      <Head title="Phone Call Logs" />

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

      <div className="print-title">Phone Call Logs - {new Date().toLocaleDateString('en-GB')}</div>

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8 no-print">
        
        {/* Top Header Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner shrink-0">
              <Icon name="phone" className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider text-indigo-700 uppercase bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">Reception & Front Desk</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Phone Call Logs</h1>
              <p className="text-sm text-slate-500">স্কুলের সমস্ত অফিসিয়াল ইনকামিং ও আউটগোয়িং ফোন কলের রেকর্ড পরিচালনা করুন।</p>
            </div>
          </div>
          <button
            onClick={() => { setEditingItem(null); setFormOpen(true); }}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/20 active:scale-95 shrink-0"
          >
            <Icon name="plus" className="w-4 h-4" /> Add Call Log
          </button>
        </div>

        {/* Stat Cards Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <Icon name="phone" className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-slate-900">{totalCount}</h4>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Total Call Records</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <Icon name="arrow-down-left" className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-emerald-700">{incomingCount}</h4>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Incoming Calls (ইনকামিং)</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Icon name="arrow-right" className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-blue-700">{outgoingCount}</h4>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Outgoing Calls (আউটগোয়িং)</p>
            </div>
          </div>
        </div>

        {/* Unified Modern Toolbar */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col xl:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
            
            {/* Per Page */}
            <div className="w-28 shrink-0">
              <select
                value={perPage}
                data-no-select2="true"
                onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}
                className="per-page-select w-full h-10 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer text-center font-mono shrink-0 transition-all"
                title="Items per page"
              >
                <option value="10">10 / Page</option>
                <option value="20">20 / Page</option>
                <option value="50">50 / Page</option>
                <option value="all">All</option>
              </select>
            </div>

            <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

            {/* Type Filter */}
            <div className="w-full sm:w-44 shrink-0">
              <select 
                value={typeFilter} 
                onChange={(e) => { setTypeFilter(e.target.value); applyFilters({ call_type: e.target.value }); }}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                <option value="">All Call Types</option>
                <option value="Incoming">Incoming (ইনকামিং)</option>
                <option value="Outgoing">Outgoing (আউটগোয়িং)</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                className="block w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Apply Button */}
            <button
              onClick={() => applyFilters()}
              className="w-full sm:w-auto h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5"
            >
              Filter
            </button>

            {(search || typeFilter) && (
              <button
                onClick={() => { setSearch(''); setTypeFilter(''); applyFilters({ search: '', call_type: '' }); }}
                className="h-10 px-3 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all shrink-0 flex items-center justify-center"
              >
                Reset
              </button>
            )}
          </div>

          {/* Export Actions */}
          <div className="flex items-center justify-end gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl w-full xl:w-auto shadow-sm shrink-0 xl:ml-auto">
            <button onClick={copyToClipboard} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Copy to Clipboard">
              <Icon name="copy" className="w-3.5 h-3.5" /> Copy
            </button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={exportToCSV} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Export CSV">
              <Icon name="download" className="w-3.5 h-3.5" /> CSV
            </button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={handlePrint} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Print List">
              <Icon name="printer" className="w-3.5 h-3.5" /> Print
            </button>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 print-table-wrapper">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name &amp; Phone</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Call Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date &amp; Duration</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Follow-up</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {callLogs.data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-100">
                        <Icon name="phone" className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">No call logs found</p>
                      <p className="text-xs text-slate-400 mt-1">Try a different search, or add a new record</p>
                    </td>
                  </tr>
                ) : (
                  callLogs.data.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-900 block">{item.name}</span>
                        <span className="text-xs text-slate-500 font-mono font-medium block mt-0.5">{item.phone}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getTypeBadge(item.call_type)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-800 block">{item.date}</span>
                        <span className="text-xs text-slate-500 block mt-0.5">{item.call_duration || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-amber-600">
                        {item.next_follow_up_date || '—'}
                      </td>
                      <td className="px-6 py-4 text-right no-print">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => setShowItem(item)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Details">
                            <Icon name="eye" className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setEditingItem(item); setFormOpen(true); }} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Edit Log">
                            <Icon name="edit" className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(item.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Log">
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
            <Pagination meta={callLogs} />
          </div>
        </div>
      </div>

      {formOpen && <FormModal item={editingItem} onClose={() => setFormOpen(false)} />}
      {showItem && <ShowModal item={showItem} onClose={() => setShowItem(null)} />}

      {deleteId && (
        <ConfirmDeleteModal
          show={Boolean(deleteId)}
          onClose={() => setDeleteId(null)}
          onCancel={() => setDeleteId(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Call Log"
          message="আপনি কি নিশ্চিত যে এই কল লগের রেকর্ডটি চিরতরে মুছে ফেলতে চান?"
        />
      )}
    </AuthenticatedLayout>
  );
}