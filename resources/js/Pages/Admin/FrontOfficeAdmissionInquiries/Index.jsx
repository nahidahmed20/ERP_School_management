import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import FormModal from './Partials/FormModal';
import ShowModal from './Partials/ShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ inquiries, filters }) {
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
    router.get(route('admin.frontoffice.admission-inquiries.index'), { search, status: statusFilter }, { preserveState: true });
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      router.delete(route('admin.frontoffice.admission-inquiries.destroy', deleteId), {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Converted': return { bg: '#dcfce7', text: '#15803d' };
      case 'Follow-up': return { bg: '#dbeafe', text: '#1d4ed8' };
      case 'Cancelled': return { bg: '#fee2e2', text: '#b91c1c' };
      default: return { bg: '#fef3c7', text: '#d97706' }; // Pending
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Front Office</span>
            <h1>Admission Inquiries</h1>
            <p className="desc">সম্ভাব্য শিক্ষার্থীদের ভর্তির খোঁজখবর ও লিড পরিচালনা করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Add Inquiry
            </button>
          </div>
        </div>
      }
    >
      <Head title="Admission Inquiries" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search applicant, guardian or phone..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>

          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); applyFilters(); }}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Converted">Converted (ভর্তি সম্পন্ন)</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Applicant / Guardian</th>
                <th>Phone</th>
                <th>Class Interested</th>
                <th>Inquiry Date</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.data.length === 0 && (
                <tr><td colSpan={6} className="mm-empty">কোনো খোঁজখবর বা ইনকোয়ারি পাওয়া যায়নি।</td></tr>
              )}
              {inquiries.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{item.applicant_name}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>G: {item.guardian_name}</div>
                  </td>
                  <td>{item.phone}</td>
                  <td><span className="badge">{item.class_interested}</span></td>
                  <td>{item.inquiry_date}</td>
                  <td>
                    <span style={{ backgroundColor: getStatusBadge(item.status).bg, color: getStatusBadge(item.status).text, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
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
        <Pagination meta={inquiries} />
      </div>

      {formOpen && <FormModal item={editingItem} onClose={() => setFormOpen(false)} />}
      {showItem && <ShowModal item={showItem} onClose={() => setShowItem(null)} />}

 

      {deleteId && (
        <ConfirmDeleteModal
            show={Boolean(deleteId)}
            onClose={() => setDeleteId(null)}
            onCancel={() => setDeleteId(null)}
            onConfirm={handleDeleteConfirm}
            title="Delete Lesson Plan"
            message="আপনি কি নিশ্চিত যে এই লেসন বা সিলেবাসটি চিরতরে মুছে ফেলতে চান?"
        />
        )}
      
    </AuthenticatedLayout>
  );
}