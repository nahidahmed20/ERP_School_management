import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function RoomFormModal({ item, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    hostel_name: item?.hostel_name ?? '',
    room_number: item?.room_number ?? '',
    room_type: item?.room_type ?? 'Non-AC',
    bed_capacity: item?.bed_capacity ?? 1,
    cost_per_bed: item?.cost_per_bed ?? '',
    description: item?.description ?? '',
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.hostel-rooms.update', item.id), options);
    else post(route('admin.hostel-rooms.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Hostel Room' : 'Add Hostel Room'}</h3>
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

            <label>
              <span>Hostel Name *</span>
              <input value={data.hostel_name} onChange={(e) => setData('hostel_name', e.target.value)} autoFocus placeholder="e.g. Boys Hostel" required />
              {errors.hostel_name && <em>{errors.hostel_name}</em>}
            </label>

            <label>
              <span>Room Number *</span>
              <input value={data.room_number} onChange={(e) => setData('room_number', e.target.value)} placeholder="e.g. 101, 205A" required />
              {errors.room_number && <em>{errors.room_number}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Room Type *</span>
              <select value={data.room_type} onChange={(e) => setData('room_type', e.target.value)}>
                <option value="Non-AC">Non-AC</option>
                <option value="AC">AC</option>
                <option value="VIP">VIP</option>
              </select>
            </label>

            <label>
              <span>Bed Capacity (Total Seats) *</span>
              <input type="number" value={data.bed_capacity} onChange={(e) => setData('bed_capacity', e.target.value)} min="1" required />
              {errors.bed_capacity && <em>{errors.bed_capacity}</em>}
            </label>

            <label>
              <span>Cost Per Bed (Monthly) *</span>
              <input type="number" value={data.cost_per_bed} onChange={(e) => setData('cost_per_bed', e.target.value)} min="0" required />
              {errors.cost_per_bed && <em>{errors.cost_per_bed}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Description / Facilities</span>
              <textarea rows="2" value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="Optional details..." />
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