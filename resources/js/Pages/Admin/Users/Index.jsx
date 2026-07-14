import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import UserFormModal from './Partials/UserFormModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function UserIndex({ users, roles, campuses, filters }) {
  const { flash, auth } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10'); // Pagination State
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
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
    router.get(route('admin.users.index'), { search, per_page: perPage, ...overrides }, { preserveState: true, replace: true });
  }

  function openCreate() {
    setEditingItem(null);
    setFormOpen(true);
  }

  function openEdit(user) {
    if (user.roles.some(r => r.name === 'Super Admin')) return;
    setEditingItem(user);
    setFormOpen(true);
  }

  function confirmDelete() {
    router.delete(route('admin.users.destroy', deletingItem.id), {
      onSuccess: () => setDeletingItem(null),
    });
  }

  // --- Export Functions ---
  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Email,Roles\n"
      + users.data.map(u => `${u.name},${u.email},"${u.roles.map(r=>r.name).join(', ')}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users_export.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleCopy = () => {
    const text = users.data.map(u => `${u.name} \t ${u.email} \t ${u.roles.map(r=>r.name).join(', ')}`).join("\n");
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

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

      <div className="card mm-card">
        {/* --- Toolbar: Pagination, Search & Export Buttons --- */}
        <div className="mm-filters" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select value={perPage} onChange={(e) => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}>
              <option value="10">10 / page</option>
              <option value="50">50 / page</option>
              <option value="100">100 / page</option>
              <option value="500">500 / page</option>
              <option value="1000">1000 / page</option>
              <option value="all">All</option>
            </select>

            <div className="search">
              <Icon name="search" />
              <input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>
            <button className="btn btn-outline" onClick={() => applyFilters()}>Filter</button>
          </div>

          {/* Export Buttons */}
          <div className="export-buttons" style={{ display: 'flex', gap: '5px' }}>
            <button className="btn btn-outline btn-sm" onClick={handleCopy} title="Copy">Copy</button>
            <button className="btn btn-outline btn-sm" onClick={handleExportCSV} title="CSV">CSV</button>
            <button className="btn btn-outline btn-sm" onClick={() => alert('Backend Excel plugin needed')} title="Excel">Excel</button>
            <button className="btn btn-outline btn-sm" onClick={() => alert('Backend PDF plugin needed')} title="PDF">PDF</button>
          </div>

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
          campuses={campuses}
          activeCampusId={auth.active_campus_id}
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