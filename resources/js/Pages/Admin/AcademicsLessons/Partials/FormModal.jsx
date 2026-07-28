import { useForm, router } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, classes, subjects, onClose }) {
  const isEdit = !!item;
  
  const { data, setData, post, processing, errors } = useForm({
    class_id: item?.class_id || '',
    subject_id: item?.subject_id || '',
    title: item?.title || '',
    description: item?.description || '',
    status: item?.status || 'Pending',
    attachment: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      // Laravel file upload via PUT/POST workaround
      router.post(route('admin.lesson-plans.update', item.id), {
        ...data,
        _method: 'PUT',
      }, {
        onSuccess: () => onClose(),
      });
    } else {
      post(route('admin.lesson-plans.store'));
    }
  };

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Lesson' : 'Add New Lesson'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mm-form">
          <div className="mm-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Select Class *</span>
                <select value={data.class_id} onChange={(e) => setData('class_id', e.target.value)} required>
                  <option value="">-- ক্লাস --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.class_id && <em>{errors.class_id}</em>}
              </label>

              <label>
                <span>Select Subject *</span>
                <select value={data.subject_id} onChange={(e) => setData('subject_id', e.target.value)} required>
                  <option value="">-- বিষয় --</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {errors.subject_id && <em>{errors.subject_id}</em>}
              </label>
            </div>

            <label>
              <span>Lesson Title / Topic Name *</span>
              <input value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="e.g. Chapter 1: Introduction" required />
              {errors.title && <em>{errors.title}</em>}
            </label>

            <label>
              <span>Description / Notes</span>
              <textarea rows="3" value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="এই লেসনে কী কী পড়ানো হবে..." />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Status *</span>
                <select value={data.status} onChange={(e) => setData('status', e.target.value)} required>
                  <option value="Pending">Pending (পড়ানো বাকি)</option>
                  <option value="Ongoing">Ongoing (চলমান)</option>
                  <option value="Completed">Completed (শেষ হয়েছে)</option>
                </select>
              </label>

              <label>
                <span>Attach Syllabus File (Optional)</span>
                <input type="file" onChange={(e) => setData('attachment', e.target.files[0])} style={{ padding: '7px', background: '#f8fafc', border: '1px dashed #cbd5e1' }} accept=".pdf,.doc,.docx,.jpg,.png" />
                {errors.attachment && <em>{errors.attachment}</em>}
              </label>
            </div>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : 'Save Lesson'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}