import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import QueueDetailsModal from './Partials/QueueDetailsModal';
import Swal from 'sweetalert2';

export default function Index({ jobs, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [statusFilter, setStatusFilter] = useState(filters.status ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '50');

  const [viewingItem, setViewingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
  }, [flash]);

  function applyFilters() {
    router.get(route('admin.saas.queue'), { search, status: statusFilter, per_page: perPage }, { preserveState: true, replace: true });
  }

  useEffect(() => {
    if (perPage !== (filters.per_page ?? '50') || statusFilter !== (filters.status ?? '')) applyFilters();
  }, [perPage, statusFilter]);

  const getStatusStyle = (status) => {
    if (status === 'Completed') return 'border-green-600 text-green-700 bg-green-50';
    if (status === 'Failed') return 'border-red-600 text-red-700 bg-red-50';
    if (status === 'Processing') return 'border-blue-600 text-blue-700 bg-blue-50';
    return 'border-yellow-500 text-yellow-700 bg-yellow-50'; // Pending
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">SaaS, AI & Backups</span><h1>Queue & Job Monitor</h1></div>
          <div className="mm-head-actions">
            <button className="btn btn-outline" onClick={applyFilters}>
              <Icon name="refresh" /> Refresh Queue
            </button>
          </div>
        </div>
      }
    >
      <Head title="Queue Monitor" />
      <div className="card mm-card">

        <div className="mm-filters" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Show</span>
            <select value={perPage} onChange={(e) => setPerPage(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <option value="25">25</option><option value="50">50</option><option value="100">100</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
            </select>
            <div className="search">
              <Icon name="search" />
              <input placeholder="Search Job Name..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
            </div>
            <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
          </div>
        </div>

        <div className="mm-table-wrap mt-3">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>SL</th>
                <th>Job Name</th>
                <th>Queue</th>
                <th>Queued At</th>
                <th>Status</th>
                <th className="mm-actions-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.data.length === 0 && <tr><td colSpan={6} className="mm-empty">No background jobs found.</td></tr>}
              {jobs.data.map((item, index) => (
                <tr key={item.id}>
                  <td>{(jobs.from ?? 1) + index}</td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{item.job_name}</strong>
                  </td>
                  <td>
                    <span className="badge-outline border-gray-400 text-gray-600">{item.queue_name}</span>
                  </td>
                  <td>
                    <strong style={{ color: '#334155', fontSize: '13px' }}>{new Date(item.created_at).toLocaleTimeString()}</strong>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{new Date(item.created_at).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <span className={`badge-outline ${getStatusStyle(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => setViewingItem(item)}>
                        Details
                      </button>
                      <button className="icon-btn icon-btn-danger" onClick={() => setDeletingItem(item)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={jobs} />
      </div>

      {viewingItem && <QueueDetailsModal job={viewingItem} onClose={() => setViewingItem(null)} />}

      {deletingItem && (
        <ConfirmDeleteModal
          item={{ name: deletingItem.job_name }}
          message="Are you sure you want to delete this queue log? If it is pending, it will not be executed."
          onCancel={() => setDeletingItem(null)}
          onConfirm={() => {
            router.delete(route('admin.saas.queue.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
          }}
        />
      )}
    </AuthenticatedLayout>
  );
}
