import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import VaccineFormModal from './Partials/VaccineFormModal';
import VaccineShowModal from './Partials/VaccineShowModal';
import Swal from 'sweetalert2';

export default function Index({ vaccinations, users, campuses, activeCampusId, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
    }
  }, [flash]);

  function applyFilters() {
    router.get(route('admin.medical.vaccinations.index'), { search }, { preserveState: true, replace: true });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">Medical Room</span><h1>Vaccinations</h1></div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setIsFormOpen(true); }}><Icon name="plus" /> Add Record</button>
          </div>
        </div>
      }
    >
      <Head title="Vaccinations" />
      <div className="card mm-card">
        <div className="mm-filters">
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search Student or Vaccine..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>
          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>SL</th>
                <th>Student / Staff</th>
                <th>Vaccine Name</th>
                <th>Dose</th>
                <th>Administered Date</th>
                <th>Next Due Date</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vaccinations.data.length === 0 && <tr><td colSpan={7} className="mm-empty">No vaccination records found.</td></tr>}
              {vaccinations.data.map((item, index) => (
                <tr key={item.id}>
                  <td>{(vaccinations.from ?? 1) + index}</td>
                  <td><strong>{item.student?.name}</strong></td>
                  <td><strong>{item.vaccine_name}</strong></td>
                  <td><span className="badge-outline">{item.dose_number || 'N/A'}</span></td>
                  <td>{new Date(item.date_administered).toLocaleDateString()}</td>
                  <td>
                    {item.next_due_date ? (
                      <span style={{ color: '#b91c1c', fontWeight: '500' }}>{new Date(item.next_due_date).toLocaleDateString()}</span>
                    ) : '-'}
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" onClick={() => setViewingItem(item)}><Icon name="eye" /></button>
                      <button className="icon-btn" onClick={() => { setEditingItem(item); setIsFormOpen(true); }}><Icon name="edit" /></button>
                      <button className="icon-btn icon-btn-danger" onClick={() => setDeletingItem(item)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={vaccinations} />
      </div>

      {isFormOpen && <VaccineFormModal item={editingItem} users={users} campuses={campuses} activeCampusId={activeCampusId} onClose={() => setIsFormOpen(false)} />}
      {viewingItem && <VaccineShowModal item={viewingItem} onClose={() => setViewingItem(null)} />}
      {deletingItem && (
        <ConfirmDeleteModal item={{ name: `${deletingItem.vaccine_name} for ${deletingItem.student?.name}` }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.medical.vaccinations.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}