import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import RouteFormModal from './Partials/RouteFormModal';
import Swal from 'sweetalert2';

export default function Index({ routes, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [editingItem, setEditingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
  }, [flash]);

  function applyFilters() {
    router.get(route('admin.transport.routes.index'), { search, per_page: perPage }, { preserveState: true, replace: true });
  }

  useEffect(() => {
    if (perPage !== (filters.per_page ?? '10')) applyFilters();
  }, [perPage]);

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">Campus Life / Transport</span><h1>Routes & Stops</h1></div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setIsFormOpen(true); }}>
              <Icon name="plus" /> Add New Route
            </button>
          </div>
        </div>
      }
    >
      <Head title="Transport Routes" />
      <div className="card mm-card">

        <div className="mm-filters" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Show</span>
            <select value={perPage} onChange={(e) => setPerPage(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <option value="10">10</option><option value="25">25</option><option value="50">50</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="search">
              <Icon name="search" />
              <input placeholder="Search route name..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
            </div>
            <button className="btn btn-outline" onClick={applyFilters}>Search</button>
          </div>
        </div>

        <div className="mm-table-wrap mt-3">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>SL</th>
                <th>Route Details</th>
                <th>Points (Start - End)</th>
                <th>Stops Count</th>
                <th>Base Fare</th>
                <th>Status</th>
                <th className="mm-actions-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {routes.data.length === 0 && <tr><td colSpan={7} className="mm-empty">No transport routes added yet.</td></tr>}
              {routes.data.map((item, index) => (
                <tr key={item.id}>
                  <td>{(routes.from ?? 1) + index}</td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{item.title}</strong>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{item.start_point || 'N/A'}</span>
                      <Icon name="arrow-right" style={{ width: '12px', height: '12px' }} />
                      <span style={{ color: '#dc2626', fontWeight: 'bold' }}>{item.end_point || 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge-outline border-gray-400 text-gray-700">{item.stops ? item.stops.length : 0} Stops</span>
                  </td>
                  <td>
                    <strong style={{ color: '#4f46e5' }}>৳ {item.base_fare}</strong>
                  </td>
                  <td>
                    <span className={`badge-outline ${item.is_active ? 'border-green-600 text-green-600' : 'border-gray-500 text-gray-500'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" onClick={() => { setEditingItem(item); setIsFormOpen(true); }}><Icon name="edit" /></button>
                      <button className="icon-btn icon-btn-danger" onClick={() => setDeletingItem(item)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={routes} />
      </div>

      {isFormOpen && <RouteFormModal item={editingItem} onClose={() => setIsFormOpen(false)} />}

      {deletingItem && (
        <ConfirmDeleteModal
          item={{ name: deletingItem.title }}
          message="Are you sure you want to delete this route? Ensure no vehicles are actively assigned to it."
          onCancel={() => setDeletingItem(null)}
          onConfirm={() => {
            router.delete(route('admin.transport.routes.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
          }}
        />
      )}
    </AuthenticatedLayout>
  );
}
