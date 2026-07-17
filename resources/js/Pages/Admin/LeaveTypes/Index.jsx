import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import LeaveTypeFormModal from './Partials/LeaveTypeFormModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ leaveTypes, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [status, setStatus] = useState(filters.status ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

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
    router.get(route('admin.leave-types.index'), {
      search, status, per_page: perPage, ...overrides,
    }, { preserveState: true, replace: true });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">HR & Admin</span>
            <h1>Leave Types</h1>
            <p className="desc">স্টাফদের বাৎসরিক ছুটির ধরন ও সংখ্যা নির্ধারণ করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Add Leave Type
            </button>
          </div>
        </div>
      }
    >
      <Head title="Leave Types" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select value={perPage} onChange={(e) => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}>
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
            <option value="all">Show All</option>
          </select>
          <div className="search">
            <Icon name="search" />
            <input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>

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
                <th>Leave Type Name</th>
                <th>Days Allowed / Year</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveTypes.data.length === 0 && (
                <tr><td colSpan={4} className="mm-empty">কোনো ছুটির ধরন পাওয়া যায়নি।</td></tr>
              )}
              {leaveTypes.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="mm-label-cell">
                      <Icon name="folder" className="mm-row-icon" />
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td><strong>{item.days_allowed}</strong> Days</td>
                  <td>
                    <span className={`mm-status ${item.is_active ? 'is-active' : 'is-inactive'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" title="Edit" onClick={() => { setEditingItem(item); setFormOpen(true); }}>
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

        <Pagination meta={leaveTypes} />
      </div>

      {formOpen && (
        <LeaveTypeFormModal
          item={editingItem}
          onClose={() => setFormOpen(false)}
        />
      )}

      {deletingItem && (
        <ConfirmDeleteModal
          item={deletingItem}
          onCancel={() => setDeletingItem(null)}
          onConfirm={() => {
            router.delete(route('admin.leave-types.destroy', deletingItem.id), {
              onSuccess: () => setDeletingItem(null),
            });
          }}
        />
      )}
    </AuthenticatedLayout>
  );
}
