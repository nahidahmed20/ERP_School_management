import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import BackupFormModal from './Partials/BackupFormModal';
import Swal from 'sweetalert2';

export default function Index({ backups, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
  }, [flash]);

  function applyFilters() {
    router.get(route('admin.saas.backups'), { search, per_page: perPage }, { preserveState: true, replace: true });
  }

  useEffect(() => {
    if (perPage !== (filters.per_page ?? '10')) applyFilters();
  }, [perPage]);

  // Color badging for status
  const getStatusBadge = (status) => {
    if (status === 'Completed') return 'border-green-600 text-green-700 bg-green-50';
    if (status === 'Pending') return 'border-yellow-500 text-yellow-700 bg-yellow-50';
    if (status === 'Failed') return 'border-red-600 text-red-700 bg-red-50';
    return 'border-gray-600 text-gray-700';
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">SaaS, AI & Backups</span><h1>System Backups</h1></div>
          <div className="mm-head-actions">
            <button className="btn" style={{ background: '#0f172a' }} onClick={() => setIsFormOpen(true)}>
              <Icon name="database" /> Generate Backup
            </button>
          </div>
        </div>
      }
    >
      <Head title="System Backups" />
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
              <input placeholder="Search file name..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
            </div>
            <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
          </div>
        </div>

        <div className="mm-table-wrap mt-3">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>SL</th>
                <th>File Name</th>
                <th>Backup Type</th>
                <th>File Size</th>
                <th>Created At</th>
                <th>Status</th>
                <th className="mm-actions-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {backups.data.length === 0 && <tr><td colSpan={7} className="mm-empty">No backups created yet.</td></tr>}
              {backups.data.map((item, index) => (
                <tr key={item.id}>
                  <td>{(backups.from ?? 1) + index}</td>
                  <td>
                    <strong style={{ color: '#0f172a', fontFamily: 'monospace', fontSize: '13px' }}>{item.file_name}</strong>
                  </td>
                  <td><span className="badge-outline">{item.type}</span></td>
                  <td>{item.file_size || <span style={{ color: '#94a3b8' }}>Calculating...</span>}</td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{new Date(item.created_at).toLocaleDateString()}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{new Date(item.created_at).toLocaleTimeString()}</div>
                  </td>
                  <td>
                    <span className={`badge-outline ${getStatusBadge(item.status)}`}>
                      {item.status === 'Pending' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Icon name="loader" style={{ width: '12px', height: '12px' }} /> {item.status}</span>
                      ) : item.status}
                    </span>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" disabled={item.status !== 'Completed'} title={item.status === 'Completed' ? 'Download Backup' : 'Not ready for download'}>
                        <Icon name="download" />
                      </button>
                      <button className="icon-btn icon-btn-danger" onClick={() => setDeletingItem(item)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={backups} />
      </div>

      {isFormOpen && <BackupFormModal onClose={() => setIsFormOpen(false)} />}

      {deletingItem && (
        <ConfirmDeleteModal
          item={{ name: deletingItem.file_name }}
          message="Are you sure you want to delete this backup file? You will not be able to restore data from this file once deleted."
          onCancel={() => setDeletingItem(null)}
          onConfirm={() => {
            router.delete(route('admin.saas.backups.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
          }}
        />
      )}
    </AuthenticatedLayout>
  );
}
