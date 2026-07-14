import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import MenuItemFormModal from './Partials/MenuItemFormModal';
import ViewModal from './Partials/ViewModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Pagination from '@/Components/Pagination';
import Swal from 'sweetalert2'; 

export default function Index({ items, groups, parents, filters }) {
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
      Swal.fire({
        toast: true, 
        position: 'top-end', 
        icon: 'success', 
        title: flash.success,
        showConfirmButton: false, 
        timer: 3000, 
        timerProgressBar: true,
      });
    }
    if (flash?.error) {
      Swal.fire({
        toast: true, 
        position: 'top-end', 
        icon: 'error', 
        title: flash.error,
        showConfirmButton: false, 
        timer: 4000, 
        timerProgressBar: true,
      });
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

  function confirmDelete() {
    router.delete(route('admin.menu.destroy', deletingItem.id), {
      onSuccess: () => setDeletingItem(null),
    });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Settings &amp; Registry</span>
            <h1>Menu Manager</h1>
            <p className="desc">Sidebar navigation-এর সব group, item ও submenu এখান থেকে নিয়ন্ত্রণ করুন।</p>
          </div>
          <div className="mm-head-actions">
            <a href={route('admin.menu.export.excel')} className="btn btn-ghost">
              <Icon name="excel" /> Excel
            </a>
            <a href={route('admin.menu.export.pdf')} className="btn btn-ghost">
              <Icon name="pdf" /> PDF
            </a>
            <button className="btn" onClick={openCreate}>
              <Icon name="plus" /> Add Menu Item
            </button>
          </div>
        </div>
      }
    >
      <Head title="Menu Manager" />

      <div className="card mm-card">
        <div className="mm-filters">
          <select value={perPage} onChange={(e) => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}>
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
            <option value="500">500 / page</option>
            <option value="1000">1000 / page</option>
            <option value="all">Show All</option>
          </select>
          <div className="search">
            <Icon name="search" />
            <input
              placeholder="Search by label, key, or route..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>

          <select value={groupId} onChange={(e) => { setGroupId(e.target.value); applyFilters({ group_id: e.target.value }); }}>
            <option value="">All Groups</option>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
          </select>

          <select value={type} onChange={(e) => { setType(e.target.value); applyFilters({ type: e.target.value }); }}>
            <option value="">All Types</option>
            <option value="parent">Parent Item</option>
            <option value="child">Submenu Item</option>
          </select>

          <select value={status} onChange={(e) => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <button className="btn btn-outline" onClick={() => applyFilters()}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Label</th>
                <th>Group</th>
                <th>Parent</th>
                <th>Key</th>
                <th>Route</th>
                <th>Order</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.data.length === 0 && (
                <tr><td colSpan={8} className="mm-empty">কোনো menu item পাওয়া যায়নি।</td></tr>
              )}
              {items.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="mm-label-cell">
                      {item.icon && <Icon name={item.icon} className="mm-row-icon" />}
                      <span>{item.label}</span>
                      {!item.parent_id && <span className="mm-tag mm-tag-parent">Parent</span>}
                    </div>
                  </td>
                  <td>{item.group}</td>
                  <td>{item.parent ?? '—'}</td>
                  <td><code>{item.key}</code></td>
                  <td>{item.route_name ?? '—'}</td>
                  <td>{item.order}</td>
                  <td>
                    <span className={`mm-status ${item.is_active ? 'is-active' : 'is-inactive'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" title="View" onClick={() => setViewingItem(item)}>
                        <Icon name="eye" />
                      </button>
                      <button className="icon-btn" title="Edit" onClick={() => openEdit(item)}>
                        <Icon name="edit" />
                      </button>
                      <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => setDeletingItem(item)}>
                        <Icon name="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination meta={items} />
      </div>

      {formOpen && (
        <MenuItemFormModal
          item={editingItem}
          groups={groups}
          parents={parents}
          onClose={() => setFormOpen(false)}
        />
      )}

      {viewingItem && (
        <ViewModal item={viewingItem} onClose={() => setViewingItem(null)} />
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