import { useState, useEffect } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';
import TypeFormModal from './Partials/TypeFormModal';

export default function Index({ feeGroup, feeTypes, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000 });
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.fees-types.index', feeGroup.id), {
      search, per_page: perPage, ...overrides,
    }, { preserveState: true, replace: true });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="eyebrow">Group Items</span>
            <h1>{feeGroup.name} - Fee Items</h1>
            <p className="desc">এই গ্রুপের আওতাভুক্ত সকল ফি আইটেম এবং টাকার পরিমাণ পরিচালনা করুন।</p>
          </div>
          <div className="mm-head-actions" style={{ display: 'flex', gap: '10px' }}>
            <Link href={route('admin.fees-groups.index')} className="btn btn-outline">
              <Icon name="arrow-left" /> Back to Groups
            </Link>
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Add Item
            </button>
          </div>
        </div>
      }
    >
      <Head title={`${feeGroup.name} - Fee Types`} />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search">
            <Icon name="search" />
            <input
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>

          <select value={perPage} onChange={(e) => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}>
            <option value="10">10 / Page</option>
            <option value="20">20 / Page</option>
            <option value="50">50 / Page</option>
          </select>

          <button className="btn btn-outline" onClick={() => applyFilters()}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Amount (TK)</th>
                <th>Description</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feeTypes.data.length === 0 && (
                <tr><td colSpan={5} className="mm-empty">এই গ্রুপে কোনো আইটেম যোগ করা হয়নি।</td></tr>
              )}
              {feeTypes.data.map((type) => (
                <tr key={type.id}>
                  <td><span style={{ fontWeight: 600, color: '#0f172a' }}>{type.name}</span></td>
                  <td>
                    <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                      ৳ {parseFloat(type.amount).toFixed(2)}
                    </span>
                  </td>
                  <td style={{ color: '#64748b' }}>{type.description || '—'}</td>
                  <td>
                    <span className={`mm-status ${type.is_active ? 'is-active' : 'is-inactive'}`}>
                      {type.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" title="Edit" onClick={() => { setEditingItem(type); setFormOpen(true); }}>
                        <Icon name="edit" />
                      </button>
                      <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => setDeletingItem(type)}>
                        <Icon name="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination meta={feeTypes} />
      </div>

      {formOpen && (
        <TypeFormModal
          item={editingItem}
          feeGroup={feeGroup}
          onClose={() => setFormOpen(false)}
        />
      )}

      {deletingItem && (
        <ConfirmDeleteModal
          item={deletingItem}
          onCancel={() => setDeletingItem(null)}
          onConfirm={() => {
            router.delete(route('admin.fees-types.destroy', deletingItem.id), {
              onSuccess: () => setDeletingItem(null),
            });
          }}
        />
      )}
    </AuthenticatedLayout>
  );
}
