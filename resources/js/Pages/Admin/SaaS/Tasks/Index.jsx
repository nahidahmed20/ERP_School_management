import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import TaskFormModal from './Partials/TaskFormModal';
import Swal from 'sweetalert2';

export default function Index({ tasks, filters }) {
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
    router.get(route('admin.saas.tasks.index'), { search, per_page: perPage }, { preserveState: true, replace: true });
  }

  useEffect(() => {
    if (perPage !== (filters.per_page ?? '10')) applyFilters();
  }, [perPage]);

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">SaaS, AI & Backups</span><h1>Scheduled Tasks (Cron)</h1></div>
          <div className="mm-head-actions">
            <button className="btn btn-outline" onClick={applyFilters}>
              <Icon name="refresh" /> Refresh Status
            </button>
            <button className="btn" onClick={() => { setEditingItem(null); setIsFormOpen(true); }}>
              <Icon name="plus" /> Add Task
            </button>
          </div>
        </div>
      }
    >
      <Head title="Scheduled Tasks" />
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
              <input placeholder="Search Task or Command..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
            </div>
            <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
          </div>
        </div>

        <div className="mm-table-wrap mt-3">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>SL</th>
                <th>Task Name & Command</th>
                <th>Frequency (Cron)</th>
                <th>Last Run</th>
                <th>Status</th>
                <th className="mm-actions-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.data.length === 0 && <tr><td colSpan={6} className="mm-empty">No scheduled tasks created yet.</td></tr>}
              {tasks.data.map((item, index) => (
                <tr key={item.id}>
                  <td>{(tasks.from ?? 1) + index}</td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{item.name}</strong>
                    <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#4f46e5', marginTop: '3px' }}>
                      php artisan {item.command}
                    </div>
                  </td>
                  <td>
                    <code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' }}>
                      {item.frequency}
                    </code>
                  </td>
                  <td>
                    {item.last_run_at ? (
                      <>
                        <strong style={{ color: '#0f172a' }}>{new Date(item.last_run_at).toLocaleDateString()}</strong>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{new Date(item.last_run_at).toLocaleTimeString()}</div>
                      </>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>Not run yet</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge-outline ${item.is_active ? 'border-green-600 text-green-600' : 'border-gray-500 text-gray-500'}`} style={{ marginBottom: '4px', display: 'inline-block' }}>
                      {item.is_active ? 'Active' : 'Paused'}
                    </span>
                    {item.last_status === 'Failed' && (
                      <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 'bold' }}>Last Run: Failed</div>
                    )}
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
        <Pagination meta={tasks} />
      </div>

      {isFormOpen && <TaskFormModal item={editingItem} onClose={() => setIsFormOpen(false)} />}

      {deletingItem && (
        <ConfirmDeleteModal
          item={{ name: deletingItem.name }}
          message="Are you sure you want to delete this scheduled task? Automated processes relying on this command will stop."
          onCancel={() => setDeletingItem(null)}
          onConfirm={() => {
            router.delete(route('admin.saas.tasks.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
          }}
        />
      )}
    </AuthenticatedLayout>
  );
}
