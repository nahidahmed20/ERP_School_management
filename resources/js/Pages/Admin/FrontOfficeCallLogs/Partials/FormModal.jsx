import { useForm, Link } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors } = useForm({
    name: item?.name || '',
    phone: item?.phone || '',
    date: item?.date || new Date().toISOString().split('T')[0],
    description: item?.description || '',
    next_follow_up_date: item?.next_follow_up_date || '',
    call_duration: item?.call_duration || '',
    call_type: item?.call_type || 'Incoming',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route('admin.frontoffice.call-logs.update', item.id), {
        onSuccess: () => onClose(),
      });
    } else {
      post(route('admin.frontoffice.call-logs.store'), {
        onSuccess: () => onClose(),
      });
    }
  };

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Call Log' : 'Add New Call Log'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mm-form">
          <div className="mm-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Caller / Receiver Name *</span>
                <input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="নাম" required />
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
                <span>Call Date *</span>
                <input type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} required />
              </label>

              <label>
                <span>Call Type *</span>
                <select value={data.call_type} onChange={(e) => setData('call_type', e.target.value)} required>
                  <option value="Incoming">Incoming</option>
                  <option value="Outgoing">Outgoing</option>
                </select>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Call Duration (e.g. 3 mins)</span>
                <input value={data.call_duration} onChange={(e) => setData('call_duration', e.target.value)} placeholder="স্থায়িত্ব" />
              </label>

              <label>
                <span>Next Follow-up Date</span>
                <input type="date" value={data.next_follow_up_date} onChange={(e) => setData('next_follow_up_date', e.target.value)} />
              </label>
            </div>

            <label>
              <span>Description / Notes</span>
              <textarea rows="3" value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="কথোপকথনের বিস্তারিত..." />
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : 'Save Call Log'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}