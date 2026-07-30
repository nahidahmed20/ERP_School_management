import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function OrderFormModal({ outlets, users, foods, campuses, activeCampusId, onClose }) {
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, processing, errors, reset } = useForm({
    campus_id: activeCampusId,
    user_id: '',
    cafeteria_outlet_id: '',
    status: 'Pending',
    payment_status: 'Unpaid',
    items: [{ name: 'General Food Item', price: 0, qty: 1 }],
    total_amount: 0,
  });

  function submit(e) {
    e.preventDefault();
    post(route('admin.cafeteria.orders.store'), {
      onSuccess: () => { reset(); onClose(); }
    });
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Create New Order</h3>
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
              <span>Customer *</span>
              <select value={data.user_id} onChange={e => setData('user_id', e.target.value)} required>
                <option value="" disabled>Select User</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
              </select>
            </label>
            <label>
              <span>Outlet *</span>
              <select value={data.cafeteria_outlet_id} onChange={e => setData('cafeteria_outlet_id', e.target.value)} required>
                <option value="" disabled>Select Outlet</option>
                {outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              <span>Total Amount (৳) *</span>
              <input type="number" step="0.01" value={data.total_amount} onChange={e => setData('total_amount', e.target.value)} required />
            </label>
          </div>
          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>Place Order</button>
          </div>
        </form>
      </div>
    </div>
  );
}