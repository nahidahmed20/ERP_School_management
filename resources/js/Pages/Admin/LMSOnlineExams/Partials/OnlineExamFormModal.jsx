import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function OnlineExamFormModal({ item, classes, subjects, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    title: item?.title ?? '',
    school_class_id: item?.school_class_id ?? '',
    subject_id: item?.subject_id ?? '',
    exam_date: item?.exam_date ?? new Date().toISOString().split('T')[0],
    start_time: item?.start_time ?? '10:00',
    end_time: item?.end_time ?? '11:00',
    duration_minutes: item?.duration_minutes ?? 60,
    total_marks: item?.total_marks ?? 100,
    passing_marks: item?.passing_marks ?? 33,
    description: item?.description ?? '',
    is_published: item?.is_published ?? false,
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.lms.exams.update', item.id), options);
    else post(route('admin.lms.exams.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Online Exam' : 'Create Online Exam'}</h3>
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
              <span>Exam Title *</span>
              <input value={data.title} onChange={(e) => setData('title', e.target.value)} autoFocus required placeholder='e.g. "Monthly MCQ Test - Physics"' />
              {errors.title && <em>{errors.title}</em>}
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

            <label>
              <span>Exam Date *</span>
              <input type="date" value={data.exam_date} onChange={(e) => setData('exam_date', e.target.value)} required />
              {errors.exam_date && <em>{errors.exam_date}</em>}
            </label>

            <label>
              <span>Duration (Minutes) *</span>
              <input type="number" value={data.duration_minutes} onChange={(e) => setData('duration_minutes', e.target.value)} min="1" required />
              {errors.duration_minutes && <em>{errors.duration_minutes}</em>}
            </label>

            <label>
              <span>Start Time *</span>
              <input type="time" value={data.start_time} onChange={(e) => setData('start_time', e.target.value)} required />
              {errors.start_time && <em>{errors.start_time}</em>}
            </label>

            <label>
              <span>End Time *</span>
              <input type="time" value={data.end_time} onChange={(e) => setData('end_time', e.target.value)} required />
              {errors.end_time && <em>{errors.end_time}</em>}
            </label>

            <label>
              <span>Total Marks *</span>
              <input type="number" value={data.total_marks} onChange={(e) => setData('total_marks', e.target.value)} min="0" step="0.01" required />
              {errors.total_marks && <em>{errors.total_marks}</em>}
            </label>

            <label>
              <span>Passing Marks *</span>
              <input type="number" value={data.passing_marks} onChange={(e) => setData('passing_marks', e.target.value)} min="0" step="0.01" required />
              {errors.passing_marks && <em>{errors.passing_marks}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Instructions / Description (Optional)</span>
              <textarea rows="2" value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="Exam rules, notes for students..." />
            </label>

            <label className="mm-checkbox">
              <input type="checkbox" checked={data.is_published} onChange={(e) => setData('is_published', e.target.checked)} />
              <span>Publish (Students can see it)</span>
            </label>

            <label className="mm-checkbox">
              <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
              <span>Active Status</span>
            </label>

          </div>

          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : (isEdit ? 'Update Exam' : 'Save Exam')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
