import { useForm, router } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, processing, errors } = useForm({
    title: item?.title || '',
    date: item?.date || '',
    time: item?.time || '',
    location: item?.location || '',
    status: item?.status || 'Upcoming',
    description: item?.description || '',
    cover_photo: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      router.post(route('admin.alumni.events.update', item.id), {
        ...data,
        _method: 'PUT',
      }, {
        onSuccess: () => onClose(),
      });
    } else {
      post(route('admin.alumni.events.store'), {
        onSuccess: () => onClose(),
      });
    }
  };

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Event' : 'Create New Event'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mm-form">
          <div className="mm-form-grid" style={{ gridTemplateColumns: '1fr' }}>

            <label>
              <span>Event Title *</span>
              <input value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="e.g. Grand Reunion 2026" required />
              {errors.title && <em>{errors.title}</em>}
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Date *</span>
                <input type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} required />
              </label>

              <label>
                <span>Time *</span>
                <input type="time" value={data.time} onChange={(e) => setData('time', e.target.value)} required />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Location / Venue</span>
                <input value={data.location} onChange={(e) => setData('location', e.target.value)} placeholder="e.g. School Auditorium" />
              </label>

              <label>
                <span>Status *</span>
                <select value={data.status} onChange={(e) => setData('status', e.target.value)} required>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </label>
            </div>

            <label>
              <span>Event Description</span>
              <textarea rows="3" value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="ইভেন্টের বিস্তারিত তথ্য..." />
            </label>

            <label>
              <span>Cover Photo / Banner (Optional)</span>
              <input type="file" onChange={(e) => setData('cover_photo', e.target.files[0])} style={{ padding: '7px', background: '#f8fafc', border: '1px dashed #cbd5e1' }} accept=".jpg,.jpeg,.png" />
              {errors.cover_photo && <em>{errors.cover_photo}</em>}
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : 'Save Event'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
