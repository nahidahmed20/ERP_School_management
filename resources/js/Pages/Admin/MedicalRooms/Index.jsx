import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import RoomFormModal from './Partials/RoomFormModal';
import Swal from 'sweetalert2';

export default function Index({ rooms, campuses, activeCampusId, filters }) {
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
    router.get(route('admin.medical.rooms.index'), { search }, { preserveState: true, replace: true });
  }

  // Inline Status Toggle
  const handleStatusToggle = (item) => {
    router.put(route('admin.medical.rooms.update', item.id), {
      campus_id: item.campus_id,
      room_number: item.room_number,
      nurse_name: item.nurse_name,
      phone: item.phone || '',
      total_beds: item.total_beds,
      is_active: !item.is_active
    }, { preserveScroll: true, preserveState: true });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">Medical Room</span><h1>Rooms & Staff</h1></div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setIsModalOpen(true); }}><Icon name="plus" /> Add Room</button>
          </div>
        </div>
      }
    >
      <Head title="Medical Rooms" />
      <div className="card mm-card">
        <div className="mm-filters">
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search Room or Nurse..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>
          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>SL</th>
                <th>Room No</th>
                <th>Nurse / Doctor</th>
                <th>Phone</th>
                <th>Beds</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.data.length === 0 && <tr><td colSpan={7} className="mm-empty">No medical rooms found.</td></tr>}
              {rooms.data.map((item, index) => (
                <tr key={item.id}>
                  <td>{(rooms.from ?? 1) + index}</td>
                  <td><strong>{item.room_number}</strong></td>
                  <td>{item.nurse_name}</td>
                  <td>{item.phone || '-'}</td>
                  <td>{item.total_beds}</td>
                  <td>
                    <button 
                      onClick={() => handleStatusToggle(item)}
                      className={`mm-badge ${item.is_active ? 'badge-active' : 'badge-inactive'}`}
                      style={{ border: 'none', cursor: 'pointer' }}
                      title="Click to toggle status"
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
        <Pagination meta={rooms} />
      </div>

      {isModalOpen && <RoomFormModal item={editingItem} campuses={campuses} activeCampusId={activeCampusId} onClose={() => setIsModalOpen(false)} />}
      {deletingItem && (
        <ConfirmDeleteModal item={{ name: deletingItem.room_number }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.medical.rooms.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}