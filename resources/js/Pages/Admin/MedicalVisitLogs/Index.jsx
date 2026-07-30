import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import LogFormModal from './Partials/LogFormModal';
import LogShowModal from './Partials/LogShowModal';
import Swal from 'sweetalert2';

export default function Index({ logs, rooms, users, campuses, activeCampusId, filters }) {
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
    router.get(route('admin.medical.visit-logs.index'), { search }, { preserveState: true, replace: true });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">Medical Room</span><h1>Visit Logs</h1></div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setIsFormOpen(true); }}><Icon name="plus" /> Add Log</button>
          </div>
        </div>
      }
    >
      <Head title="Visit Logs" />
      <div className="card mm-card">
        <div className="mm-filters">
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search Patient or Symptoms..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>
          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>SL</th>
                <th>Date & Time</th>
                <th>Patient Name</th>
                <th>Room No</th>
                <th>Symptoms</th>
                <th>Action Taken</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.data.length === 0 && <tr><td colSpan={7} className="mm-empty">No visit logs found.</td></tr>}
              {logs.data.map((log, index) => (
                <tr key={log.id}>
                  <td>{(logs.from ?? 1) + index}</td>
                  <td>{new Date(log.visit_time).toLocaleString()}</td>
                  <td><strong>{log.patient?.name}</strong> <br/><span style={{fontSize: '11px', color: '#64748b'}}>({log.patient?.role})</span></td>
                  <td>{log.room?.room_number}</td>
                  <td>{log.symptoms}</td>
                  <td><span className="badge-outline">{log.action_taken}</span></td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" onClick={() => setViewingItem(log)}><Icon name="eye" /></button>
                      <button className="icon-btn" onClick={() => { setEditingItem(log); setIsFormOpen(true); }}><Icon name="edit" /></button>
                      <button className="icon-btn icon-btn-danger" onClick={() => setDeletingItem(log)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={logs} />
      </div>

      {isFormOpen && <LogFormModal item={editingItem} rooms={rooms} users={users} campuses={campuses} activeCampusId={activeCampusId} onClose={() => setIsFormOpen(false)} />}
      {viewingItem && <LogShowModal item={viewingItem} onClose={() => setViewingItem(null)} />}
      {deletingItem && (
        <ConfirmDeleteModal item={{ name: `Visit log for ${deletingItem.patient?.name}` }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.medical.visit-logs.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}