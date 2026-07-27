import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import QuestionFormModal from './Partials/QuestionFormModal';
import QuestionShowModal from './Partials/QuestionShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ questions, classes, subjects, campuses, filters }) {
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
    router.get(route('admin.lms.questions.index'), {
      search, class_id: classId, subject_id: subjectId, per_page: perPage, ...overrides,
    }, { preserveState: true, replace: true });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">LMS (Learning Management)</span>
            <h1>Question Bank</h1>
            <p className="desc">পরীক্ষার জন্য বিষয়ভিত্তিক প্রশ্নব্যাংক তৈরি ও পরিচালনা করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Add Question
            </button>
          </div>
        </div>
      }
    >
      <Head title="Question Bank" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select value={perPage} onChange={(e) => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}>
            <option value="10">10 / page</option>
            <option value="50">50 / page</option>
            <option value="all">Show All</option>
          </select>

          <div className="search" style={{ flexGrow: 1, minWidth: '200px' }}>
            <Icon name="search" />
            <input placeholder="Search questions..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
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
                <th>Question</th>
                <th>Class & Subject</th>
                <th>Type / Marks</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.data.length === 0 && (
                <tr><td colSpan={5} className="mm-empty">কোনো প্রশ্ন পাওয়া যায়নি।</td></tr>
              )}
              {questions.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="mm-label-cell" style={{ alignItems: 'flex-start' }}>
                      <Icon name="help-circle" className="mm-row-icon" style={{ marginTop: '2px' }} />
                      <div>
                        <div style={{ fontWeight: 500, color: '#111827', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item.question}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{item.school_class?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{item.subject?.name}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{item.question_type}</div>
                    <div style={{ fontSize: '0.85rem', color: '#047857', fontWeight: 'bold' }}>Marks: {item.marks}</div>
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
        <Pagination meta={questions} />
      </div>

      {formOpen && <QuestionFormModal item={editingItem} classes={classes} subjects={subjects} campuses={campuses} activeCampusId={auth?.active_campus_id} onClose={() => setFormOpen(false)} />}

      {viewingItem && <QuestionShowModal item={viewingItem} onClose={() => setViewingItem(null)} />}

      {deletingItem && (
        <ConfirmDeleteModal item={{ name: 'এই প্রশ্নটি' }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.lms.questions.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}
