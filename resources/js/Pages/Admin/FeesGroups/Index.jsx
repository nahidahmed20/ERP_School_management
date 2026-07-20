import { useState, useEffect } from 'react';
import { Head, router, usePage,Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';
import GroupFormModal from './Partials/GroupFormModal';

export default function Index({ feeGroups, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
    }
    if (flash?.error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000 });
    }
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.fees-groups.index'), {
      search, per_page: perPage, ...overrides,
    }, { preserveState: true, replace: true });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Finance & Accounts</span>
            <h1>Fee Groups</h1>
            <p className="desc">শিক্ষার্থীদের বিভিন্ন ফি এর ক্যাটাগরি এবং গ্রুপ পরিচালনা করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Create Group
            </button>
          </div>
        </div>
      }
    >
      <Head title="Fee Groups" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search">
            <Icon name="search" />
            <input
              placeholder="Search by group name..."
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
                <th>Group Name</th>
                <th>Description</th>
                <th style={{ textAlign: 'center' }}>Fee Types</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feeGroups.data.length === 0 && (
                <tr><td colSpan={5} className="mm-empty">কোনো Fee Group পাওয়া যায়নি।</td></tr>
              )}
              {feeGroups.data.map((group) => (
                <tr key={group.id}>
                  <td>
                    <span style={{ fontWeight: 600 }}>{group.name}</span>
                  </td>
                  <td>{group.description || '—'}</td>

                  {/* Fee Types Count & Manage Button */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <span style={{ background: '#e0e7ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                        {group.fee_types?.length || 0} Items
                      </span>
                      <Link
                        href={route('admin.fees-types.index', group.id)}
                        style={{ fontSize: '13px', color: '#0ea5e9', fontWeight: '600', textDecoration: 'none', background: '#f0f9ff', padding: '4px 10px', borderRadius: '6px' }}
                        title="Add or edit fee items for this group"
                        >
                        Manage Types <Icon name="arrow-right" style={{ fontSize: '12px', marginLeft: '2px' }} />
                        </Link>
                    </div>
                  </td>

                  <td>
                    <span className={`mm-status ${group.is_active ? 'is-active' : 'is-inactive'}`}>
                      {group.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" title="Edit" onClick={() => { setEditingItem(group); setFormOpen(true); }}>
                        <Icon name="edit" />
                      </button>
                      <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => setDeletingItem(group)}>
                        <Icon name="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination meta={feeGroups} />
      </div>

      {/* Partials: Form Modal */}
      {formOpen && (
        <GroupFormModal
          item={editingItem}
          onClose={() => setFormOpen(false)}
        />
      )}

      {/* Confirm Delete Modal */}
      {deletingItem && (
        <ConfirmDeleteModal
          item={deletingItem}
          onCancel={() => setDeletingItem(null)}
          onConfirm={() => {
            router.delete(route('admin.fees-groups.destroy', deletingItem.id), {
              onSuccess: () => setDeletingItem(null),
            });
          }}
        />
      )}
    </AuthenticatedLayout>
  );
}
