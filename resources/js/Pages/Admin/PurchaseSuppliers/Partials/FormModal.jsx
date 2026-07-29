import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors } = useForm({
    name: item?.name || '',
    contact_person: item?.contact_person || '',
    phone: item?.phone || '',
    email: item?.email || '',
    address: item?.address || '',
    is_active: item ? item.is_active : true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route('admin.purchase.suppliers.update', item.id), { onSuccess: () => onClose() });
    } else {
      post(route('admin.purchase.suppliers.store'), { onSuccess: () => onClose() });
    }
  };

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Supplier' : 'Add New Supplier'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mm-form">
          <div className="mm-form-grid" style={{ gridTemplateColumns: '1fr' }}>

            <label>
              <span>Company / Supplier Name *</span>
              <input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. ABC Traders" required />
              {errors.name && <em>{errors.name}</em>}
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Contact Person</span>
                <input value={data.contact_person} onChange={(e) => setData('contact_person', e.target.value)} placeholder="Name of contact" />
              </label>

              <label>
                <span>Phone Number *</span>
                <input value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="Phone number" required />
                {errors.phone && <em>{errors.phone}</em>}
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Email Address</span>
                <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="Email address" />
              </label>

              <label>
                <span>Status</span>
                <select value={data.is_active ? 1 : 0} onChange={(e) => setData('is_active', e.target.value === '1')} required>
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </label>
            </div>

            <label>
              <span>Address</span>
              <textarea rows="2" value={data.address} onChange={(e) => setData('address', e.target.value)} placeholder="Company Address..." />
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : 'Save Supplier'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
