import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function StockFormModal({ item, rooms, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    medical_room_id: item?.medical_room_id ?? '',
    medicine_name: item?.medicine_name ?? '',
    category: item?.category ?? 'Tablet',
    quantity: item?.quantity ?? 0,
    expiry_date: item?.expiry_date ? item.expiry_date.split('T')[0] : '',
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.medical.medicine-stock.update', item.id), options);
    else post(route('admin.medical.medicine-stock.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Medicine Stock' : 'Add Medicine to Stock'}</h3>
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
              <span>Select Medical Room *</span>
              <select value={data.medical_room_id} onChange={e => setData('medical_room_id', e.target.value)} required>
                <option value="" disabled>Select Room</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.room_number}</option>)}
              </select>
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Medicine Name *</span>
              <input value={data.medicine_name} onChange={e => setData('medicine_name', e.target.value)} required autoFocus />
            </label>

            <label>
              <span>Category</span>
              <select value={data.category} onChange={e => setData('category', e.target.value)}>
                <option value="Tablet">Tablet</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
                <option value="Bandage">Bandage/First Aid</option>
                <option value="Ointment">Ointment / Cream</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label>
              <span>Quantity in Stock *</span>
              <input type="number" min="0" value={data.quantity} onChange={e => setData('quantity', e.target.value)} required />
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Expiry Date (Optional)</span>
              <input type="date" value={data.expiry_date} onChange={e => setData('expiry_date', e.target.value)} />
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