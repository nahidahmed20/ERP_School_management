import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function ExamQuestionFormModal({ exams, questions, defaultExamId, onClose }) {

  const { data, setData, post, processing, errors, reset } = useForm({
    online_exam_id: defaultExamId || '',
    question_bank_id: '',
  });

  const selectedExam = exams.find(e => e.id == data.online_exam_id);

  const filteredQuestions = questions.filter(q => {
    if (!selectedExam) return true;
    return q.school_class_id === selectedExam.school_class_id && q.subject_id === selectedExam.subject_id;
  });

  function submit(e) {
    e.preventDefault();
    post(route('admin.lms.exam-questions.store'), {
      onSuccess: () => {
        reset('question_bank_id');
      }
    });
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Assign Question to Exam</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Select Online Exam *</span>
              <select value={data.online_exam_id} onChange={(e) => setData('online_exam_id', e.target.value)} required>
                <option value="" disabled>-- Choose Exam --</option>
                {exams?.map(exam => <option key={exam.id} value={exam.id}>{exam.title}</option>)}
              </select>
              {errors.online_exam_id && <em>{errors.online_exam_id}</em>}
            </label>

            {selectedExam && (
              <div style={{ gridColumn: '1 / -1', padding: '10px', backgroundColor: '#eef2ff', borderRadius: '5px', fontSize: '13px', color: '#4338ca' }}>
                <Icon name="info" style={{ width: '14px', marginRight: '5px', verticalAlign: 'text-bottom' }} />
                Showing questions for: <strong>Class {selectedExam.school_class_id}</strong> (Subject ID: {selectedExam.subject_id})
              </div>
            )}

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Select Question from Bank *</span>
              <select value={data.question_bank_id} onChange={(e) => setData('question_bank_id', e.target.value)} required>
                <option value="" disabled>-- Select a Question --</option>
                {filteredQuestions?.map(q => (
                  <option key={q.id} value={q.id}>
                    [{q.question_type} - {q.marks} Marks] {q.question.substring(0, 100)}...
                  </option>
                ))}
              </select>
              {errors.question_bank_id && <em>{errors.question_bank_id}</em>}
              {filteredQuestions.length === 0 && selectedExam && (
                <em style={{ color: '#b91c1c' }}>No questions found in Question Bank for this Subject and Class!</em>
              )}
            </label>

          </div>

          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Close</button>
            <button type="submit" className="btn" disabled={processing || filteredQuestions.length === 0}>
              {processing ? 'Assigning...' : 'Assign Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
