import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import FormModal from './Partials/FormModal';
import ShowModal from './Partials/ShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ maintenances, assets, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [statusFilter, setStatusFilter] = useState(filters.status ?? '');
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
    router.get(route('admin.purchase.asset-maintenance.index'), { 
      search, status: statusFilter, per_page: perPage, ...overrides 
    }, { preserveState: true, replace: true });
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      router.delete(route('admin.purchase.asset-maintenance.destroy', deleteId), {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const handleStatusChange = (id, newStatus) => {
    router.patch(route('admin.purchase.asset-maintenance.update-status', id), {
      status: newStatus
    }, { 
      preserveScroll: true,
      onSuccess: () => {
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Status updated successfully!', showConfirmButton: false, timer: 2000 });
      }
    });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500';
      case 'In Progress': return 'bg-indigo-50 text-indigo-700 border-indigo-200 focus:ring-indigo-500';
      case 'Cancelled': return 'bg-rose-50 text-rose-700 border-rose-200 focus:ring-rose-500';
      default: return 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-500'; // Pending
    }
  };

  // --- Export Functions ---
  const handlePrint = () => window.print();

  const exportToCSV = () => {
    if (!maintenances.data.length) return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    const headers = ['Asset', 'Task Title', 'Provider', 'Maintenance Type', 'Cost', 'Start Date', 'End Date', 'Status'];
    const rows = maintenances.data.map(item => [
      item.asset?.name || 'Unknown', 
      item.title || 'N/A', 
      item.service_provider || 'In-house', 
      item.maintenance_type || 'N/A', 
      item.cost || '0', 
      item.start_date || 'N/A', 
      item.end_date || 'N/A', 
      item.status || 'Pending'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Asset_Maintenance_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!maintenances.data.length) return;
    let text = "Asset\tTask Title\tProvider\tType\tCost\tDates\tStatus\n";
    maintenances.data.forEach(item => {
      let dates = `${item.start_date} to ${item.end_date || 'Ongoing'}`;
      text += `${item.asset?.name}\t${item.title}\t${item.service_provider || 'In-house'}\t${item.maintenance_type}\t${item.cost}\t${dates}\t${item.status}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Asset Maintenance" />

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

      <div className="print-title">Asset Maintenance Directory - {new Date().toLocaleDateString('en-GB')}</div>

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8 no-print">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Purchase & Assets</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Asset Maintenance</h1>
            <p className="text-sm text-slate-500 mt-1">স্কুলের সম্পদের মেরামত ও রক্ষণাবেক্ষণের কাজ ও খরচ ট্র্যাক করুন।</p>
          </div>
          <button
            onClick={() => { setEditingItem(null); setFormOpen(true); }}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/20 active:scale-95"
          >
            <Icon name="plus" className="w-4 h-4" /> Add Maintenance
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

            {/* Status Filter */}
            <select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); applyFilters({ status: e.target.value }); }}
              className="w-full sm:w-44 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search task or provider..."
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
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset / Task</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Provider &amp; Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cost</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {maintenances.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-100">
                        <Icon name="settings" className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">No maintenance records found</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting filters or add a new record</p>
                    </td>
                  </tr>
                ) : (
                  maintenances.data.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <strong className="text-sm font-bold text-slate-900 block">{item.title}</strong>
                        <div className="text-xs text-slate-500 font-medium mt-0.5 max-w-[200px] truncate" title={item.asset?.name}>
                          {item.asset?.name || 'Unknown Asset'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-800 block">{item.service_provider || 'In-house'}</span>
                        <span className="inline-flex px-2 py-0.5 mt-1 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-bold tracking-wider uppercase">
                          {item.maintenance_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-rose-600 font-mono block">
                          {item.cost} <span className="text-xs text-rose-400">BDT</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-700 block text-xs">Start: <span className="font-mono">{item.start_date}</span></span>
                        {item.end_date && <span className="text-xs text-emerald-600 font-bold block mt-0.5">End: <span className="font-mono">{item.end_date}</span></span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {/* Inline Status Updater */}
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border outline-none cursor-pointer transition-colors ${getStatusBadge(item.status)}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right no-print">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => setShowItem(item)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Details">
                            <Icon name="eye" className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setEditingItem(item); setFormOpen(true); }} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit Record">
                            <Icon name="edit" className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(item.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Record">
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
            <Pagination meta={maintenances} />
          </div>
        </div>
      </div>

      {formOpen && <FormModal item={editingItem} assets={assets} onClose={() => setFormOpen(false)} />}
      {showItem && <ShowModal item={showItem} onClose={() => setShowItem(null)} />}

      {deleteId && (
        <ConfirmDeleteModal
          show={Boolean(deleteId)}
          onClose={() => setDeleteId(null)}
          onCancel={() => setDeleteId(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Maintenance Record"
          message="আপনি কি নিশ্চিত যে এই রেকর্ডটি মুছে ফেলতে চান?"
        />
      )}
    </AuthenticatedLayout>
  );
}