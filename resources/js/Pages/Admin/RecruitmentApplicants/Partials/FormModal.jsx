import { useForm, router } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, jobPosts, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, processing, errors } = useForm({
    job_post_id: item?.job_post_id || '',
    name: item?.name || '',
    email: item?.email || '',
    phone: item?.phone || '',
    applied_date: item?.applied_date || new Date().toISOString().split('T')[0],
    status: item?.status || 'Pending',
    cover_letter: item?.cover_letter || '',
    resume: null, // ফাইল আপলোডের জন্য
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      router.post(route('admin.recruitment.applicants.update', item.id), {
        ...data,
        _method: 'PUT',
      }, {
        onSuccess: () => onClose(),
      });
    } else {
      post(route('admin.recruitment.applicants.store'), {
        onSuccess: () => onClose(),
      });
    }
  };

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Applicant' : 'Add New Applicant'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mm-form">
          <div className="mm-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            
            <label>
              <span>Applied For (Job Post) *</span>
              <select value={data.job_post_id} onChange={(e) => setData('job_post_id', e.target.value)} required>
                <option value="">-- সিলেক্ট জব পোস্ট --</option>
                {jobPosts.map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
              {errors.job_post_id && <em>{errors.job_post_id}</em>}
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Full Name *</span>
                <input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="আবেদনকারীর নাম" required />
                {errors.name && <em>{errors.name}</em>}
              </label>

              <label>
                <span>Phone Number *</span>
                <input value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="০১xxxxxxxxx" required />
                {errors.phone && <em>{errors.phone}</em>}
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Email Address</span>
                <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="example@email.com" />
              </label>

              <label>
                <span>Application Date *</span>
                <input type="date" value={data.applied_date} onChange={(e) => setData('applied_date', e.target.value)} required />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Status *</span>
                <select value={data.status} onChange={(e) => setData('status', e.target.value)} required>
                  <option value="Pending">Pending</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interviewed">Interviewed</option>
                  <option value="Hired">Hired</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </label>

              <label>
                <span>Upload Resume / CV (PDF/Img)</span>
                <input type="file" onChange={(e) => setData('resume', e.target.files[0])} style={{ padding: '7px', background: '#f8fafc', border: '1px dashed #cbd5e1' }} accept=".pdf,.doc,.docx,.jpg,.png" />
                {errors.resume && <em>{errors.resume}</em>}
              </label>
            </div>

            <label>
              <span>Cover Letter / Remarks</span>
              <textarea rows="3" value={data.cover_letter} onChange={(e) => setData('cover_letter', e.target.value)} placeholder="বিশেষ কোনো নোট বা কভার লেটার..." />
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : 'Save Applicant'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}