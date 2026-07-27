import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function AttemptFormModal({ item, exams, students, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    online_exam_id: item?.online_exam_id ?? '',
    student_id: item?.student_id ?? '',
    attempt_date: item?.attempt_date ?? new Date().toISOString().split('T')[0],
    obtained_marks: item?.obtained_marks ?? '',
    status: item?.status ?? 'Pending Evaluation',
    admin_remarks: item?.admin_remarks ?? '',
  });

  const handleMarksChange = (e) => {
    const marks = parseFloat(e.target.value) || 0;
    const selectedExam = exams.find(ex => ex.id == data.online_exam_id);

    let newStatus = data.status;
    if (selectedExam) {
        newStatus = marks >= selectedExam.passing_marks ? 'Passed' : 'Failed';
    }

    setData(prev => ({
        ...prev,
        obtained_marks: marks,
        status: newStatus
    }));
  };

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.lms.quizattempts.update', item.id), options);
    else post(route('admin.lms.quizattempts.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Evaluate / Edit Result' : 'Manual Result Entry'}</h3>
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

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Select Exam *</span>
              <select value={data.online_exam_id} onChange={(e) => setData('online_exam_id', e.target.value)} disabled={isEdit} required>
                <option value="" disabled>-- Choose Exam --</option>
                {exams?.map(e => <option key={e.id} value={e.id}>{e.title} (Total: {e.total_marks}, Pass: {e.passing_marks})</option>)}
              </select>
              {errors.online_exam_id && <em>{errors.online_exam_id}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Select Student *</span>
              <select value={data.student_id} onChange={(e) => setData('student_id', e.target.value)} disabled={isEdit} required>
                <option value="" disabled>-- Search Student --</option>
                {students?.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
              </select>
              {errors.student_id && <em>{errors.student_id}</em>}
            </label>

            <label>
              <span>Attempt Date *</span>
              <input type="date" value={data.attempt_date} onChange={(e) => setData('attempt_date', e.target.value)} required />
              {errors.attempt_date && <em>{errors.attempt_date}</em>}
            </label>

            <label>
              <span>Obtained Marks *</span>
              <input type="number" value={data.obtained_marks} onChange={handleMarksChange} min="0" step="0.01" required />
              {errors.obtained_marks && <em>{errors.obtained_marks}</em>}
            </label>

            <label>
              <span>Status</span>
              <select value={data.status} onChange={(e) => setData('status', e.target.value)}>
                <option value="Passed">Passed</option>
                <option value="Failed">Failed</option>
                <option value="Pending Evaluation">Pending Evaluation</option>
              </select>
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Teacher Remarks / Feedback</span>
              <textarea rows="2" value={data.admin_remarks} onChange={(e) => setData('admin_remarks', e.target.value)} placeholder="Provide feedback to the student..." />
            </label>

          </div>

          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : (isEdit ? 'Update Result' : 'Save Entry')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
