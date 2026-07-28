import { useForm, router } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, processing, errors } = useForm({
    name: item?.name || '',
    passing_year: item?.passing_year || '',
    phone: item?.phone || '',
    email: item?.email || '',
    current_profession: item?.current_profession || '',
    organization: item?.organization || '',
    address: item?.address || '',
    photo: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      router.post(route('admin.alumni.directory.update', item.id), {
        ...data,
        _method: 'PUT',
      }, {
        onSuccess: () => onClose(),
      });
    } else {
      post(route('admin.alumni.directory.store'), {
        onSuccess: () => onClose(),
      });
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 35 }, (_, i) => currentYear - i);

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Alumni Record' : 'Add New Alumni'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mm-form">
          <div className="mm-form-grid" style={{ gridTemplateColumns: '1fr' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Full Name *</span>
                <input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="শিক্ষার্থীর নাম" required />
                {errors.name && <em>{errors.name}</em>}
              </label>

              <label>
                <span>Passing Year *</span>
                <select value={data.passing_year} onChange={(e) => setData('passing_year', e.target.value)} required>
                  <option value="">-- পাসের বছর --</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {errors.passing_year && <em>{errors.passing_year}</em>}
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Phone Number *</span>
                <input value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="০১xxxxxxxxx" required />
                {errors.phone && <em>{errors.phone}</em>}
              </label>

              <label>
                <span>Email Address</span>
                <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="example@email.com" />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Current Profession</span>
                <input value={data.current_profession} onChange={(e) => setData('current_profession', e.target.value)} placeholder="e.g. Software Engineer" />
              </label>

              <label>
                <span>Organization / Company</span>
                <input value={data.organization} onChange={(e) => setData('organization', e.target.value)} placeholder="e.g. Google / Govt. Service" />
              </label>
            </div>

            <label>
              <span>Current Address</span>
              <textarea rows="2" value={data.address} onChange={(e) => setData('address', e.target.value)} placeholder="বর্তমান ঠিকানা..." />
            </label>

            <label>
              <span>Upload Photo (Optional)</span>
              <input type="file" onChange={(e) => setData('photo', e.target.files[0])} style={{ padding: '7px', background: '#f8fafc', border: '1px dashed #cbd5e1' }} accept=".jpg,.jpeg,.png" />
              {errors.photo && <em>{errors.photo}</em>}
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : 'Save Alumni Info'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
