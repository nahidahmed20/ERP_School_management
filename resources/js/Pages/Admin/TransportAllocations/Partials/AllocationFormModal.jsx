import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function AllocationFormModal({ item, vehicles, users, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    vehicle_id: item?.vehicle_id ?? '',
    user_id: item?.user_id ?? '',
    pickup_point: item?.pickup_point ?? '',
    monthly_fare: item?.monthly_fare ?? '',
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.transports.update', item.id), options);
    else post(route('admin.transports.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Allocation' : 'New Transport Allocation'}</h3>
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
              <span>Select Passenger (User) *</span>
              <select value={data.user_id} onChange={(e) => setData('user_id', e.target.value)} required>
                <option value="" disabled>Search or select user...</option>
                {users?.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
              {errors.user_id && <em>{errors.user_id}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Assign Vehicle & Route *</span>
              <select value={data.vehicle_id} onChange={(e) => setData('vehicle_id', e.target.value)} required>
                <option value="" disabled>Select Vehicle</option>
                {vehicles?.map(v => <option key={v.id} value={v.id}>{v.vehicle_number} - {v.route_name}</option>)}
              </select>
              {errors.vehicle_id && <em>{errors.vehicle_id}</em>}
            </label>

            <label>
              <span>Pickup Point *</span>
              <input value={data.pickup_point} onChange={(e) => setData('pickup_point', e.target.value)} placeholder="e.g. Mirpur 10 Bus Stand" required />
              {errors.pickup_point && <em>{errors.pickup_point}</em>}
            </label>

            <label>
              <span>Monthly Fare (৳) *</span>
              <input type="number" value={data.monthly_fare} onChange={(e) => setData('monthly_fare', e.target.value)} min="0" required />
              {errors.monthly_fare && <em>{errors.monthly_fare}</em>}
            </label>

            <label className="mm-checkbox" style={{ gridColumn: '1 / -1' }}>
              <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} /> Status (Active/Inactive)
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