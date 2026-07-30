import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import RecordFormModal from './Partials/RecordFormModal';
import RecordShowModal from './Partials/RecordShowModal';
import Swal from 'sweetalert2';

export default function Index({ records, users, campuses, activeCampusId, filters }) {
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
    router.get(route('admin.medical.health-records.index'), { search }, { preserveState: true, replace: true });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">Medical Room</span><h1>Health Records</h1></div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setIsFormOpen(true); }}><Icon name="plus" /> Add Record</button>
          </div>
        </div>
      }
    >
      <Head title="Health Records" />
      <div className="card mm-card">
        <div className="mm-filters">
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search Student or Blood Group..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>
          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>SL</th>
                <th>Student / Staff Name</th>
                <th>Blood Group</th>
                <th>Height & Weight</th>
                <th>Emergency Contact</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.data.length === 0 && <tr><td colSpan={6} className="mm-empty">No records found.</td></tr>}
              {records.data.map((record, index) => (
                <tr key={record.id}>
                  <td>{(records.from ?? 1) + index}</td>
                  <td><strong>{record.user?.name}</strong></td>
                  <td><span className="badge-outline" style={{color: '#b91c1c', borderColor: '#fca5a5'}}>{record.blood_group || 'N/A'}</span></td>
                  <td>{record.height || '-'} | {record.weight || '-'}</td>
                  <td>{record.emergency_contact || '-'}</td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" onClick={() => setViewingItem(record)}><Icon name="eye" /></button>
                      <button className="icon-btn" onClick={() => { setEditingItem(record); setIsFormOpen(true); }}><Icon name="edit" /></button>
                      <button className="icon-btn icon-btn-danger" onClick={() => setDeletingItem(record)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={records} />
      </div>

      {isFormOpen && <RecordFormModal item={editingItem} users={users} campuses={campuses} activeCampusId={activeCampusId} onClose={() => setIsFormOpen(false)} />}
      {viewingItem && <RecordShowModal item={viewingItem} onClose={() => setViewingItem(null)} />}
      {deletingItem && (
        <ConfirmDeleteModal item={{ name: `Health Record of ${deletingItem.user?.name}` }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.medical.health-records.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}