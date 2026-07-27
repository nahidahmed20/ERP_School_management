import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import CourseFormModal from './Partials/CourseFormModal';
import CourseShowModal from './Partials/CourseShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ courses, classes, subjects, teachers, campuses, filters }) {
  const { flash, auth } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [classId, setClassId] = useState(filters.class_id ?? '');
  const [subjectId, setSubjectId] = useState(filters.subject_id ?? '');
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
    router.get(route('admin.lms.courses.index'), {
      search, class_id: classId, subject_id: subjectId, per_page: perPage, ...overrides,
    }, { preserveState: true, replace: true });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">LMS (Learning Management)</span>
            <h1>Courses</h1>
            <p className="desc">স্টুডেন্টদের জন্য বিষয়ভিত্তিক কোর্স তৈরি ও পরিচালনা করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Create Course
            </button>
          </div>
        </div>
      }
    >
      <Head title="Courses" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select value={perPage} onChange={(e) => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}>
            <option value="10">10 / page</option>
            <option value="50">50 / page</option>
            <option value="all">Show All</option>
          </select>

          <div className="search">
            <Icon name="search" />
            <input placeholder="Search course title..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>

          <select value={classId} onChange={(e) => { setClassId(e.target.value); applyFilters({ class_id: e.target.value }); }}>
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select value={subjectId} onChange={(e) => { setSubjectId(e.target.value); applyFilters({ subject_id: e.target.value }); }}>
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
          </select>

          <button className="btn btn-outline" onClick={() => applyFilters()}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Course Title</th>
                <th>Class & Subject</th>
                <th>Instructor</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.data.length === 0 && (
                <tr><td colSpan={5} className="mm-empty">কোনো কোর্স পাওয়া যায়নি।</td></tr>
              )}
              {courses.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="mm-label-cell">
                      <Icon name="book-open" className="mm-row-icon" />
                      <span style={{ fontWeight: 500, color: '#111827' }}>{item.title}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{item.school_class?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{item.subject?.name}</div>
                  </td>
                  <td>
                    {item.teacher ? (
                      <span style={{ color: '#374151', fontWeight: 500 }}>{item.teacher.name}</span>
                    ) : (
                      <span style={{ color: '#9CA3AF' }}>Not Assigned</span>
                    )}
                  </td>
                  <td>
                    <span className={`mm-status ${item.is_published ? 'is-active' : 'is-inactive'}`} style={{ backgroundColor: item.is_published ? '#dcfce7' : '#fef3c7', color: item.is_published ? '#15803d' : '#d97706' }}>
                      {item.is_published ? 'Published' : 'Draft'}
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
        <Pagination meta={courses} />
      </div>

      {formOpen && <CourseFormModal item={editingItem} classes={classes} subjects={subjects} teachers={teachers} campuses={campuses} activeCampusId={auth?.active_campus_id} onClose={() => setFormOpen(false)} />}

      {viewingItem && <CourseShowModal item={viewingItem} onClose={() => setViewingItem(null)} />}

      {deletingItem && (
        <ConfirmDeleteModal item={{ name: `Course: ${deletingItem.title}` }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.lms.courses.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}
