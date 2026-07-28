import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import FormModal from './Partials/FormModal';
import ShowModal from './Partials/ShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ interviews, applicants, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [statusFilter, setStatusFilter] = useState(filters.status ?? '');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showItem, setShowItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
      setFormOpen(false);
    }
  }, [flash]);

  const applyFilters = () => {
    router.get(route('admin.recruitment.interviews.index'), { search, status: statusFilter }, { preserveState: true });
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      router.delete(route('admin.recruitment.interviews.destroy', deleteId), {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const handleStatusChange = (id, newStatus) => {
    router.patch(route('admin.recruitment.interviews.update-status', id), {
      status: newStatus
    }, { preserveScroll: true });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Completed': return { bg: '#dcfce7', text: '#15803d' };
      case 'Scheduled': return { bg: '#dbeafe', text: '#1d4ed8' };
      case 'Cancelled': return { bg: '#fee2e2', text: '#b91c1c' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Recruitment</span>
            <h1>Interviews</h1>
            <p className="desc">চাকরিপ্রার্থীদের সাক্ষাৎকারের শিডিউল এবং ফিডব্যাক পরিচালনা করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Schedule Interview
            </button>
          </div>
        </div>
      }
    >
      <Head title="Interviews" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search applicant, interviewer..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>

          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); applyFilters(); }}>
            <option value="">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Interviewer</th>
                <th>Date & Time</th>
                <th>Location</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {interviews.data.length === 0 && (
                <tr><td colSpan={6} className="mm-empty">কোনো ইন্টারভিউ শিডিউল পাওয়া যায়নি।</td></tr>
              )}
              {interviews.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{item.applicant?.name}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{item.applicant?.job_post?.title}</div>
                  </td>
                  <td>{item.interviewer_name}</td>
                  <td>
                    <div style={{ fontWeight: '500' }}>{item.interview_date}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{item.interview_time}</div>
                  </td>
                  <td>{item.location || '-'}</td>
                  <td>
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      style={{
                        backgroundColor: getStatusBadge(item.status).bg,
                        color: getStatusBadge(item.status).text,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        border: '1px solid transparent',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" title="View" onClick={() => setShowItem(item)}><Icon name="eye" /></button>
                      <button className="icon-btn" title="Edit" onClick={() => { setEditingItem(item); setFormOpen(true); }}><Icon name="edit" /></button>
                      <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => setDeleteId(item.id)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={interviews} />
      </div>

      {formOpen && <FormModal item={editingItem} applicants={applicants} onClose={() => setFormOpen(false)} />}
      {showItem && <ShowModal item={showItem} onClose={() => setShowItem(null)} />}

      {deleteId && (
        <ConfirmDeleteModal
          show={Boolean(deleteId)}
          onClose={() => setDeleteId(null)}
          onCancel={() => setDeleteId(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Interview"
          message="আপনি কি নিশ্চিত যে এই ইন্টারভিউ শিডিউলটি মুছে ফেলতে চান?"
        />
      )}

    </AuthenticatedLayout>
  );
}
