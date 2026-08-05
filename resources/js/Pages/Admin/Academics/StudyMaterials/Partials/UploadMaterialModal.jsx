import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function UploadMaterialModal({ classes, subjects, onClose }) {
  const { data, setData, post, processing, reset, errors } = useForm({
    title: '',
    class_id: '',
    subject_id: '',
    description: '',
    file: null,
  });

  function submit(e) {
    e.preventDefault();
    post(route('admin.study-materials.store'), {
      onSuccess: () => { reset(); onClose(); },
      forceFormData: true, // Required for file uploads
    });
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={e => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Upload Study Material</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">

            <label style={{ gridColumn: '1 / -1' }}><span>Material Title *</span>
              <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} required placeholder="e.g. Chapter 1 Biology Notes" />
              {errors.title && <span className="text-red-500 text-xs">{errors.title}</span>}
            </label>

            <label><span>Class *</span>
              <select value={data.class_id} onChange={e => setData('class_id', e.target.value)} required>
                <option value="">Select Class...</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.class_id && <span className="text-red-500 text-xs">{errors.class_id}</span>}
            </label>

            <label><span>Subject (Optional)</span>
              <select value={data.subject_id} onChange={e => setData('subject_id', e.target.value)}>
                <option value="">General / No Subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>

            <label style={{ gridColumn: '1 / -1' }}><span>Upload File * (PDF, DOC, JPG - Max 10MB)</span>
              <input type="file" onChange={e => setData('file', e.target.files[0])} required style={{ padding: '8px', border: '1px dashed #cbd5e1', background: '#f8fafc' }} />
              {errors.file && <span className="text-red-500 text-xs">{errors.file}</span>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}><span>Short Description</span>
              <textarea rows="3" value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Add any instructions for students..."></textarea>
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>
              <Icon name="upload" /> {processing ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
