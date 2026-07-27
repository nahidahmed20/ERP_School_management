import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import AllocationFormModal from './Partials/AllocationFormModal';
import AllocationShowModal from './Partials/AllocationShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ allocations, vehicles, users, campuses, filters }) {
  const { flash, auth } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [vehicleId, setVehicleId] = useState(filters.vehicle_id ?? '');
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
    router.get(route('admin.transport.allocations.index'), {
      search, vehicle_id: vehicleId, per_page: perPage, ...overrides,
    }, { preserveState: true, replace: true });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Campus Life</span>
            <h1>Transport Allocation</h1>
            <p className="desc">স্টুডেন্ট বা স্টাফদের জন্য গাড়ির সিট ও রুট বরাদ্দ করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> New Allocation
            </button>
          </div>
        </div>
      }
    >
      <Head title="Transport Allocation" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select value={perPage} onChange={(e) => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}>
            <option value="10">10 / page</option>
            <option value="50">50 / page</option>
            <option value="all">Show All</option>
          </select>
          
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search user or pickup..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>

          <select value={vehicleId} onChange={(e) => { setVehicleId(e.target.value); applyFilters({ vehicle_id: e.target.value }); }}>
            <option value="">All Vehicles</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicle_number} ({v.route_name})</option>)}
          </select>

          <button className="btn btn-outline" onClick={() => applyFilters()}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Passenger (User)</th>
                <th>Vehicle & Route</th>
                <th>Pickup Point</th>
                <th>Monthly Fare</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allocations.data.length === 0 && (
                <tr><td colSpan={6} className="mm-empty">কোনো বরাদ্দ পাওয়া যায়নি।</td></tr>
              )}
              {allocations.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="mm-label-cell">
                      <Icon name="user" className="mm-row-icon" />
                      <div>
                        <div style={{ fontWeight: 500, color: '#111827' }}>{item.user?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{item.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{item.vehicle?.vehicle_number}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{item.vehicle?.route_name}</div>
                  </td>
                  <td>{item.pickup_point}</td>
                  <td><strong style={{ color: '#047857' }}>৳ {item.monthly_fare}</strong></td>
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
        <Pagination meta={allocations} />
      </div>

      {formOpen && <AllocationFormModal item={editingItem} vehicles={vehicles} users={users} campuses={campuses} activeCampusId={auth?.active_campus_id} onClose={() => setFormOpen(false)} />}

      {viewingItem && <AllocationShowModal item={viewingItem} onClose={() => setViewingItem(null)} />}

      {deletingItem && (
        <ConfirmDeleteModal item={{ name: deletingItem.user?.name + "'s Allocation" }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.transport.allocations.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}