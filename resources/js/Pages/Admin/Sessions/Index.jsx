import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import SessionFormModal from './Partials/SessionFormModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Pagination from '@/Components/Pagination';
import Swal from 'sweetalert2'; 

export default function Index({ sessions, campuses, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [campusId, setCampusId] = useState(filters.campus_id ?? '');
  const [status, setStatus] = useState(filters.status ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  // --- SweetAlert2 Toast Message ---
  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    }
    if (flash?.error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
    }
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.sessions'), {
      search, campus_id: campusId, status, per_page: perPage, ...overrides,
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
    router.delete(route('admin.sessions.destroy', deletingItem.id), {
      onSuccess: () => setDeletingItem(null),
    });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Settings &amp; Registry</span>
            <h1>Academic Sessions</h1>
            <p className="desc">শিক্ষাবর্ষ / সেশন তৈরি ও ব্যবস্থাপনা করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={openCreate}>
              <Icon name="plus" /> Add Session
            </button>
          </div>
        </div>
      }
    >
      <Head title="Academic Sessions" />

      {}
      <div className="card mm-card">
        <div className="mm-filters">
          <select value={perPage} onChange={(e) => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}>
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
            <option value="50">50 / page</option>
            <option value="all">Show All</option>
          </select>
          <div className="search">
            <Icon name="search" />
            <input
              placeholder="Search by session name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>

          <select value={campusId} onChange={(e) => { setCampusId(e.target.value); applyFilters({ campus_id: e.target.value }); }}>
            <option value="">All Campuses</option>
            {campuses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                <th>Name</th>
                <th>Campus</th>
                <th>Start</th>
                <th>End</th>
                <th>Current?</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.data.length === 0 && (
                <tr><td colSpan={7} className="mm-empty">কোনো Academic Session পাওয়া যায়নি।</td></tr>
              )}
              {sessions.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="mm-label-cell">
                      <Icon name="calendar" className="mm-row-icon" />
                      <span>{item.name}</span>
                      {item.is_current && <span className="mm-tag mm-tag-parent">Current</span>}
                    </div>
                  </td>
                  <td>{item.campus?.name ?? 'All Campuses'}</td>
                  <td>{item.start_date}</td>
                  <td>{item.end_date}</td>
                  <td>{item.is_current ? 'Yes' : 'No'}</td>
                  <td>
                    <span className={`mm-status ${item.is_active ? 'is-active' : 'is-inactive'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="mm-row-actions">
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

        <Pagination meta={sessions} />
      </div>

      {}
      {formOpen && (
        <SessionFormModal item={editingItem} campuses={campuses} onClose={() => setFormOpen(false)} />
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