import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors } = useForm({
    title: item?.title || '',
    department: item?.department || '',
    employment_type: item?.employment_type || 'Full-time',
    vacancies: item?.vacancies || 1,
    deadline: item?.deadline || '',
    description: item?.description || '',
    status: item?.status || 'Open',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route('admin.recruitment.job-posts.update', item.id), {
        onSuccess: () => onClose(),
      });
    } else {
      post(route('admin.recruitment.job-posts.store'), {
        onSuccess: () => onClose(),
      });
    }
  };

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Job Post' : 'Create Job Post'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mm-form">
          <div className="mm-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Job Title *</span>
                <input value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="e.g. Senior Math Teacher" required />
                {errors.title && <em>{errors.title}</em>}
              </label>

              <label>
                <span>Department</span>
                <input value={data.department} onChange={(e) => setData('department', e.target.value)} placeholder="e.g. Science" />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Employment Type *</span>
                <select value={data.employment_type} onChange={(e) => setData('employment_type', e.target.value)} required>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contractual">Contractual</option>
                </select>
              </label>

              <label>
                <span>Vacancies *</span>
                <input type="number" min="1" value={data.vacancies} onChange={(e) => setData('vacancies', e.target.value)} required />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Application Deadline *</span>
                <input type="date" value={data.deadline} onChange={(e) => setData('deadline', e.target.value)} required />
                {errors.deadline && <em>{errors.deadline}</em>}
              </label>

              <label>
                <span>Status *</span>
                <select value={data.status} onChange={(e) => setData('status', e.target.value)} required>
                  <option value="Open">Open (আবেদন গ্রহণ চলছে)</option>
                  <option value="Closed">Closed (আবেদন বন্ধ)</option>
                </select>
              </label>
            </div>

            <label>
              <span>Job Description / Requirements</span>
              <textarea rows="4" value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="শিক্ষাগত যোগ্যতা, অভিজ্ঞতা এবং দায়িত্বসমূহ..." />
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : 'Save Job Post'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}