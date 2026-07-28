import { useForm, Link } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors } = useForm({
    applicant_name: item?.applicant_name || '',
    guardian_name: item?.guardian_name || '',
    phone: item?.phone || '',
    class_interested: item?.class_interested || '',
    inquiry_date: item?.inquiry_date || new Date().toISOString().split('T')[0],
    next_follow_up_date: item?.next_follow_up_date || '',
    status: item?.status || 'Pending',
    notes: item?.notes || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route('admin.frontoffice.admission-inquiries.update', item.id), {
        onSuccess: () => onClose(),
      });
    } else {
      post(route('admin.frontoffice.admission-inquiries.store'), {
        onSuccess: () => onClose(),
      });
    }
  };

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Inquiry' : 'Add New Inquiry'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mm-form">
          <div className="mm-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Applicant Name *</span>
                <input value={data.applicant_name} onChange={(e) => setData('applicant_name', e.target.value)} placeholder="শিক্ষার্থীর নাম" required />
                {errors.applicant_name && <em>{errors.applicant_name}</em>}
              </label>

              <label>
                <span>Guardian Name *</span>
                <input value={data.guardian_name} onChange={(e) => setData('guardian_name', e.target.value)} placeholder="অভিভাবকের নাম" required />
                {errors.guardian_name && <em>{errors.guardian_name}</em>}
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Phone Number *</span>
                <input value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="০১xxxxxxxxx" required />
                {errors.phone && <em>{errors.phone}</em>}
              </label>

              <label>
                <span>Class Interested *</span>
                <input value={data.class_interested} onChange={(e) => setData('class_interested', e.target.value)} placeholder="e.g. Class 6" required />
                {errors.class_interested && <em>{errors.class_interested}</em>}
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Inquiry Date *</span>
                <input type="date" value={data.inquiry_date} onChange={(e) => setData('inquiry_date', e.target.value)} required />
              </label>

              <label>
                <span>Next Follow-up Date</span>
                <input type="date" value={data.next_follow_up_date} onChange={(e) => setData('next_follow_up_date', e.target.value)} />
              </label>
            </div>

            <label>
              <span>Status *</span>
              <select value={data.status} onChange={(e) => setData('status', e.target.value)} required>
                <option value="Pending">Pending</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Converted">Converted (ভর্তি সম্পন্ন)</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </label>

            <label>
              <span>Notes / Remarks</span>
              <textarea rows="3" value={data.notes} onChange={(e) => setData('notes', e.target.value)} placeholder="বিশেষ কোনো তথ্য..." />
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : 'Save Inquiry'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}