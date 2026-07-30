import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function PaymentFormModal({ item, users, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    user_id: item?.user_id ?? '',
    amount: item?.amount ?? '',
    payment_method: item?.payment_method ?? 'Cash',
    transaction_id: item?.transaction_id ?? '',
    payment_date: item?.payment_date ? item.payment_date.split('T')[0] : new Date().toISOString().split('T')[0],
    remarks: item?.remarks ?? '',
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.cafeteria.meal-payments.update', item.id), options);
    else post(route('admin.cafeteria.meal-payments.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Payment' : 'Add New Payment'}</h3>
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
              <span>Student / Staff *</span>
              <select value={data.user_id} onChange={e => setData('user_id', e.target.value)} required>
                <option value="" disabled>Select User</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              {errors.user_id && <em>{errors.user_id}</em>}
            </label>

            <label>
              <span>Amount (৳) *</span>
              <input type="number" step="0.01" min="1" value={data.amount} onChange={e => setData('amount', e.target.value)} required />
            </label>

            <label>
              <span>Payment Date *</span>
              <input type="date" value={data.payment_date} onChange={e => setData('payment_date', e.target.value)} required />
            </label>

            <label>
              <span>Payment Method *</span>
              <select value={data.payment_method} onChange={e => setData('payment_method', e.target.value)} required>
                <option value="Cash">Cash</option>
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Bank">Bank / Card</option>
              </select>
            </label>

            <label>
              <span>Transaction ID (Optional)</span>
              <input type="text" value={data.transaction_id} onChange={e => setData('transaction_id', e.target.value)} />
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Remarks (Optional)</span>
              <textarea rows="2" value={data.remarks} onChange={e => setData('remarks', e.target.value)}></textarea>
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