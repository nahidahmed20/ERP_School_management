import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import PermissionFormModal from './Partials/PermissionFormModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';

export default function PermissionIndex({ permissions, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  function applyFilters() {
    router.get(route('admin.permissions.index'), { search }, { preserveState: true, replace: true });
  }

  function openCreate() {
    setEditingItem(null);
    setFormOpen(true);
  }

  function openEdit(permission) {
    setEditingItem(permission);
    setFormOpen(true);
  }

  function confirmDelete() {
    router.delete(route('admin.permissions.destroy', deletingItem.id), {
      onSuccess: () => setDeletingItem(null),
    });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Settings &amp; Registry</span>
            <h1>Permissions</h1>
            <p className="desc">সিস্টেমের সমস্ত পারমিশন এখান থেকে তৈরি বা মডিফাই করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={openCreate}>
              <Icon name="plus" /> Add Permission
            </button>
          </div>
        </div>
      }
    >
      <Head title="Permissions" />

      {flash?.success && <div className="mm-toast success">{flash.success}</div>}

      <div className="card mm-card">
        <div className="mm-filters">
          <div className="search">
            <Icon name="search" />
            <input
              placeholder="Search permissions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>
          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {permissions.data.length === 0 && (
                <tr><td colSpan={3} className="mm-empty">কোনো পারমিশন পাওয়া যায়নি।</td></tr>
              )}
              {permissions.data.map((permission) => (
                <tr key={permission.id}>
                  <td>{permission.id}</td>
                  <td>
                    <div className="mm-label-cell">
                      <span>{permission.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" title="Edit" onClick={() => openEdit(permission)}>
                        <Icon name="edit" />
                      </button>
                      <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => setDeletingItem(permission)}>
                        <Icon name="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination meta={permissions} />
      </div>

      {formOpen && (
        <PermissionFormModal item={editingItem} onClose={() => setFormOpen(false)} />
      )}

      {deletingItem && (
        <ConfirmDeleteModal item={deletingItem} onCancel={() => setDeletingItem(null)} onConfirm={confirmDelete} />
      )}
    </AuthenticatedLayout>
  );
}
