import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function VendorFormModal({ item, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    name: item?.name ?? '',
    contact_person: item?.contact_person ?? '',
    phone: item?.phone ?? '',
    email: item?.email ?? '',
    address: item?.address ?? '',
    tax_id: item?.tax_id ?? '',
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.purchase.vendors.update', item.id), options);
    else post(route('admin.purchase.vendors.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Vendor' : 'Add New Vendor'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Assign to Campus *</span>
              <select value={data.campus_id || ''} onChange={(e) => setData('campus_id', e.target.value)} disabled={!isSuperAdmin} required>
                <option value="" disabled>Select Campus</option>
                {campuses?.map(campus => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
              </select>
              {errors.campus_id && <em>{errors.campus_id}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Vendor / Company Name *</span>
              <input value={data.name} onChange={(e) => setData('name', e.target.value)} autoFocus required />
              {errors.name && <em>{errors.name}</em>}
            </label>

            <label>
              <span>Contact Person Name</span>
              <input value={data.contact_person} onChange={(e) => setData('contact_person', e.target.value)} />
            </label>

            <label>
              <span>Phone Number *</span>
              <input value={data.phone} onChange={(e) => setData('phone', e.target.value)} required />
              {errors.phone && <em>{errors.phone}</em>}
            </label>

            <label>
              <span>Email Address</span>
              <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
            </label>

            <label>
              <span>TIN / BIN Number</span>
              <input value={data.tax_id} onChange={(e) => setData('tax_id', e.target.value)} placeholder="Tax ID" />
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Address</span>
              <textarea rows="2" value={data.address} onChange={(e) => setData('address', e.target.value)} />
            </label>

            <label className="mm-checkbox" style={{ gridColumn: '1 / -1' }}>
              <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} /> Active Vendor
            </label>

          </div>

          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : (isEdit ? 'Update' : 'Save')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
