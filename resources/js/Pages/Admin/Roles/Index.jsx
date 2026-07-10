import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import RoleFormModal from './Partials/RoleFormModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';

export default function RoleIndex({ roles, permissions, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  function applyFilters() {
    router.get(route('admin.roles.index'), { search }, { preserveState: true, replace: true });
  }

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

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Settings &amp; Registry</span>
            <h1>Role Management</h1>
            <p className="desc">সিস্টেমের রোল এবং তাদের পারমিশন এখান থেকে নিয়ন্ত্রণ করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={openCreate}>
              <Icon name="plus" /> Add Role
            </button>
          </div>
        </div>
      }
    >
      <Head title="Role Management" />

      {flash?.success && <div className="mm-toast success">{flash.success}</div>}
      {flash?.error && <div className="mm-toast error">{flash.error}</div>}

      <div className="card mm-card">
        <div className="mm-filters">
          <div className="search">
            <Icon name="search" />
            <input
              placeholder="Search roles..."
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
                <th>Role Name</th>
                <th>Permissions Count</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.data.length === 0 && (
                <tr><td colSpan={3} className="mm-empty">কোনো Role পাওয়া যায়নি।</td></tr>
              )}
              {roles.data.map((role) => (
                <tr key={role.id}>
                  <td>
                    <div className="mm-label-cell">
                      <span>{role.name}</span>
                      {role.name === 'Super Admin' && <span className="mm-tag mm-tag-parent">System</span>}
                    </div>
                  </td>
                  <td>
                    {role.name === 'Super Admin'
                      ? 'All Permissions'
                      : `${role.permissions.length} Permissions`}
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      {role.name !== 'Super Admin' ? (
                        <>
                          <button className="icon-btn" title="Edit" onClick={() => openEdit(role)}>
                            <Icon name="edit" />
                          </button>
                          <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => setDeletingItem(role)}>
                            <Icon name="trash" />
                          </button>
                        </>
                      ) : (
                        <span className="mm-tag">Protected</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination meta={roles} />
      </div>

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
