import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ExamQuestionFormModal from './Partials/ExamQuestionFormModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ examQuestions, exams, questions, filters }) {
  const { flash } = usePage().props;

  const [examId, setExamId] = useState(filters.exam_id ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [formOpen, setFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    }
    if (flash?.error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
    }
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.lms.exam-questions.index'), {
      exam_id: examId, per_page: perPage, ...overrides,
    }, { preserveState: true, replace: true });
  }

  // Selected Exam Details
  const currentExam = exams.find(e => e.id == examId);

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">LMS (Learning Management)</span>
            <h1>Assign Exam Questions</h1>
            <p className="desc">পরীক্ষার জন্য প্রশ্নব্যাংক থেকে প্রশ্ন যুক্ত করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => setFormOpen(true)}>
              <Icon name="plus" /> Assign Question
            </button>
          </div>
        </div>
      }
    >
      <Head title="Exam Questions" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={perPage} onChange={(e) => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}>
            <option value="10">10 / page</option>
            <option value="50">50 / page</option>
            <option value="all">Show All</option>
          </select>

          <select value={examId} onChange={(e) => { setExamId(e.target.value); applyFilters({ exam_id: e.target.value }); }} style={{ flexGrow: 1, minWidth: '250px' }}>
            <option value="">-- Select Exam to Filter --</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>

          <button className="btn btn-outline" onClick={() => applyFilters()}>Filter</button>
        </div>

        {examId && currentExam && (
          <div style={{ padding: '15px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', marginBottom: '15px' }}>
            <strong style={{ color: '#166534' }}>Currently viewing questions for: </strong>
            <span style={{ color: '#15803d' }}>{currentExam.title} (Total Exam Marks: {currentExam.total_marks})</span>
          </div>
        )}

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Exam Name</th>
                <th>Question</th>
                <th>Type</th>
                <th>Marks</th>
                <th className="mm-actions-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {examQuestions.data.length === 0 && (
                <tr><td colSpan={5} className="mm-empty">এই পরীক্ষায় এখনো কোনো প্রশ্ন যুক্ত করা হয়নি।</td></tr>
              )}
              {examQuestions.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{item.exam?.title}</div>
                  </td>
                  <td>
                    <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: '#374151' }}>
                      {item.question?.question}
                    </div>
                  </td>
                  <td>{item.question?.question_type}</td>
                  <td><strong style={{ color: '#047857' }}>{item.question?.marks}</strong></td>
                  <td>
                    <div className="mm-row-actions">
                      {/* Only Delete button needed for pivot table */}
                      <button className="icon-btn icon-btn-danger" title="Remove from Exam" onClick={() => setDeletingItem(item)}>
                        <Icon name="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={examQuestions} />
      </div>

      {formOpen && <ExamQuestionFormModal exams={exams} questions={questions} defaultExamId={examId} onClose={() => setFormOpen(false)} />}

      {deletingItem && (
        <ConfirmDeleteModal item={{ name: 'এক্সাম থেকে এই প্রশ্নটি' }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.lms.exam-questions.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}
