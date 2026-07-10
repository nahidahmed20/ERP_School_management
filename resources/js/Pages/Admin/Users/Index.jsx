import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import UserFormModal from './Partials/UserFormModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';

export default function UserIndex({ users, roles, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  function applyFilters() {
    router.get(route('admin.users.index'), { search }, { preserveState: true, replace: true });
  }

  function openCreate() {
    setEditingItem(null);
    setFormOpen(true);
  }

  function openEdit(user) {
    // Super Admin ইউজারকে প্রোটেক্ট করা হচ্ছে
    if (user.roles.some(r => r.name === 'Super Admin')) return;
    setEditingItem(user);
    setFormOpen(true);
  }

  function confirmDelete() {
    router.delete(route('admin.users.destroy', deletingItem.id), {
      onSuccess: () => setDeletingItem(null),
    });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Settings &amp; Registry</span>
            <h1>User Accounts</h1>
            <p className="desc">সিস্টেমের ইউজার এবং তাদের রোল এখান থেকে নিয়ন্ত্রণ করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={openCreate}>
              <Icon name="plus" /> Add User
            </button>
          </div>
        </div>
      }
    >
      <Head title="User Accounts" />

      {flash?.success && <div className="mm-toast success">{flash.success}</div>}
      {flash?.error && <div className="mm-toast error">{flash.error}</div>}

      <div className="card mm-card">
        <div className="mm-filters">
          <div className="search">
            <Icon name="search" />
            <input
              placeholder="Search by name or email..."
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
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.data.length === 0 && (
                <tr><td colSpan={4} className="mm-empty">কোনো ইউজার পাওয়া যায়নি।</td></tr>
              )}
              {users.data.map((user) => {
                const isSuperAdmin = user.roles.some(r => r.name === 'Super Admin');
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="mm-label-cell">
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {user.roles.length > 0 ? user.roles.map(role => (
                          <span key={role.id} className={`mm-tag ${role.name === 'Super Admin' ? 'mm-tag-parent' : ''}`}>
                            {role.name}
                          </span>
                        )) : <span className="text-gray-400 text-sm">No Role</span>}
                      </div>
                    </td>
                    <td>
                      <div className="mm-row-actions">
                        {!isSuperAdmin ? (
                          <>
                            <button className="icon-btn" title="Edit" onClick={() => openEdit(user)}>
                              <Icon name="edit" />
                            </button>
                            <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => setDeletingItem(user)}>
                              <Icon name="trash" />
                            </button>
                          </>
                        ) : (
                          <span className="mm-tag">Protected</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Pagination meta={users} />
      </div>

      {formOpen && (
        <UserFormModal
          item={editingItem}
          roles={roles}
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
