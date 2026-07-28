import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import FormModal from './Partials/FormModal';
import ShowModal from './Partials/ShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ jobPosts, filters }) {
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
    router.get(route('admin.recruitment.job-posts.index'), { search, status: statusFilter }, { preserveState: true });
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      router.delete(route('admin.recruitment.job-posts.destroy', deleteId), {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Recruitment</span>
            <h1>Job Posts</h1>
            <p className="desc">স্কুলের নতুন নিয়োগ এবং চাকরির বিজ্ঞপ্তিগুলো পরিচালনা করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Create Job Post
            </button>
          </div>
        </div>
      }
    >
      <Head title="Job Posts" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search title or dept..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>

          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); applyFilters(); }}>
            <option value="">All Status</option>
            <option value="Open">Open (চলমান)</option>
            <option value="Closed">Closed (বন্ধ)</option>
          </select>

          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Department</th>
                <th>Type</th>
                <th>Vacancies</th>
                <th>Deadline</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobPosts.data.length === 0 && (
                <tr><td colSpan={7} className="mm-empty">কোনো জব পোস্ট পাওয়া যায়নি।</td></tr>
              )}
              {jobPosts.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{item.title}</strong>
                  </td>
                  <td>{item.department || '-'}</td>
                  <td><span className="badge">{item.employment_type}</span></td>
                  <td>{item.vacancies}</td>
                  <td>{item.deadline}</td>
                  <td>
                    <span style={{ backgroundColor: item.status === 'Open' ? '#dcfce7' : '#fee2e2', color: item.status === 'Open' ? '#15803d' : '#b91c1c', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                      {item.status}
                    </span>
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
        <Pagination meta={jobPosts} />
      </div>

      {formOpen && <FormModal item={editingItem} onClose={() => setFormOpen(false)} />}
      {showItem && <ShowModal item={showItem} onClose={() => setShowItem(null)} />}

      {deleteId && (
        <ConfirmDeleteModal
          show={Boolean(deleteId)}
          onClose={() => setDeleteId(null)}
          onCancel={() => setDeleteId(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Job Post"
          message="আপনি কি নিশ্চিত যে এই জব পোস্টটি মুছে ফেলতে চান? এর সাথে সম্পর্কিত আবেদনগুলোও মুছে যেতে পারে।"
        />
      )}
      
    </AuthenticatedLayout>
  );
}