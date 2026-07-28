import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, applicants, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors } = useForm({
    applicant_id: item?.applicant_id || '',
    interviewer_name: item?.interviewer_name || '',
    interview_date: item?.interview_date || '',
    interview_time: item?.interview_time || '',
    location: item?.location || '',
    status: item?.status || 'Scheduled',
    remarks: item?.remarks || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route('admin.recruitment.interviews.update', item.id), {
        onSuccess: () => onClose(),
      });
    } else {
      post(route('admin.recruitment.interviews.store'), {
        onSuccess: () => onClose(),
      });
    }
  };

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Interview' : 'Schedule Interview'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mm-form">
          <div className="mm-form-grid" style={{ gridTemplateColumns: '1fr' }}>

            <label>
              <span>Select Applicant *</span>
              <select value={data.applicant_id} onChange={(e) => setData('applicant_id', e.target.value)} required>
                <option value="">-- আবেদনকারী নির্বাচন করুন --</option>
                {applicants.map(app => (
                  <option key={app.id} value={app.id}>{app.name} ({app.job_post?.title})</option>
                ))}
              </select>
              {errors.applicant_id && <em>{errors.applicant_id}</em>}
            </label>

            <label>
              <span>Interviewer Name *</span>
              <input value={data.interviewer_name} onChange={(e) => setData('interviewer_name', e.target.value)} placeholder="e.g. Principal / HR Manager" required />
              {errors.interviewer_name && <em>{errors.interviewer_name}</em>}
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Date *</span>
                <input type="date" value={data.interview_date} onChange={(e) => setData('interview_date', e.target.value)} required />
              </label>

              <label>
                <span>Time *</span>
                <input type="time" value={data.interview_time} onChange={(e) => setData('interview_time', e.target.value)} required />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Location / Link</span>
                <input value={data.location} onChange={(e) => setData('location', e.target.value)} placeholder="e.g. Room 101 or Zoom link" />
              </label>

              <label>
                <span>Status *</span>
                <select value={data.status} onChange={(e) => setData('status', e.target.value)} required>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </label>
            </div>

            <label>
              <span>Remarks / Feedback</span>
              <textarea rows="3" value={data.remarks} onChange={(e) => setData('remarks', e.target.value)} placeholder="ইন্টারভিউয়ের ফলাফল বা ফিডব্যাক..." />
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : 'Save Interview'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
