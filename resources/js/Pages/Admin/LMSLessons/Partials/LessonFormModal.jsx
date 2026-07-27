import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function LessonFormModal({ item, courses, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    course_id: item?.course_id ?? '',
    title: item?.title ?? '',
    description: item?.description ?? '',
    video_url: item?.video_url ?? '',
    document: null, // File input
    is_active: item?.is_active ?? true,
    _method: isEdit ? 'put' : 'post', 
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };

    if (isEdit) {
        post(route('admin.lms.lessons.update', item.id), options);
    } else {
        post(route('admin.lms.lessons.store'), options);
    }
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Lesson' : 'Add New Lesson'}</h3>
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
              <span>Select Course *</span>
              <select value={data.course_id} onChange={(e) => setData('course_id', e.target.value)} required>
                <option value="" disabled>-- Choose Course --</option>
                {courses?.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              {errors.course_id && <em>{errors.course_id}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Lesson Title *</span>
              <input value={data.title} onChange={(e) => setData('title', e.target.value)} autoFocus required placeholder="e.g. Chapter 1: Introduction to Mechanics" />
              {errors.title && <em>{errors.title}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Video Link (YouTube / Vimeo)</span>
              <input type="url" value={data.video_url} onChange={(e) => setData('video_url', e.target.value)} placeholder="https://youtube.com/watch?v=..." />
              {errors.video_url && <em>{errors.video_url}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Upload PDF / Document Material (Optional)</span>
              <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.zip" onChange={(e) => setData('document', e.target.files[0])} />
              {errors.document && <em>{errors.document}</em>}
              {isEdit && item.document_path && (
                <div style={{ fontSize: '12px', color: '#047857', marginTop: '5px' }}>
                   A file is already uploaded. Selecting a new one will replace it.
                </div>
              )}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Description / Reading Text</span>
              <textarea rows="4" value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="Lesson details, text materials or notes..." />
            </label>

            <label className="mm-checkbox" style={{ gridColumn: '1 / -1' }}>
              <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
              <span>Active Status (Visible to students)</span>
            </label>

          </div>

          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : (isEdit ? 'Update Lesson' : 'Save Lesson')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
