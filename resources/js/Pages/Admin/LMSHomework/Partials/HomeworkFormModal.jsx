import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function HomeworkFormModal({ item, classes, subjects, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    title: item?.title ?? '',
    school_class_id: item?.school_class_id ?? '',
    subject_id: item?.subject_id ?? '',
    homework_date: item?.homework_date ?? new Date().toISOString().split('T')[0],
    submission_date: item?.submission_date ?? '',
    total_marks: item?.total_marks ?? '',
    description: item?.description ?? '',
    document: null, // For File Upload
    is_active: item?.is_active ?? true,
    _method: isEdit ? 'put' : 'post', 
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };

    if (isEdit) {
        post(route('admin.lms.homework.update', item.id), options);
    } else {
        post(route('admin.lms.homework.store'), options);
    }
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Homework' : 'Add New Homework'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <form onSubmit={submit} className="mm-form" encType="multipart/form-data">
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
              <span>Homework Title *</span>
              <input value={data.title} onChange={(e) => setData('title', e.target.value)} autoFocus required placeholder="e.g. Essay Writing on Environment" />
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
              <span>Homework Date (Given) *</span>
              <input type="date" value={data.homework_date} onChange={(e) => setData('homework_date', e.target.value)} required />
              {errors.homework_date && <em>{errors.homework_date}</em>}
            </label>

            <label>
              <span>Submission Deadline *</span>
              <input type="date" value={data.submission_date} onChange={(e) => setData('submission_date', e.target.value)} required />
              {errors.submission_date && <em>{errors.submission_date}</em>}
            </label>

            <label>
              <span>Total Marks (Optional)</span>
              <input type="number" value={data.total_marks} onChange={(e) => setData('total_marks', e.target.value)} min="0" step="0.5" />
            </label>

            <label>
              <span>Attachment (PDF/Image)</span>
              <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip" onChange={(e) => setData('document', e.target.files[0])} />
              {errors.document && <em>{errors.document}</em>}
              {isEdit && item.document_path && (
                <div style={{ fontSize: '11px', color: '#047857', marginTop: '4px' }}>
                   A file is already attached. Upload a new one to replace it.
                </div>
              )}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Homework Description / Details</span>
              <textarea rows="4" value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="Write homework instructions here..." />
            </label>

            <label className="mm-checkbox" style={{ gridColumn: '1 / -1' }}>
              <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
              <span>Active Status</span>
            </label>

          </div>

          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : (isEdit ? 'Update Homework' : 'Save Homework')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
