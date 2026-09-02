import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import MenuItemFormModal from './Partials/MenuItemFormModal';
import ViewModal from './Partials/ViewModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Pagination from '@/Components/Pagination';
import Swal from 'sweetalert2'; 

export default function Index({ items, groups, parents, permissions, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [groupId, setGroupId] = useState(filters.group_id ?? '');
  const [type, setType] = useState(filters.type ?? '');
  const [status, setStatus] = useState(filters.status ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
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
    router.get(route('admin.menu.index'), {
      search, group_id: groupId, type, status, per_page: perPage, ...overrides,
    }, { preserveState: true, replace: true });
  }

  function openCreate() {
    setEditingItem(null);
    setFormOpen(true);
  }

  function openEdit(item) {
    setEditingItem(item);
    setFormOpen(true);
  }

  function toggleItem(item) {
    router.put(route('admin.menu.update', item.id), {
      menu_group_id: item.menu_group_id,
      parent_id: item.parent_id,
      key: item.key,
      label: item.label,
      icon: item.icon,
      route_name: item.route_name,
      badge_count: item.badge_count,
      permission: item.permission,
      order: item.order,
      is_active: !item.is_active,
    }, { preserveScroll: true });
  }

  function confirmDelete() {
    router.delete(route('admin.menu.destroy', deletingItem.id), {
      onSuccess: () => setDeletingItem(null),
    });
  }

<<<<<<< HEAD
  // --- Export Functions ---
  const handlePrint = () => window.print();

  const exportToCSV = () => {
    if (!items.data.length) return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    const headers = ['Label', 'Group', 'Parent', 'Key', 'Route', 'Order', 'Status'];
    const rows = items.data.map(item => [
      item.label || 'N/A', 
      item.group || 'N/A', 
      item.parent || 'Top Level', 
      item.key || 'N/A', 
      item.route_name || 'N/A', 
      item.order, 
      item.is_active ? 'Active' : 'Inactive'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Menu_Items_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!items.data.length) return;
    let text = "Label\tGroup\tParent\tKey\tRoute\tStatus\n";
    items.data.forEach(item => {
      text += `${item.label}\t${item.group}\t${item.parent || 'Top Level'}\t${item.key}\t${item.route_name || '-'}\t${item.is_active ? 'Active' : 'Inactive'}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };
=======
  async function addGroup() {
    const result = await Swal.fire({
      title: 'Add menu group',
      input: 'text',
      inputLabel: 'Group label',
      inputPlaceholder: 'e.g. Academics',
      showCancelButton: true,
      inputValidator: (value) => !value.trim() ? 'A group label is required.' : undefined,
    });

    if (result.isConfirmed) {
      router.post(route('admin.menu-groups.store'), { label: result.value.trim(), order: groups.length, is_active: true });
    }
  }

  function toggleGroup(group) {
    router.put(route('admin.menu-groups.update', group.id), {
      label: group.label,
      order: group.order,
      is_active: !group.is_active,
    }, { preserveScroll: true });
  }

  async function editGroup(group) {
    const result = await Swal.fire({
      title: 'Edit menu group',
      html: `<input id="group-label" class="swal2-input" value="${group.label.replaceAll('&', '&amp;').replaceAll('"', '&quot;')}"><input id="group-order" type="number" min="0" class="swal2-input" value="${group.order}">`,
      showCancelButton: true,
      preConfirm: () => ({
        label: document.getElementById('group-label').value.trim(),
        order: Number(document.getElementById('group-order').value),
      }),
    });

    if (result.isConfirmed && result.value.label) {
      router.put(route('admin.menu-groups.update', group.id), { ...result.value, is_active: group.is_active });
    }
  }
>>>>>>> a1e1e67 (change many)

  return (
    <AuthenticatedLayout>
      <Head title="Menu Manager" />

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

      <div className="print-title">System Menu Directory - {new Date().toLocaleDateString('en-GB')}</div>

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8 no-print">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Settings &amp; Registry</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Menu Manager</h1>
            <p className="text-sm text-slate-500 mt-1">Sidebar navigation-এর সব group, item ও submenu এখান থেকে নিয়ন্ত্রণ করুন।</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              onClick={openCreate}
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/20 active:scale-95"
            >
              <Icon name="plus" className="w-4 h-4" /> Add Menu Item
            </button>
            <button onClick={addGroup} className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all">
              <Icon name="plus" className="w-4 h-4" /> Add Group
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between gap-4 mb-3">
            <h2 className="text-sm font-bold text-slate-900">Menu Groups</h2>
            <span className="text-xs text-slate-500">Hide a group without deleting its items</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {groups.map((group) => (
              <div key={group.id} className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 ${group.is_active ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-100 opacity-70'}`}>
                <span className="text-sm font-semibold text-slate-700">{group.label}</span>
                <button type="button" onClick={() => toggleGroup(group)} className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600"><Icon name={group.is_active ? 'toggle-on' : 'toggle-off'} className="h-5 w-5" />{group.is_active ? 'Hide' : 'Show'}</button>
                <button type="button" onClick={() => editGroup(group)} className="text-xs font-bold text-amber-600">Edit</button>
              </div>
            ))}
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
              <option value="100">100 / Page</option>
              <option value="all">All</option>
            </select>

            <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

            {/* Filters */}
            <select value={groupId} onChange={(e) => { setGroupId(e.target.value); applyFilters({ group_id: e.target.value }); }} className="w-full sm:w-36 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer">
              <option value="">All Groups</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
            </select>

            <select value={type} onChange={(e) => { setType(e.target.value); applyFilters({ type: e.target.value }); }} className="w-full sm:w-36 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer">
              <option value="">All Types</option>
              <option value="parent">Parent Item</option>
              <option value="child">Submenu Item</option>
            </select>

            <select value={status} onChange={(e) => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }} className="w-full sm:w-32 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search label, key..."
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
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Label</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Group</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Parent</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Key &amp; Route</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Order</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-100">
                        <Icon name="list" className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">কোনো menu item পাওয়া যায়নি।</p>
                      <p className="text-xs text-slate-400 mt-1">Try adding a new navigation link.</p>
                    </td>
                  </tr>
                ) : (
                  items.data.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            item.parent_id ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600 shadow-sm'
                          }`}>
                            {item.icon ? <Icon name={item.icon} className="w-5 h-5" /> : <div className="w-3 h-3 rounded-full bg-slate-200"></div>}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900 block">{item.label}</span>
                              {item.badge_count && (
                                <span className="inline-flex items-center justify-center px-1.5 min-w-[20px] h-5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-black">
                                  {item.badge_count}
                                </span>
                              )}
                            </div>
                            {!item.parent_id && <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide block mt-0.5">Parent Item</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600 capitalize">{item.group}</td>
                      <td className="px-6 py-4">
                        {item.parent ? (
                          <span className="text-sm font-semibold text-slate-700">{item.parent}</span>
                        ) : (
                          <span className="text-xs font-medium text-slate-400 italic">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          <code className="text-xs font-bold font-mono tracking-tight bg-slate-100 text-indigo-600 px-2 py-0.5 rounded border border-slate-200">{item.key}</code>
                          {item.route_name ? (
                            <span className="text-[11px] font-medium text-slate-500 truncate max-w-[150px]" title={item.route_name}>{item.route_name}</span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No Route</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">{item.order}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border ${item.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right no-print">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => setViewingItem(item)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Details">
                            <Icon name="eye" className="w-4 h-4" />
                          </button>
                          <button onClick={() => openEdit(item)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit Menu">
                            <Icon name="edit" className="w-4 h-4" />
                          </button>
                          <button onClick={() => toggleItem(item)} className={`p-2 rounded-lg transition-colors ${item.is_active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`} title={item.is_active ? 'Hide Menu' : 'Show Menu'}>
                            <Icon name={item.is_active ? 'toggle-on' : 'toggle-off'} className="w-5 h-5" />
                          </button>
                          <button onClick={() => setDeletingItem(item)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Menu">
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
            <Pagination meta={items} />
          </div>
        </div>
      </div>

      {/* Modals */}
      {formOpen && (
        <MenuItemFormModal
          item={editingItem}
          groups={groups}
          parents={parents}
          permissions={permissions}
          onClose={() => setFormOpen(false)}
        />
      )}

      {viewingItem && (
        <ViewModal item={viewingItem} onClose={() => setViewingItem(null)} />
      )}

      {deletingItem && (
        <ConfirmDeleteModal
          item={{ name: deletingItem.label }}
          message="Are you sure you want to delete this menu item? If it's a parent, children might lose connection."
          onCancel={() => setDeletingItem(null)}
          onConfirm={confirmDelete}
        />
      )}
    </AuthenticatedLayout>
  );
}
