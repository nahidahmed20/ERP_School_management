import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function QuestionFormModal({ item, classes, subjects, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    school_class_id: item?.school_class_id ?? '',
    subject_id: item?.subject_id ?? '',
    question_type: item?.question_type ?? 'MCQ',
    question: item?.question ?? '',
    option_a: item?.option_a ?? '',
    option_b: item?.option_b ?? '',
    option_c: item?.option_c ?? '',
    option_d: item?.option_d ?? '',
    correct_answer: item?.correct_answer ?? 'a',
    marks: item?.marks ?? 1,
    explanation: item?.explanation ?? '',
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.lms.questions.update', item.id), options);
    else post(route('admin.lms.questions.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Question' : 'Add New Question'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Campus *</span>
              <select value={data.campus_id || ''} onChange={(e) => setData('campus_id', e.target.value)} disabled={!isSuperAdmin} required>
                <option value="" disabled>Select Campus</option>
                {campuses?.map(campus => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
              </select>
              {errors.campus_id && <em>{errors.campus_id}</em>}
            </label>

            <label>
              <span>Class *</span>
              <select value={data.school_class_id} onChange={(e) => setData('school_class_id', e.target.value)} required>
                <option value="" disabled>Select Class</option>
                {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.school_class_id && <em>{errors.school_class_id}</em>}
            </label>

            <label>
              <span>Subject *</span>
              <select value={data.subject_id} onChange={(e) => setData('subject_id', e.target.value)} required>
                <option value="" disabled>Select Subject</option>
                {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {errors.subject_id && <em>{errors.subject_id}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Question Details *</span>
              <textarea rows="3" value={data.question} onChange={(e) => setData('question', e.target.value)} required placeholder="Type your question here..." />
              {errors.question && <em>{errors.question}</em>}
            </label>

            <label>
              <span>Question Type</span>
              <select value={data.question_type} onChange={(e) => setData('question_type', e.target.value)}>
                <option value="MCQ">Multiple Choice (MCQ)</option>
                <option value="True/False">True / False</option>
              </select>
            </label>

            <label>
              <span>Marks *</span>
              <input type="number" value={data.marks} onChange={(e) => setData('marks', e.target.value)} min="0.1" step="0.1" required />
            </label>

            {/* MCQ Options Block */}
            {data.question_type === 'MCQ' && (
              <>
                <div style={{ gridColumn: '1 / -1', marginTop: '10px', marginBottom: '5px', fontWeight: 'bold', color: '#4B5563' }}>Options:</div>
                <label>
                  <span>Option A</span>
                  <input value={data.option_a} onChange={(e) => setData('option_a', e.target.value)} placeholder="A" />
                </label>
                <label>
                  <span>Option B</span>
                  <input value={data.option_b} onChange={(e) => setData('option_b', e.target.value)} placeholder="B" />
                </label>
                <label>
                  <span>Option C</span>
                  <input value={data.option_c} onChange={(e) => setData('option_c', e.target.value)} placeholder="C" />
                </label>
                <label>
                  <span>Option D</span>
                  <input value={data.option_d} onChange={(e) => setData('option_d', e.target.value)} placeholder="D" />
                </label>
              </>
            )}

            {/* Correct Answer Dropdown */}
            <label style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
              <span>Correct Answer *</span>
              <select value={data.correct_answer} onChange={(e) => setData('correct_answer', e.target.value)} required>
                {data.question_type === 'MCQ' ? (
                  <>
                    <option value="a">Option A</option>
                    <option value="b">Option B</option>
                    <option value="c">Option C</option>
                    <option value="d">Option D</option>
                  </>
                ) : (
                  <>
                    <option value="True">True</option>
                    <option value="False">False</option>
                  </>
                )}
              </select>
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Explanation (Optional)</span>
              <textarea rows="2" value={data.explanation} onChange={(e) => setData('explanation', e.target.value)} placeholder="Explain why this answer is correct..." />
            </label>

            <label className="mm-checkbox" style={{ gridColumn: '1 / -1' }}>
              <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
              <span>Active Question</span>
            </label>

          </div>

          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : (isEdit ? 'Update Question' : 'Save Question')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
