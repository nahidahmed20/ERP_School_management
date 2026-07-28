import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, applicants, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors } = useForm({
    applicant_id: item?.applicant_id || '',
    issue_date: item?.issue_date || new Date().toISOString().split('T')[0],
    joining_date: item?.joining_date || '',
    salary_offered: item?.salary_offered || '',
    valid_until: item?.valid_until || '',
    status: item?.status || 'Pending',
    terms_conditions: item?.terms_conditions || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route('admin.recruitment.offer-letters.update', item.id), {
        onSuccess: () => onClose(),
      });
    } else {
      post(route('admin.recruitment.offer-letters.store'), {
        onSuccess: () => onClose(),
      });
    }
  };

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Offer Letter' : 'Create Offer Letter'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mm-form">
          <div className="mm-form-grid" style={{ gridTemplateColumns: '1fr' }}>

            <label>
              <span>Select Applicant (Hired/Interviewed) *</span>
              <select value={data.applicant_id} onChange={(e) => setData('applicant_id', e.target.value)} required disabled={isEdit}>
                <option value="">-- আবেদনকারী নির্বাচন করুন --</option>
                {applicants.map(app => (
                  <option key={app.id} value={app.id}>{app.name} ({app.job_post?.title})</option>
                ))}
              </select>
              {errors.applicant_id && <em style={{color: 'red'}}>{errors.applicant_id}</em>}
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Salary Offered *</span>
                <input value={data.salary_offered} onChange={(e) => setData('salary_offered', e.target.value)} placeholder="e.g. 25,000 BDT or Negotiable" required />
                {errors.salary_offered && <em>{errors.salary_offered}</em>}
              </label>

              <label>
                <span>Status *</span>
                <select value={data.status} onChange={(e) => setData('status', e.target.value)} required>
                  <option value="Pending">Pending (অপেক্ষমান)</option>
                  <option value="Accepted">Accepted (গ্রহণ করেছে)</option>
                  <option value="Declined">Declined (প্রত্যাখ্যান করেছে)</option>
                </select>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Issue Date *</span>
                <input type="date" value={data.issue_date} onChange={(e) => setData('issue_date', e.target.value)} required />
              </label>

              <label>
                <span>Joining Date *</span>
                <input type="date" value={data.joining_date} onChange={(e) => setData('joining_date', e.target.value)} required />
              </label>
            </div>

            <label>
              <span>Valid Until (Deadline to Accept) *</span>
              <input type="date" value={data.valid_until} onChange={(e) => setData('valid_until', e.target.value)} required />
            </label>

            <label>
              <span>Terms & Conditions / Note</span>
              <textarea rows="3" value={data.terms_conditions} onChange={(e) => setData('terms_conditions', e.target.value)} placeholder="যেকোনো শর্তাবলী বা নোট..." />
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : 'Save Offer Letter'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
