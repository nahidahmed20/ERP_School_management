import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import CampusFormModal from './Partials/CampusFormModal';
import CampusViewModal from './Partials/CampusViewModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Pagination from '@/Components/Pagination';
import Swal from 'sweetalert2';

export default function Index({ campuses, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [status, setStatus] = useState(filters.status ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({
        toast: true, position: 'top-end', icon: 'success', title: flash.success,
        showConfirmButton: false, timer: 3000, timerProgressBar: true,
      });
    }
    if (flash?.error) {
      Swal.fire({
        toast: true, position: 'top-end', icon: 'error', title: flash.error,
        showConfirmButton: false, timer: 4000, timerProgressBar: true,
      });
    }
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.campuses.index'), {
      search, status, per_page: perPage, ...overrides,
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
    router.delete(route('admin.campuses.destroy', deletingItem.id), {
      onSuccess: () => setDeletingItem(null),
    });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Settings &amp; Registry</span>
            <h1>School &amp; Branches</h1>
            <p className="desc">প্রতিষ্ঠানের সকল Campus/Branch এখান থেকে নিয়ন্ত্রণ করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={openCreate}>
              <Icon name="plus" /> Add Campus
            </button>
          </div>
        </div>
      }
    >
      <Head title="School & Branches" />

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
              placeholder="Search by name, code, or email..."
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
                <th>Name</th>
                <th>Code</th>
                <th>Phone</th>
                <th>Established</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campuses.data.length === 0 && (
                <tr><td colSpan={6} className="mm-empty">কোনো Campus পাওয়া যায়নি।</td></tr>
              )}
              {campuses.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="mm-label-cell">
                      <Icon name="building" className="mm-row-icon" />
                      <span>{item.name}</span>
                      {item.is_main && <span className="mm-tag mm-tag-parent">Main</span>}
                    </div>
                  </td>
                  <td><code>{item.code}</code></td>
                  <td>{item.phone ?? '—'}</td>
                  <td>{item.established_year ?? '—'}</td>
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

        <Pagination meta={campuses} />
      </div>

      {/* Modals */}
      {formOpen && (
        <CampusFormModal item={editingItem} onClose={() => setFormOpen(false)} />
      )}

      {viewingItem && (
        <CampusViewModal item={viewingItem} onClose={() => setViewingItem(null)} />
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
