import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function VehicleFormModal({ item, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    vehicle_number: item?.vehicle_number ?? '',
    vehicle_model: item?.vehicle_model ?? '',
    driver_name: item?.driver_name ?? '',
    driver_phone: item?.driver_phone ?? '',
    route_name: item?.route_name ?? '',
    capacity: item?.capacity ?? 40,
    note: item?.note ?? '',
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.vehicles.update', item.id), options);
    else post(route('admin.vehicles.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Vehicle & Route' : 'Add Vehicle & Route'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">
            <label style={{ gridColumn: '1 / -1' }}>
              <span>Assign to Campus</span>
              <select value={data.campus_id || ''} onChange={(e) => setData('campus_id', e.target.value)} disabled={!isSuperAdmin}>
                <option value="" disabled>Select Campus</option>
                {campuses?.map(campus => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
              </select>
              {errors.campus_id && <em>{errors.campus_id}</em>}
            </label>

            <label>
              <span>Vehicle Number (Reg. No)</span>
              <input value={data.vehicle_number} onChange={(e) => setData('vehicle_number', e.target.value)} autoFocus placeholder="e.g. Dhaka-Metro-11" />
              {errors.vehicle_number && <em>{errors.vehicle_number}</em>}
            </label>

            <label>
              <span>Vehicle Model</span>
              <input value={data.vehicle_model} onChange={(e) => setData('vehicle_model', e.target.value)} placeholder="e.g. Tata Starbus" />
              {errors.vehicle_model && <em>{errors.vehicle_model}</em>}
            </label>

            <label>
              <span>Driver Name</span>
              <input value={data.driver_name} onChange={(e) => setData('driver_name', e.target.value)} placeholder="Driver's Full Name" />
              {errors.driver_name && <em>{errors.driver_name}</em>}
            </label>

            <label>
              <span>Driver Phone</span>
              <input value={data.driver_phone} onChange={(e) => setData('driver_phone', e.target.value)} placeholder="Contact Number" />
              {errors.driver_phone && <em>{errors.driver_phone}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Route Details</span>
              <input value={data.route_name} onChange={(e) => setData('route_name', e.target.value)} placeholder="e.g. Route A (Mirpur to Campus via Dhanmondi)" />
              {errors.route_name && <em>{errors.route_name}</em>}
            </label>

            <label>
              <span>Seating Capacity</span>
              <input type="number" value={data.capacity} onChange={(e) => setData('capacity', e.target.value)} min="1" />
              {errors.capacity && <em>{errors.capacity}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Additional Notes</span>
              <textarea rows="2" value={data.note} onChange={(e) => setData('note', e.target.value)} />
            </label>

            <label className="mm-checkbox" style={{ gridColumn: '1 / -1' }}>
              <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} /> Active
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