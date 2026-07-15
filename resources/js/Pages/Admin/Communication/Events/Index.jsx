import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import EventFormModal from './Partials/EventFormModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ events, classrooms, filters }) {
  const { flash, auth } = usePage().props;
  const [type, setType] = useState(filters.type ?? '');
  const [filter, setFilter] = useState(filters.filter ?? 'upcoming');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.communication.calendar.index'), { type, filter, ...overrides }, { preserveState: true, replace: true });
  }

  function formatDate(dateString) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Communication</span>
            <h1>Calendar & Events</h1>
            <p className="desc">স্কুলের মিটিং, ছুটির দিন এবং ইভেন্ট ম্যানেজমেন্ট।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Add Event
            </button>
          </div>
        </div>
      }
    >
      <Head title="Events & Meetings" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select value={type} onChange={(e) => { setType(e.target.value); applyFilters({ type: e.target.value }); }}>
            <option value="">All Types</option>
            <option value="Event">Event</option>
            <option value="Meeting">Meeting</option>
            <option value="Holiday">Holiday</option>
          </select>
          <select value={filter} onChange={(e) => { setFilter(e.target.value); applyFilters({ filter: e.target.value }); }}>
            <option value="upcoming">Upcoming Events</option>
            <option value="all">All Events</option>
          </select>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Event / Meeting Info</th>
                <th>Schedule</th>
                <th>Location / Room</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.data.length === 0 && <tr><td colSpan={4} className="mm-empty">কোনো ইভেন্ট পাওয়া যায়নি।</td></tr>}
              {events.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#334155' }}>{item.title}</div>
                    <span className="badge" style={{ 
                      background: item.type === 'Holiday' ? '#fef2f2' : (item.type === 'Meeting' ? '#eff6ff' : '#f0fdf4'),
                      color: item.type === 'Holiday' ? '#dc2626' : (item.type === 'Meeting' ? '#2563eb' : '#16a34a'),
                      fontSize: '11px' 
                    }}>{item.type}</span>
                  </td>
                  <td style={{ fontSize: '13px', color: '#475569' }}>
                    <div><strong>Starts:</strong> {formatDate(item.start_datetime)}</div>
                    <div><strong>Ends:</strong> {formatDate(item.end_datetime)}</div>
                  </td>
                  <td>
                    {item.classroom ? (
                      <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                        <Icon name="home" style={{ width: '12px', marginRight: '4px' }} /> {item.classroom.room_number}
                      </span>
                    ) : <span style={{ color: '#94a3b8', fontSize: '13px' }}>Not Assigned</span>}
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" onClick={() => { setEditingItem(item); setFormOpen(true); }}><Icon name="edit" /></button>
                      <button className="icon-btn icon-btn-danger" onClick={() => setDeletingItem(item)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={events} />
      </div>

      {formOpen && <EventFormModal item={editingItem} classrooms={classrooms} activeCampusId={auth?.active_campus_id} onClose={() => setFormOpen(false)} />}
      {deletingItem && <ConfirmDeleteModal item={deletingItem} onCancel={() => setDeletingItem(null)} onConfirm={() => { router.delete(route('admin.communication.calendar.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) }); }} />}
    </AuthenticatedLayout>
  );
}