import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import RoleFormModal from './Partials/RoleFormModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function RoleIndex({ roles, permissions, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  // SweetAlert for Toast Notifications
  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    }
    if (flash?.error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
    }
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(
      route('admin.roles.index'),
      { search, per_page: perPage, ...overrides },
      { preserveState: true, replace: true }
    );
  }

  useEffect(() => {
    if (perPage !== (filters.per_page ?? '10')) {
      applyFilters({ per_page: perPage });
    }
  }, [perPage]);

  function openCreate() {
    setEditingItem(null);
    setFormOpen(true);
  }

  function openEdit(role) {
    if (role.name === 'Super Admin') return;
    setEditingItem(role);
    setFormOpen(true);
  }

  function confirmDelete() {
    router.delete(route('admin.roles.destroy', deletingItem.id), {
      onSuccess: () => setDeletingItem(null),
    });
  }

  // --- Export Functions ---
  const handlePrint = () => window.print();

  const exportToCSV = () => {
    if (!roles.data.length) return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    const headers = ['Role Name', 'Permissions Count'];
    const rows = roles.data.map(role => [
      role.name || 'N/A', 
      role.name === 'Super Admin' ? 'All Permissions' : `${role.permissions.length} Permissions Allowed`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Role_Management_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!roles.data.length) return;
    let text = "Role Name\tPermissions\n";
    roles.data.forEach(role => {
      text += `${role.name}\t${role.name === 'Super Admin' ? 'All Permissions' : role.permissions.length + ' Permissions'}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Role Management" />

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

      <div className="print-title">Role Management Directory - {new Date().toLocaleDateString('en-GB')}</div>

      <div className="w-full space-y-4 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8 no-print">
        
        {/* Page Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Settings &amp; Registry</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Role Management</h1>
            <p className="text-sm text-slate-500 mt-1">সিস্টেমের রোল এবং তাদের পারমিশন এখান থেকে নিয়ন্ত্রণ করুন।</p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all active:scale-95 hover:bg-indigo-700 sm:w-auto sm:shrink-0"
          >
            <Icon name="plus" className="w-4 h-4" /> Add Role
          </button>
        </div>

        {/* Unified Modern Toolbar */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center xl:w-auto">
            
            {/* Per Page */}
            <select
              value={perPage}
              onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}
              className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-3 text-center font-mono text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 sm:w-auto"
              style={{ backgroundImage: 'none' }}
            >
              <option value="10">10 / Page</option>
              <option value="25">25 / Page</option>
              <option value="50">50 / Page</option>
              <option value="100">100 / Page</option>
              <option value="500">500 / Page</option>
              <option value="all">All</option>
            </select>

            <div className="hidden h-6 w-px bg-slate-200 sm:block"></div>

            {/* Search Input */}
            <div className="relative w-full min-w-0 sm:w-80 sm:flex-1 xl:flex-none">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search roles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Apply Button */}
            <button
              onClick={() => applyFilters()}
              className="w-full rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 sm:w-auto"
            >
              Search
            </button>
          </div>

          {/* Export Actions */}
          <div className="grid w-full grid-cols-2 gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-sm sm:flex sm:w-auto sm:items-center sm:justify-end sm:gap-1.5 xl:shrink-0">
            <button onClick={copyToClipboard} className="flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-white hover:text-indigo-600 hover:shadow-sm sm:w-auto" title="Copy to Clipboard">Copy</button>
            <div className="mx-0.5 hidden h-4 w-px bg-slate-200 sm:block"></div>
            <button onClick={exportToCSV} className="flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-white hover:text-emerald-600 hover:shadow-sm sm:w-auto" title="Export CSV">CSV</button>
            <div className="mx-0.5 hidden h-4 w-px bg-slate-200 sm:block"></div>
            <button onClick={() => alert('Backend Excel plugin needed')} className="flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-white hover:text-green-600 hover:shadow-sm sm:w-auto" title="Export Excel">Excel</button>
            <div className="mx-0.5 hidden h-4 w-px bg-slate-200 sm:block"></div>
            <button onClick={() => alert('Backend PDF plugin needed')} className="flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-white hover:text-rose-600 hover:shadow-sm sm:w-auto" title="Export PDF">PDF</button>
            <div className="mx-0.5 hidden h-4 w-px bg-slate-200 sm:block"></div>
            <button onClick={handlePrint} className="flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-white hover:text-amber-600 hover:shadow-sm sm:w-auto" title="Print List">Print</button>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 print-table-wrapper">
          <div className="hidden overflow-x-auto md:block print:block">
            <table className="min-w-[720px] w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">SL</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Permissions Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roles.data.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-100">
                        <Icon name="shield" className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">কোনো Role পাওয়া যায়নি।</p>
                      <p className="text-xs text-slate-400 mt-1">Start by creating a new Role.</p>
                    </td>
                  </tr>
                ) : (
                  roles.data.map((role, index) => (
                    <tr key={role.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-500 font-mono">
                        {(roles.from ?? 1) + index}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border shadow-sm ${role.name === 'Super Admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                            <Icon name="shield" className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-900 block">{role.name}</span>
                            {role.name === 'Super Admin' && (
                              <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold mt-0.5 tracking-wide uppercase bg-indigo-100 text-indigo-700">
                                System Protected
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {role.name === 'Super Admin' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                            <Icon name="check-circle" className="w-3.5 h-3.5" /> All Permissions
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase bg-slate-50 text-slate-700 border border-slate-200 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span> {role.permissions.length} Permissions Allowed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right no-print">
                        <div className="flex items-center justify-end gap-1.5">
                          {role.name !== 'Super Admin' ? (
                            <>
                              <button
                                onClick={() => openEdit(role)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Edit Role"
                              >
                                <Icon name="edit" className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeletingItem(role)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete Role"
                              >
                                <Icon name="trash" className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 cursor-not-allowed italic">
                              Locked
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Cards keep every role action usable without horizontal scrolling on phones. */}
          <div className="divide-y divide-slate-100 md:hidden print:hidden">
            {roles.data.length === 0 ? (
              <div className="px-4 py-12 text-center text-slate-500">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-slate-100 bg-slate-50">
                  <Icon name="shield" className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-600">কোনো Role পাওয়া যায়নি।</p>
                <p className="mt-1 text-xs text-slate-400">Start by creating a new Role.</p>
              </div>
            ) : (
              roles.data.map((role, index) => (
                <article key={role.id} className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border shadow-sm ${role.name === 'Super Admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        <Icon name="shield" className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="block break-words text-sm font-bold text-slate-900">{role.name}</span>
                        {role.name === 'Super Admin' ? (
                          <span className="mt-1 inline-flex rounded bg-indigo-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-indigo-700">
                            System Protected
                          </span>
                        ) : (
                          <span className="mt-1 block text-xs font-medium text-slate-400">Role #{(roles.from ?? 1) + index}</span>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-slate-400">#{(roles.from ?? 1) + index}</span>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4">
                    <div>
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Permissions</p>
                      {role.name === 'Super Admin' ? (
                        <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-emerald-700">
                          <Icon name="check-circle" className="h-3.5 w-3.5 shrink-0" />
                          <span className="break-words">All Permissions</span>
                        </span>
                      ) : (
                        <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-700">
                          <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-500"></span>
                          <span className="break-words">{role.permissions.length} Permissions Allowed</span>
                        </span>
                      )}
                    </div>

                    {role.name !== 'Super Admin' ? (
                      <div className="flex w-full items-center gap-2">
                        <button
                          onClick={() => openEdit(role)}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
                        >
                          <Icon name="edit" className="h-4 w-4" /> Edit
                        </button>
                        <button
                          onClick={() => setDeletingItem(role)}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                        >
                          <Icon name="trash" className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    ) : (
                      <span className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold italic text-slate-400">
                        Locked
                      </span>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="no-print rounded-b-2xl border-t border-slate-100 bg-white px-4 py-4 sm:px-6">
            <div className="overflow-x-auto pb-1 sm:overflow-visible sm:pb-0">
              <Pagination meta={roles} />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {formOpen && (
        <RoleFormModal
          item={editingItem}
          permissions={permissions}
          onClose={() => setFormOpen(false)}
        />
      )}

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
