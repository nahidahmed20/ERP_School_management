import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import TicketFormModal from './Partials/TicketFormModal';
import TicketViewModal from './Partials/TicketViewModal';
import Swal from 'sweetalert2';

export default function Index({ tickets, campuses, activeCampusId, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingTicket, setViewingTicket] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
  }, [flash]);

  function applyFilters() {
    router.get(route('admin.communication.helpdesk.index'), { search, per_page: perPage }, { preserveState: true, replace: true });
  }

  useEffect(() => {
    if (perPage !== (filters.per_page ?? '10')) applyFilters();
  }, [perPage]);

  const displayDate = (dt) => new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">Communication</span><h1>Helpdesk & Tickets</h1></div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => setIsFormOpen(true)}>
              <Icon name="plus" /> New Ticket
            </button>
          </div>
        </div>
      }
    >
      <Head title="Helpdesk" />
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
              <input placeholder="Search Ticket ID or Subject..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
            </div>
            <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
          </div>
        </div>

        <div className="mm-table-wrap mt-3">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Subject & Requester</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
                <th className="mm-actions-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.data.length === 0 && <tr><td colSpan={6} className="mm-empty">No tickets found.</td></tr>}
              {tickets.data.map((item) => (
                <tr key={item.id}>
                  <td><strong style={{ color: '#4f46e5' }}>{item.ticket_number}</strong></td>
                  <td>
                    <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{item.subject}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{item.requester_name} ({item.requester_type})</div>
                  </td>
                  <td>
                    <span className={`badge-outline ${item.priority === 'High' ? 'text-red-600 border-red-600' : (item.priority === 'Medium' ? 'text-orange-600 border-orange-600' : 'text-green-600 border-green-600')}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge-outline ${item.status === 'Open' ? 'text-blue-600 border-blue-600 bg-blue-50' : (item.status === 'In Progress' ? 'text-orange-600 border-orange-600 bg-orange-50' : 'text-gray-600 border-gray-600 bg-gray-50')}`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: '#475569' }}>{displayDate(item.created_at)}</td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" onClick={() => setViewingTicket(item)} title="View & Reply"><Icon name="chat" /></button>
                      <button className="icon-btn icon-btn-danger" onClick={() => setDeletingItem(item)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination meta={tickets} />
      </div>

      {isFormOpen && <TicketFormModal campuses={campuses} activeCampusId={activeCampusId} onClose={() => setIsFormOpen(false)} />}

      {viewingTicket && <TicketViewModal ticket={viewingTicket} onClose={() => { setViewingTicket(null); applyFilters(); }} />}

      {deletingItem && (
        <ConfirmDeleteModal item={{ name: deletingItem.ticket_number }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.communication.helpdesk.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}
