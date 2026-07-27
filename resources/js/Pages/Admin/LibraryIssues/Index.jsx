import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import IssueFormModal from './Partials/IssueFormModal';
import IssueShowModal from './Partials/IssueShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ issues, books, users, campuses, filters }) {
  const { flash, auth } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [status, setStatus] = useState(filters.status ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    }
    if (flash?.error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
    }
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.library-issues.index'), {
      search, status, per_page: perPage, ...overrides,
    }, { preserveState: true, replace: true });
  }

  const getStatusColor = (status) => {
    switch(status) {
        case 'Issued': return { bg: '#e0f2fe', text: '#0369a1' }; // Blue
        case 'Returned': return { bg: '#dcfce7', text: '#15803d' }; // Green
        case 'Overdue': return { bg: '#fee2e2', text: '#b91c1c' }; // Red
        case 'Lost': return { bg: '#f3f4f6', text: '#374151' }; // Gray
        default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Campus Life &gt; Library</span>
            <h1>Book Issues & Fines</h1>
            <p className="desc">বই ইস্যু, ফেরত গ্রহণ এবং জরিমানার হিসাব পরিচালনা করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Issue Book
            </button>
          </div>
        </div>
      }
    >
      <Head title="Book Issues" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select value={perPage} onChange={(e) => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}>
            <option value="10">10 / page</option>
            <option value="50">50 / page</option>
            <option value="all">Show All</option>
          </select>
          
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search book or user..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>

          <select value={status} onChange={(e) => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}>
            <option value="">All Status</option>
            <option value="Issued">Issued</option>
            <option value="Returned">Returned</option>
            <option value="Overdue">Overdue</option>
            <option value="Lost">Lost</option>
          </select>

          <button className="btn btn-outline" onClick={() => applyFilters()}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Borrower (User)</th>
                <th>Book Details</th>
                <th>Issue & Due Date</th>
                <th>Fine</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.data.length === 0 && (
                <tr><td colSpan={6} className="mm-empty">কোনো বই ইস্যুর রেকর্ড পাওয়া যায়নি।</td></tr>
              )}
              {issues.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="mm-label-cell">
                      <Icon name="user" className="mm-row-icon" />
                      <div>
                        <div style={{ fontWeight: 500, color: '#111827' }}>{item.user?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{item.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{item.book?.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>ISBN: {item.book?.isbn_no || 'N/A'}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>Issue: {item.issue_date}</div>
                    <div style={{ fontSize: '0.85rem', color: '#b91c1c' }}>Due: {item.due_date}</div>
                  </td>
                  <td><strong style={{ color: item.fine_amount > 0 ? '#b91c1c' : '#374151' }}>৳ {item.fine_amount}</strong></td>
                  <td>
                    <span style={{ 
                        backgroundColor: getStatusColor(item.status).bg, 
                        color: getStatusColor(item.status).text,
                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" title="View" onClick={() => setViewingItem(item)}>
                        <Icon name="eye" />
                      </button>
                      <button className="icon-btn" title="Edit / Return" onClick={() => { setEditingItem(item); setFormOpen(true); }}>
                        <Icon name="edit" />
                      </button>
                      <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => setDeletingItem(item)}>
                        <Icon name="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={issues} />
      </div>

      {formOpen && <IssueFormModal item={editingItem} books={books} users={users} campuses={campuses} activeCampusId={auth?.active_campus_id} onClose={() => setFormOpen(false)} />}

      {viewingItem && <IssueShowModal item={viewingItem} onClose={() => setViewingItem(null)} />}

      {deletingItem && (
        <ConfirmDeleteModal item={{ name: `Issue record for ${deletingItem.book?.title}` }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.library-issues.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}