import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import SmsFormModal from './Partials/SmsFormModal';
import Swal from 'sweetalert2';

export default function Index({ logs, campuses, activeCampusId, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
  }, [flash]);

  function applyFilters() {
    router.get(route('admin.sms-logs.index'), { search, per_page: perPage }, { preserveState: true, replace: true });
  }

  useEffect(() => {
    if (perPage !== (filters.per_page ?? '10')) applyFilters();
  }, [perPage]);

  // Format Date
  const displayDate = (dt) => new Date(dt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">Communication</span><h1>SMS Logs</h1></div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => setIsFormOpen(true)}>
              <Icon name="send" /> Send Custom SMS
            </button>
          </div>
        </div>
      }
    >
      <Head title="SMS Logs" />
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
              <input placeholder="Search number or text..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
            </div>
            <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
          </div>
        </div>

        <div className="mm-table-wrap mt-3">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>SL</th>
                <th>Recipient</th>
                <th style={{width: '40%'}}>Message</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th className="mm-actions-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.data.length === 0 && <tr><td colSpan={6} className="mm-empty">No SMS logs found.</td></tr>}
              {logs.data.map((item, index) => (
                <tr key={item.id}>
                  <td>{(logs.from ?? 1) + index}</td>
                  <td>
                    <div style={{ fontWeight: 'bold' }}>{item.phone_number}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{item.recipient_name || 'Unknown'}</div>
                  </td>
                  <td style={{ fontSize: '13px', color: '#334155', whiteSpace: 'normal' }}>
                    {item.message}
                  </td>
                  <td style={{ fontSize: '13px', color: '#475569' }}>
                    {displayDate(item.created_at)}
                  </td>
                  <td>
                    <span className={`badge-outline ${item.status === 'Sent' ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn icon-btn-danger" onClick={() => setDeletingItem(item)} title="Delete Log"><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination meta={logs} />
      </div>

      {isFormOpen && <SmsFormModal campuses={campuses} activeCampusId={activeCampusId} onClose={() => setIsFormOpen(false)} />}

      {deletingItem && (
        <ConfirmDeleteModal item={{ name: `Log for ${deletingItem.phone_number}` }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.sms-logs.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}
