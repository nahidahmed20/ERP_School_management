import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function OutletFormModal({ item, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    name: item?.name ?? '',
    location: item?.location ?? '',
    manager_name: item?.manager_name ?? '',
    phone: item?.phone ?? '',
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.cafeteria.outlets.update', item.id), options);
    else post(route('admin.cafeteria.outlets.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Outlet' : 'Add New Outlet'}</h3>
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
              <span>Outlet Name *</span>
              <input value={data.name} onChange={e => setData('name', e.target.value)} required autoFocus />
              {errors.name && <em>{errors.name}</em>}
            </label>
            <label>
              <span>Location</span>
              <input value={data.location} onChange={e => setData('location', e.target.value)} />
            </label>
            <label>
              <span>Manager Name</span>
              <input value={data.manager_name} onChange={e => setData('manager_name', e.target.value)} />
            </label>
            <label>
              <span>Phone Number</span>
              <input value={data.phone} onChange={e => setData('phone', e.target.value)} />
            </label>
            <label className="mm-checkbox" style={{ gridColumn: '1 / -1' }}>
              <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} /> Active Outlet
            </label>
          </div>
          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}