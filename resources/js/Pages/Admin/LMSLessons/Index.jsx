import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import LessonFormModal from './Partials/LessonFormModal';
import LessonShowModal from './Partials/LessonShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ lessons, courses, campuses, filters }) {
  const { flash, auth } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [courseId, setCourseId] = useState(filters.course_id ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    }
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.lms.lessons.index'), {
      search, course_id: courseId, per_page: perPage, ...overrides,
    }, { preserveState: true, replace: true });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">LMS (Learning Management)</span>
            <h1>Lessons & Study Materials</h1>
            <p className="desc">কোর্সের জন্য ভিডিও লেসন এবং পিডিএফ ম্যাটেরিয়াল আপলোড করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Add Lesson
            </button>
          </div>
        </div>
      }
    >
      <Head title="Lessons & Materials" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select value={perPage} onChange={(e) => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}>
            <option value="10">10 / page</option>
            <option value="50">50 / page</option>
            <option value="all">Show All</option>
          </select>

          <div className="search">
            <Icon name="search" />
            <input placeholder="Search lesson title..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>

          <select value={courseId} onChange={(e) => { setCourseId(e.target.value); applyFilters({ course_id: e.target.value }); }}>
            <option value="">All Courses</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>

          <button className="btn btn-outline" onClick={() => applyFilters()}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Lesson Title</th>
                <th>Course Name</th>
                <th>Materials</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lessons.data.length === 0 && (
                <tr><td colSpan={5} className="mm-empty">কোনো লেসন বা ম্যাটেরিয়াল পাওয়া যায়নি।</td></tr>
              )}
              {lessons.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="mm-label-cell">
                      <Icon name="play-circle" className="mm-row-icon" />
                      <span style={{ fontWeight: 500, color: '#111827' }}>{item.title}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: '#374151' }}>{item.course?.title}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {item.video_url && <span style={{ padding: '3px 6px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '4px', fontSize: '11px' }}>Video</span>}
                      {item.document_path && <span style={{ padding: '3px 6px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontSize: '11px' }}>File / PDF</span>}
                      {!item.video_url && !item.document_path && <span style={{ color: '#9CA3AF', fontSize: '12px' }}>Text Only</span>}
                    </div>
                  </td>
                  <td>
                    <span className={`mm-status ${item.is_active ? 'is-active' : 'is-inactive'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" title="View" onClick={() => setViewingItem(item)}>
                        <Icon name="eye" />
                      </button>
                      <button className="icon-btn" title="Edit" onClick={() => { setEditingItem(item); setFormOpen(true); }}>
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
        <Pagination meta={lessons} />
      </div>

      {formOpen && <LessonFormModal item={editingItem} courses={courses} campuses={campuses} activeCampusId={auth?.active_campus_id} onClose={() => setFormOpen(false)} />}

      {viewingItem && <LessonShowModal item={viewingItem} onClose={() => setViewingItem(null)} />}

      {deletingItem && (
        <ConfirmDeleteModal item={{ name: `Lesson: ${deletingItem.title}` }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.lms.lessons.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}
