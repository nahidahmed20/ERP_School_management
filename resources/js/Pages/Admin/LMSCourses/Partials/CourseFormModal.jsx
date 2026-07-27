import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function CourseFormModal({ item, classes, subjects, teachers, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    title: item?.title ?? '',
    school_class_id: item?.school_class_id ?? '',
    subject_id: item?.subject_id ?? '',
    teacher_id: item?.teacher_id ?? '',
    description: item?.description ?? '',
    is_published: item?.is_published ?? false,
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.lms.courses.update', item.id), options);
    else post(route('admin.lms.courses.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Course' : 'Create New Course'}</h3>
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
              <span>Course Title *</span>
              <input value={data.title} onChange={(e) => setData('title', e.target.value)} autoFocus required placeholder='e.g. "Physics Crash Course - 2026"' />
              {errors.title && <em>{errors.title}</em>}
            </label>

            <label>
              <span>Target Class *</span>
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
              <span>Course Instructor (Teacher)</span>
              <select value={data.teacher_id} onChange={(e) => setData('teacher_id', e.target.value)}>
                <option value="">-- No Instructor Assigned --</option>
                {teachers?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Course Description (Overview)</span>
              <textarea rows="3" value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="What will students learn from this course?" />
            </label>

            <label className="mm-checkbox">
              <input type="checkbox" checked={data.is_published} onChange={(e) => setData('is_published', e.target.checked)} />
              <span>Publish (Visible to Students)</span>
            </label>

            <label className="mm-checkbox">
              <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
              <span>Active Status</span>
            </label>

          </div>

          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : (isEdit ? 'Update Course' : 'Save Course')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
