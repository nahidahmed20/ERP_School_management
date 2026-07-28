import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import FormModal from './Partials/FormModal';
import ShowModal from './Partials/ShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ applicants, jobPosts, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [statusFilter, setStatusFilter] = useState(filters.status ?? '');
  const [jobPostFilter, setJobPostFilter] = useState(filters.job_post_id ?? '');

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
    router.get(route('admin.recruitment.applicants.index'), { 
      search, status: statusFilter, job_post_id: jobPostFilter 
    }, { preserveState: true });
  };


  const handleStatusChange = (id, newStatus) => {
    router.patch(route('admin.recruitment.applicants.update-status', id), {
      status: newStatus
    }, {
      preserveScroll: true, 
    });
  };
  const handleDeleteConfirm = () => {
    if (deleteId) {
      router.delete(route('admin.recruitment.applicants.destroy', deleteId), {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Hired': return { bg: '#dcfce7', text: '#15803d' };
      case 'Shortlisted': return { bg: '#dbeafe', text: '#1d4ed8' };
      case 'Interviewed': return { bg: '#fef3c7', text: '#d97706' };
      case 'Rejected': return { bg: '#fee2e2', text: '#b91c1c' };
      default: return { bg: '#f1f5f9', text: '#475569' }; // Pending
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Recruitment</span>
            <h1>Applicants</h1>
            <p className="desc">চাকরিপ্রার্থীদের আবেদন এবং সিভি পরিচালনা করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Add Applicant
            </button>
          </div>
        </div>
      }
    >
      <Head title="Applicants" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search name, phone or email..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>

          <select value={jobPostFilter} onChange={(e) => { setJobPostFilter(e.target.value); applyFilters(); }}>
            <option value="">All Job Posts</option>
            {jobPosts.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>

          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); applyFilters(); }}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interviewed">Interviewed</option>
            <option value="Hired">Hired</option>
            <option value="Rejected">Rejected</option>
          </select>

          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Applicant Info</th>
                <th>Applied For</th>
                <th>Date</th>
                <th>Resume</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applicants.data.length === 0 && (
                <tr><td colSpan={6} className="mm-empty">কোনো আবেদনকারী পাওয়া যায়নি।</td></tr>
              )}
              {applicants.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{item.name}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{item.phone}</div>
                  </td>
                  <td><span className="badge">{item.job_post?.title}</span></td>
                  <td>{item.applied_date}</td>
                  <td>
                    {item.resume ? (
                      <a href={`/storage/${item.resume}`} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px' }}>
                        <Icon name="download" style={{fontSize: '12px'}}/> View CV
                      </a>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>N/A</span>
                    )}
                  </td>
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
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interviewed">Interviewed</option>
                      <option value="Hired">Hired</option>
                      <option value="Rejected">Rejected</option>
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
        <Pagination meta={applicants} />
      </div>

      {formOpen && <FormModal item={editingItem} jobPosts={jobPosts} onClose={() => setFormOpen(false)} />}
      {showItem && <ShowModal item={showItem} onClose={() => setShowItem(null)} />}

      {deleteId && (
        <ConfirmDeleteModal
          show={Boolean(deleteId)}
          onClose={() => setDeleteId(null)}
          onCancel={() => setDeleteId(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Applicant"
          message="আপনি কি নিশ্চিত যে এই আবেদনকারীর তথ্য মুছে ফেলতে চান?"
        />
      )}
      
    </AuthenticatedLayout>
  );
}