import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import AssetFormModal from './Partials/AssetFormModal';
import AssetShowModal from './Partials/AssetShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ assets, users, campuses, filters }) {
  const { flash, auth } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [status, setStatus] = useState(filters.status ?? '');
  const [category, setCategory] = useState(filters.category ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    }
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.purchase.assets.index'), {
      search, status, category, per_page: perPage, ...overrides,
    }, { preserveState: true, replace: true });
  }

  const getStatusColor = (status) => {
    switch(status) {
        case 'Available': return { bg: '#dcfce7', text: '#15803d' }; // Green
        case 'Assigned': return { bg: '#e0f2fe', text: '#0369a1' }; // Blue
        case 'Maintenance': return { bg: '#fef3c7', text: '#d97706' }; // Yellow
        case 'Damaged':
        case 'Lost': return { bg: '#fee2e2', text: '#b91c1c' }; // Red
        default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Purchase & Assets</span>
            <h1>Asset Management</h1>
            <p className="desc">স্কুলের সকল সম্পদ ট্র্যাক এবং পরিচালনা করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Register Asset
            </button>
          </div>
        </div>
      }
    >
      <Head title="Asset Management" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select value={perPage} onChange={(e) => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}>
            <option value="10">10 / page</option>
            <option value="50">50 / page</option>
            <option value="all">Show All</option>
          </select>

          <div className="search">
            <Icon name="search" />
            <input placeholder="Search asset name, tag or location..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>

          <select value={category} onChange={(e) => { setCategory(e.target.value); applyFilters({ category: e.target.value }); }}>
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Vehicles">Vehicles</option>
            <option value="Others">Others</option>
          </select>

          <select value={status} onChange={(e) => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}>
            <option value="">All Status</option>
            <option value="Available">Available</option>
            <option value="Assigned">Assigned</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Damaged">Damaged</option>
            <option value="Lost">Lost</option>
          </select>

          <button className="btn btn-outline" onClick={() => applyFilters()}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Asset Details</th>
                <th>Assigned To</th>
                <th>Location</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.data.length === 0 && (
                <tr><td colSpan={5} className="mm-empty">কোনো অ্যাসেট রেকর্ড পাওয়া যায়নি।</td></tr>
              )}
              {assets.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="mm-label-cell">
                      <Icon name="monitor" className="mm-row-icon" />
                      <div>
                        <div style={{ fontWeight: 500, color: '#111827' }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Tag: {item.asset_tag} | {item.category}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {item.assignee ? (
                      <div>
                        <div style={{ fontWeight: 500 }}>{item.assignee.name}</div>
                      </div>
                    ) : (
                      <span style={{ color: '#9CA3AF' }}>Not Assigned</span>
                    )}
                  </td>
                  <td>{item.location || '-'}</td>
                  <td>
                    <span style={{
                        backgroundColor: getStatusColor(item.status).bg,
                        color: getStatusColor(item.status).text,
                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" title="View" onClick={() => setViewingItem(item)}>
                        <Icon name="eye" />
                      </button>
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
        <Pagination meta={assets} />
      </div>

      {formOpen && <AssetFormModal item={editingItem} users={users} campuses={campuses} activeCampusId={auth?.active_campus_id} onClose={() => setFormOpen(false)} />}

      {viewingItem && <AssetShowModal item={viewingItem} onClose={() => setViewingItem(null)} />}

      {deletingItem && (
        <ConfirmDeleteModal item={{ name: `Asset: ${deletingItem.name}` }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.purchase.assets.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}
