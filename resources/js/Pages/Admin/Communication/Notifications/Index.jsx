import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import NotificationFormModal from './Partials/NotificationFormModal';
import Swal from 'sweetalert2';

export default function Index({ notifications, campuses, activeCampusId, filters }) {
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
    router.get(route('admin.communication-notifications.index'), { search, per_page: perPage }, { preserveState: true, replace: true });
  }

  useEffect(() => {
    if (perPage !== (filters.per_page ?? '10')) applyFilters();
  }, [perPage]);

  const displayDate = (dt) => new Date(dt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">Communication</span><h1>Notifications</h1></div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setIsFormOpen(true); }}>
              <Icon name="bell" /> Create Notification
            </button>
          </div>
        </div>
      }
    >
      <Head title="Notifications" />
      <div className="card mm-card">

        <div className="mm-filters" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Show</span>
            <select value={perPage} onChange={(e) => setPerPage(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}>
              <option value="10">10</option><option value="25">25</option><option value="50">50</option>
              <option value="100">100</option><option value="500">500</option><option value="All">All</option>
            </select>
            <span style={{ fontSize: '14px', color: '#64748b' }}>entries</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="search">
              <Icon name="search" />
              <input placeholder="Search title or message..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
            </div>
            <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
          </div>
        </div>

        <div className="mm-table-wrap mt-3">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>SL</th>
                <th style={{width: '35%'}}>Title & Message</th>
                <th>Type & Audience</th>
                <th>Date</th>
                <th>Status</th>
                <th className="mm-actions-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {notifications.data.length === 0 && <tr><td colSpan={6} className="mm-empty">No notifications found.</td></tr>}
              {notifications.data.map((item, index) => (
                <tr key={item.id}>
                  <td>{(notifications.from ?? 1) + index}</td>
                  <td>
                    <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{item.title}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', whiteSpace: 'normal' }}>
                      {item.message.length > 80 ? item.message.substring(0, 80) + '...' : item.message}
                    </div>
                  </td>
                  <td>
                    <span className="badge-outline mr-2">{item.notification_type}</span>
                    <span className="badge-outline border-blue-600 text-blue-600">{item.target_audience}</span>
                  </td>
                  <td style={{ fontSize: '13px', color: '#475569' }}>
                    {displayDate(item.created_at)}
                  </td>
                  <td>
                    <span className={`badge-outline ${item.status === 'Sent' ? 'text-green-600 border-green-600' : (item.status === 'Draft' ? 'text-gray-600 border-gray-600' : 'text-orange-600 border-orange-600')}`}>
                      {item.status}
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

        <Pagination meta={notifications} />
      </div>

      {isFormOpen && <NotificationFormModal item={editingItem} campuses={campuses} activeCampusId={activeCampusId} onClose={() => setIsFormOpen(false)} />}

      {deletingItem && (
        <ConfirmDeleteModal item={{ name: deletingItem.title }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.communication-notifications.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}
