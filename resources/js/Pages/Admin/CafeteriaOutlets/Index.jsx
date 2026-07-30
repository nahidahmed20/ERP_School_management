import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import OutletFormModal from './Partials/OutletFormModal';
import Swal from 'sweetalert2';

export default function Index({ outlets, campuses, activeCampusId, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
    }
  }, [flash]);

  function applyFilters() {
    router.get(route('admin.cafeteria.outlets.index'), { search }, { preserveState: true, replace: true });
  }

  const handleStatusToggle = (item) => {
    router.put(route('admin.cafeteria.outlets.update', item.id), {
      campus_id: item.campus_id,
      name: item.name,
      location: item.location || '',
      manager_name: item.manager_name || '',
      phone: item.phone || '',
      is_active: !item.is_active
    }, { preserveScroll: true, preserveState: true });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">Cafeteria</span><h1>Outlets / Canteens</h1></div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setIsModalOpen(true); }}><Icon name="plus" /> Add Outlet</button>
          </div>
        </div>
      }
    >
      <Head title="Cafeteria Outlets" />
      <div className="card mm-card">
        <div className="mm-filters">
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search Outlets..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>
          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>SL</th>
                <th>Outlet Name</th>
                <th>Location</th>
                <th>Manager & Phone</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {outlets.data.length === 0 && <tr><td colSpan={6} className="mm-empty">No outlets found.</td></tr>}
              {outlets.data.map((item, index) => (
                <tr key={item.id}>
                  <td>{(outlets.from ?? 1) + index}</td>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.location || '-'}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{item.manager_name || '-'}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{item.phone}</div>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleStatusToggle(item)}
                      className={`mm-badge ${item.is_active ? 'badge-active' : 'badge-inactive'}`}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      {item.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" onClick={() => { setEditingItem(item); setIsModalOpen(true); }}><Icon name="edit" /></button>
                      <button className="icon-btn icon-btn-danger" onClick={() => setDeletingItem(item)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={outlets} />
      </div>

      {isModalOpen && <OutletFormModal item={editingItem} campuses={campuses} activeCampusId={activeCampusId} onClose={() => setIsModalOpen(false)} />}
      {deletingItem && (
        <ConfirmDeleteModal item={{ name: deletingItem.name }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.cafeteria.outlets.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}