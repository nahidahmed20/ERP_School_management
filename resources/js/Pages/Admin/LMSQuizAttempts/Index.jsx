import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import AttemptFormModal from './Partials/AttemptFormModal';
import AttemptShowModal from './Partials/AttemptShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ attempts, exams, students, campuses, filters }) {
  const { flash, auth } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [examId, setExamId] = useState(filters.exam_id ?? '');
  const [status, setStatus] = useState(filters.status ?? '');
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
    router.get(route('admin.lms.quizattempts.index'), {
      search, exam_id: examId, status, per_page: perPage, ...overrides,
    }, { preserveState: true, replace: true });
  }

  const getStatusColor = (status) => {
    switch(status) {
        case 'Passed': return { bg: '#dcfce7', text: '#15803d' }; // Green
        case 'Failed': return { bg: '#fee2e2', text: '#b91c1c' }; // Red
        case 'Pending Evaluation': return { bg: '#fef3c7', text: '#d97706' }; // Yellow
        default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">LMS (Learning Management)</span>
            <h1>Quiz Attempts / Exam Results</h1>
            <p className="desc">স্টুডেন্টদের অনলাইন পরীক্ষার ফলাফল দেখুন এবং মূল্যায়ন করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Manual Entry
            </button>
          </div>
        </div>
      }
    >
      <Head title="Quiz Attempts" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select value={perPage} onChange={(e) => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}>
            <option value="10">10 / page</option>
            <option value="50">50 / page</option>
            <option value="all">Show All</option>
          </select>

          <div className="search">
            <Icon name="search" />
            <input placeholder="Search student or exam..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>

          <select value={examId} onChange={(e) => { setExamId(e.target.value); applyFilters({ exam_id: e.target.value }); }}>
            <option value="">All Exams</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>

          <select value={status} onChange={(e) => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}>
            <option value="">All Status</option>
            <option value="Passed">Passed</option>
            <option value="Failed">Failed</option>
            <option value="Pending Evaluation">Pending</option>
          </select>

          <button className="btn btn-outline" onClick={() => applyFilters()}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Exam Title</th>
                <th>Attempt Date</th>
                <th>Marks Obtained</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {attempts.data.length === 0 && (
                <tr><td colSpan={6} className="mm-empty">কোনো পরীক্ষার ফলাফল পাওয়া যায়নি।</td></tr>
              )}
              {attempts.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="mm-label-cell">
                      <Icon name="user" className="mm-row-icon" />
                      <div>
                        <div style={{ fontWeight: 500, color: '#111827' }}>{item.student?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{item.student?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{item.exam?.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Total Marks: {item.exam?.total_marks}</div>
                  </td>
                  <td>{item.attempt_date}</td>
                  <td>
                    <strong style={{ color: item.status === 'Passed' ? '#047857' : (item.status === 'Failed' ? '#b91c1c' : '#d97706') }}>
                      {item.obtained_marks}
                    </strong>
                  </td>
                  <td>
                    <span style={{
                        backgroundColor: getStatusColor(item.status).bg,
                        color: getStatusColor(item.status).text,
                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" title="View" onClick={() => setViewingItem(item)}>
                        <Icon name="eye" />
                      </button>
                      <button className="icon-btn" title="Evaluate / Edit" onClick={() => { setEditingItem(item); setFormOpen(true); }}>
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
        <Pagination meta={attempts} />
      </div>

      {formOpen && <AttemptFormModal item={editingItem} exams={exams} students={students} campuses={campuses} activeCampusId={auth?.active_campus_id} onClose={() => setFormOpen(false)} />}

      {viewingItem && <AttemptShowModal item={viewingItem} onClose={() => setViewingItem(null)} />}

      {deletingItem && (
        <ConfirmDeleteModal item={{ name: `${deletingItem.student?.name}'s result` }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.lms.quizattempts.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}
