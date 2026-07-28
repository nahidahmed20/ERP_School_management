import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import FormModal from './Partials/FormModal';
import ShowModal from './Partials/ShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ offerLetters, applicants, filters }) {
  const { flash, errors } = usePage().props;

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
    if (errors?.applicant_id) {
       Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: errors.applicant_id, showConfirmButton: false, timer: 4000 });
    }
  }, [flash, errors]);

  const applyFilters = () => {
    router.get(route('admin.recruitment.offer-letters.index'), { search, status: statusFilter }, { preserveState: true });
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      router.delete(route('admin.recruitment.offer-letters.destroy', deleteId), {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const handleStatusChange = (id, newStatus) => {
    router.patch(route('admin.recruitment.offer-letters.update-status', id), {
      status: newStatus
    }, { preserveScroll: true });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Accepted': return { bg: '#dcfce7', text: '#15803d' };
      case 'Declined': return { bg: '#fee2e2', text: '#b91c1c' };
      default: return { bg: '#fef3c7', text: '#d97706' }; // Pending
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Recruitment</span>
            <h1>Offer Letters</h1>
            <p className="desc">নির্বাচিত প্রার্থীদের অফার লেটার এবং জয়েনিং স্ট্যাটাস ট্র্যাক করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Create Offer Letter
            </button>
          </div>
        </div>
      }
    >
      <Head title="Offer Letters" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search applicant name..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>

          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); applyFilters(); }}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Declined">Declined</option>
          </select>

          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Salary Offered</th>
                <th>Issue Date</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offerLetters.data.length === 0 && (
                <tr><td colSpan={6} className="mm-empty">কোনো অফার লেটার পাওয়া যায়নি।</td></tr>
              )}
              {offerLetters.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{item.applicant?.name}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{item.applicant?.job_post?.title}</div>
                  </td>
                  <td>{item.salary_offered}</td>
                  <td>{item.issue_date}</td>
                  <td><span className="badge">{item.joining_date}</span></td>
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
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Declined">Declined</option>
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
        <Pagination meta={offerLetters} />
      </div>

      {formOpen && <FormModal item={editingItem} applicants={applicants} onClose={() => setFormOpen(false)} />}
      {showItem && <ShowModal item={showItem} onClose={() => setShowItem(null)} />}

      {deleteId && (
        <ConfirmDeleteModal
          show={Boolean(deleteId)}
          onClose={() => setDeleteId(null)}
          onCancel={() => setDeleteId(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Offer Letter"
          message="আপনি কি নিশ্চিত যে এই অফার লেটারটি মুছে ফেলতে চান?"
        />
      )}

    </AuthenticatedLayout>
  );
}
