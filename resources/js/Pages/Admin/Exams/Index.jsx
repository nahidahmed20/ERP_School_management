import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ExamFormModal from './Partials/ExamFormModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ exams, filters }) {
  const { flash, auth } = usePage().props;
  const [search, setSearch] = useState(filters?.search ?? '');
  const [status, setStatus] = useState(filters?.status ?? '');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.exams.index'), { search, status, ...overrides }, { preserveState: true, replace: true });
  }

  function formatDate(dateString) {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Academics</span>
            <h1>Exams</h1>
            <p className="desc">পরীক্ষার তালিকা এবং সময়সীমা ম্যানেজ করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Add Exam
            </button>
          </div>
        </div>
      }
    >
      <Head title="Exams" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by exam name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', minWidth: '220px' }}
          />
          <select value={status} onChange={(e) => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="btn btn-outline" onClick={() => applyFilters()}>Search</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Exam Name</th>
                <th>Schedule</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.data.length === 0 && <tr><td colSpan={4} className="mm-empty">কোনো পরীক্ষা পাওয়া যায়নি।</td></tr>}
              {exams.data.map((item) => {
                const start = formatDate(item.start_date);
                const end = formatDate(item.end_date);
                return (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{item.name}</div>
                      {item.description && (
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{item.description}</div>
                      )}
                    </td>
                    <td style={{ fontSize: '13px', color: '#475569' }}>
                      {(start || end) ? (
                        <>
                          <div><strong>Start:</strong> {start ?? '—'}</div>
                          <div><strong>End:</strong> {end ?? '—'}</div>
                        </>
                      ) : <span style={{ color: '#94a3b8' }}>Not Scheduled</span>}
                    </td>
                    <td>
                      <span className="badge" style={{
                        background: item.is_active ? '#f0fdf4' : '#f1f5f9',
                        color: item.is_active ? '#16a34a' : '#64748b',
                        fontSize: '11px'
                      }}>{item.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td>
                      <div className="mm-row-actions">
                        <button className="icon-btn" onClick={() => { setEditingItem(item); setFormOpen(true); }}><Icon name="edit" /></button>
                        <button className="icon-btn icon-btn-danger" onClick={() => setDeletingItem(item)}><Icon name="trash" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination meta={exams} />
      </div>

      {formOpen && <ExamFormModal item={editingItem} activeCampusId={auth?.active_campus_id} onClose={() => setFormOpen(false)} />}
      {deletingItem && <ConfirmDeleteModal item={deletingItem} onCancel={() => setDeletingItem(null)} onConfirm={() => { router.delete(route('admin.exams.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) }); }} />}
    </AuthenticatedLayout>
  );
}
