import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import FormModal from './Partials/FormModal';
import ShowModal from './Partials/ShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ lessons, classes, subjects, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [classId, setClassId] = useState(filters.class_id ?? '');
  const [subjectId, setSubjectId] = useState(filters.subject_id ?? '');

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
    router.get(route('admin.lesson-plans.index'), { search, class_id: classId, subject_id: subjectId }, { preserveState: true });
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      router.delete(route('admin.lesson-plans.destroy', deleteId), {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const getStatusColor = (s) => {
    if (s === 'Completed') return { bg: '#dcfce7', text: '#15803d' };
    if (s === 'Ongoing') return { bg: '#dbeafe', text: '#1d4ed8' };
    return { bg: '#fef3c7', text: '#d97706' };
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Academics</span>
            <h1>Lesson & Syllabus</h1>
            <p className="desc">শ্রেণি ও বিষয়ভিত্তিক সিলেবাস এবং লেসন প্ল্যান তৈরি করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Add Lesson
            </button>
          </div>
        </div>
      }
    >
      <Head title="Lesson & Syllabus" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search title..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>

          <select value={classId} onChange={(e) => { setClassId(e.target.value); applyFilters(); }}>
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          
          <select value={subjectId} onChange={(e) => { setSubjectId(e.target.value); applyFilters(); }}>
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
          </select>

          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Title / Topic</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Attachment</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lessons.data.length === 0 && (
                <tr><td colSpan={6} className="mm-empty">কোনো লেসন বা সিলেবাস পাওয়া যায়নি।</td></tr>
              )}
              {lessons.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{item.title}</strong>
                  </td>
                  <td><span className="badge">{item.school_class?.name}</span></td>
                  <td>{item.subject?.name}</td>
                  <td>
                    {item.attachment ? (
                      <a href={`/storage/${item.attachment}`} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px' }}>
                        <Icon name="download" style={{fontSize: '12px'}}/> View File
                      </a>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>N/A</span>
                    )}
                  </td>
                  <td>
                    <span style={{ backgroundColor: getStatusColor(item.status).bg, color: getStatusColor(item.status).text, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
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
        <Pagination meta={lessons} />
      </div>

      {/* Modals */}
      {formOpen && <FormModal item={editingItem} classes={classes} subjects={subjects} onClose={() => setFormOpen(false)} />}
      {showItem && <ShowModal item={showItem} onClose={() => setShowItem(null)} />}

      {/* Reusable Confirm Delete Modal */}
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