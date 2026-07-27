import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import VehicleFormModal from './Partials/VehicleFormModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import VehicleShowModal from './Partials/VehicleShowModal';
import Swal from 'sweetalert2';

export default function Index({ vehicles, campuses, filters }) {
  const { flash, auth } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [status, setStatus] = useState(filters.status ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    }
    if (flash?.error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
    }
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.transport.vehicles.index'), {
      search, status, per_page: perPage, ...overrides,
    }, { preserveState: true, replace: true });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Campus Life</span>
            <h1>Vehicles & Routes</h1>
            <p className="desc">স্কুলের পরিবহন, ড্রাইভার এবং রুটের তথ্য পরিচালনা করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Add Vehicle
            </button>
          </div>
        </div>
      }
    >
      <Head title="Vehicles & Routes" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select value={perPage} onChange={(e) => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}>
            <option value="10">10 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
            <option value="all">Show All</option>
          </select>
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search vehicle or route..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
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
                <th>Vehicle & Model</th>
                <th>Route Details</th>
                <th>Driver Info</th>
                <th>Capacity</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.data.length === 0 && (
                <tr><td colSpan={6} className="mm-empty">কোনো গাড়ির তথ্য পাওয়া যায়নি।</td></tr>
              )}
              {vehicles.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="mm-label-cell">
                      <Icon name="bus" className="mm-row-icon" />
                      <div>
                        <div style={{ fontWeight: 500, color: '#111827' }}>{item.vehicle_number}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{item.vehicle_model || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500, color: '#374151' }}>{item.route_name}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.875rem' }}>{item.driver_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>📞 {item.driver_phone}</div>
                  </td>
                  <td>{item.capacity} Seats</td>
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
        <Pagination meta={vehicles} />
      </div>

      {formOpen && <VehicleFormModal item={editingItem} campuses={campuses} activeCampusId={auth?.active_campus_id} onClose={() => setFormOpen(false)} />}

      {deletingItem && (
        <ConfirmDeleteModal item={deletingItem} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.transport.vehicles.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
      {viewingItem && (
        <VehicleShowModal 
          item={viewingItem} 
          onClose={() => setViewingItem(null)} 
        />
      )}
    </AuthenticatedLayout>
  );
}