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

  function confirmDelete() {
    router.delete(route('admin.registry.destroy', deletingItem.id), {
      onSuccess: () => setDeletingItem(null),
    });
  }

  function clearAll() {
    Swal.fire({
      title: 'Are you sure?',
      text: "সব Log চিরতরে মুছে ফেলা হবে। এটি রিকভার করা সম্ভব নয়!",
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
      case 'critical': return 'bg-red-100 text-red-800 border-red-300 font-bold';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <AuthenticatedLayout>
      <Head title="System Registry & Diagnostics" />

      <div className="w-full space-y-8 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Settings & Registry</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">System Diagnostics & Logs</h1>
            <p className="text-sm text-slate-500 mt-1">সিস্টেমের স্বাস্থ্য পরীক্ষা করুন এবং কার্যকলাপের (Activity) লগ দেখুন।</p>
          </div>
          <button 
            onClick={clearAll}
            className="inline-flex items-center gap-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95 w-full sm:w-auto justify-center"
          >
            <Icon name="trash" className="w-4 h-4" /> Clear All Logs
          </button>
        </div>

        {/* Diagnostics Grid */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-base font-bold text-slate-800">System Health</h2>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Object.entries(diagnostics).map(([key, value]) => {
              const isFail = String(value).toLowerCase() === 'fail' || String(value).toLowerCase() === 'false';
              return (
                <div key={key} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center items-start transition-all hover:shadow-md">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{DIAG_LABELS[key] ?? key}</span>
                  <span className={`mt-1.5 text-sm font-bold ${isFail ? 'text-rose-600' : 'text-slate-800'}`}>
                    {String(value)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Logs Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-base font-bold text-slate-800">Activity Logs</h2>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          {/* Unified Modern Toolbar */}
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row items-center gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full">
              
              {/* Per Page */}
              <select
                value={perPage}
                onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}
                className="appearance-none bg-none pr-3 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer text-center"
                style={{ backgroundImage: 'none' }}
              >
                <option value="10">10 / Page</option>
                <option value="20">20 / Page</option>
                <option value="50">50 / Page</option>
                <option value="all">All</option>
              </select>

              <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

              {/* Level Filter */}
              <select 
                value={level} 
                onChange={(e) => { setLevel(e.target.value); applyFilters({ level: e.target.value }); }}
                className="w-full sm:w-40 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                <option value="">All Levels</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="critical">Critical</option>
              </select>

              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
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
          </div>

          {/* Main Table Card */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Level</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User & IP</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.data.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        কোনো Log পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    logs.data.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase border ${getLevelBadge(item.level)}`}>
                            {item.level}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 font-mono">
                            {item.action}
                          </code>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700 max-w-xs truncate" title={item.message}>
                          {item.message}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-800">{item.user?.name ?? 'System'}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{item.ip_address ?? 'No IP'}</div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                          {item.created_at}
                        </td>
                        <td className="px-6 py-4 text-right">
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

            <div className="border-t border-slate-100 bg-white px-6 py-4 rounded-b-2xl">
              <Pagination meta={logs} />
            </div>
          </div>
        </section>

      </div>

      {deletingItem && (
        <ConfirmDeleteModal
          item={deletingItem}
          onCancel={() => setDeletingItem(null)}
          onConfirm={confirmDelete}
        />
      )}
    </AuthenticatedLayout>
  );
}