import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import HomeworkFormModal from './Partials/HomeworkFormModal';
import HomeworkShowModal from './Partials/HomeworkShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ homeworks, classes, subjects, campuses, filters }) {
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
    router.get(route('admin.lms.homework.index'), {
      search, class_id: classId, subject_id: subjectId, per_page: perPage, ...overrides,
    }, { preserveState: true, replace: true });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">LMS (Learning Management)</span>
            <h1>Homework & Assignments</h1>
            <p className="desc">স্টুডেন্টদের ক্লাস ও বিষয়ভিত্তিক হোমওয়ার্ক তৈরি করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Add Homework
            </button>
          </div>
        </div>
      }
    >
      <Head title="Homework & Assignments" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select value={perPage} onChange={(e) => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}>
            <option value="10">10 / page</option>
            <option value="50">50 / page</option>
            <option value="all">Show All</option>
          </select>

          <div className="search">
            <Icon name="search" />
            <input placeholder="Search title..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
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
                <th>Title / Assignment</th>
                <th>Class & Subject</th>
                <th>Dates</th>
                <th>Attachment</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {homeworks.data.length === 0 && (
                <tr><td colSpan={5} className="mm-empty">কোনো হোমওয়ার্ক পাওয়া যায়নি।</td></tr>
              )}
              {homeworks.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="mm-label-cell" style={{ alignItems: 'flex-start' }}>
                      <Icon name="edit-3" className="mm-row-icon" style={{ marginTop: '2px' }} />
                      <div>
                        <div style={{ fontWeight: 500, color: '#111827' }}>{item.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Marks: {item.total_marks || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{item.school_class?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{item.subject?.name}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>Given: {item.homework_date}</div>
                    <div style={{ fontSize: '0.85rem', color: '#b91c1c', fontWeight: 'bold' }}>Deadline: {item.submission_date}</div>
                  </td>
                  <td>
                    {item.document_path ? (
                      <span style={{ padding: '3px 8px', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '4px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Icon name="paperclip" style={{ width: '12px' }} /> Attached
                      </span>
                    ) : (
                      <span style={{ color: '#9CA3AF', fontSize: '12px' }}>None</span>
                    )}
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
        <Pagination meta={homeworks} />
      </div>

      {formOpen && <HomeworkFormModal item={editingItem} classes={classes} subjects={subjects} campuses={campuses} activeCampusId={auth?.active_campus_id} onClose={() => setFormOpen(false)} />}

      {viewingItem && <HomeworkShowModal item={viewingItem} onClose={() => setViewingItem(null)} />}

      {deletingItem && (
        <ConfirmDeleteModal item={{ name: `Homework: ${deletingItem.title}` }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.lms.homework.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}
