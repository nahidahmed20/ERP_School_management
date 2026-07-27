import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function AllocationFormModal({ item, rooms, users, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    hostel_room_id: item?.hostel_room_id ?? '',
    user_id: item?.user_id ?? '',
    allocation_date: item?.allocation_date ?? new Date().toISOString().split('T')[0],
    monthly_fee: item?.monthly_fee ?? '',
    is_active: item?.is_active ?? true,
  });

  const handleRoomChange = (e) => {
    const selectedRoomId = e.target.value;
    const room = rooms.find(r => r.id == selectedRoomId);
    
    setData(data => ({
      ...data,
      hostel_room_id: selectedRoomId,
      monthly_fee: room ? room.cost_per_bed : ''
    }));
  };

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.hostel-allocations.update', item.id), options);
    else post(route('admin.hostel-allocations.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Room Allocation' : 'New Room Allocation'}</h3>
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
              <span>Select Occupant (User) *</span>
              <select value={data.user_id} onChange={(e) => setData('user_id', e.target.value)} required>
                <option value="" disabled>Search or select user...</option>
                {users?.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
              {errors.user_id && <em>{errors.user_id}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Assign Hostel & Room *</span>
              <select value={data.hostel_room_id} onChange={handleRoomChange} required>
                <option value="" disabled>Select Hostel Room</option>
                {rooms?.map(r => <option key={r.id} value={r.id}>{r.hostel_name} - Room: {r.room_number}</option>)}
              </select>
              {errors.hostel_room_id && <em>{errors.hostel_room_id}</em>}
            </label>

            <label>
              <span>Allocation Date *</span>
              <input type="date" value={data.allocation_date} onChange={(e) => setData('allocation_date', e.target.value)} required />
              {errors.allocation_date && <em>{errors.allocation_date}</em>}
            </label>

            <label>
              <span>Monthly Fee (৳) *</span>
              <input type="number" value={data.monthly_fee} onChange={(e) => setData('monthly_fee', e.target.value)} min="0" required />
              {errors.monthly_fee && <em>{errors.monthly_fee}</em>}
            </label>

            <label className="mm-checkbox" style={{ gridColumn: '1 / -1' }}>
              <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} /> 
              Status (Active/Vacated)
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