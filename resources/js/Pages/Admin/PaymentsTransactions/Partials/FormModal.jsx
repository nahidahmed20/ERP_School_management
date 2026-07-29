import { useForm, router } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, gateways, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors } = useForm({
    payment_gateway_id: item?.payment_gateway_id || '',
    transaction_id: item?.transaction_id || '',
    reference_no: item?.reference_no || '',
    amount: item?.amount || '',
    currency: item?.currency || 'BDT',
    payment_method: item?.payment_method || '',
    status: item?.status || 'Completed',
    transaction_date: item?.transaction_date || new Date().toISOString().split('T')[0],
    note: item?.note || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route('admin.payments.transactions.update', item.id), {
        onSuccess: () => onClose(),
      });
    } else {
      post(route('admin.payments.transactions.store'), {
        onSuccess: () => onClose(),
      });
    }
  };

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Transaction' : 'Add Manual Transaction'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mm-form">
          <div className="mm-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Transaction ID *</span>
                <input value={data.transaction_id} onChange={(e) => setData('transaction_id', e.target.value)} placeholder="e.g. TXN123456" required />
                {errors.transaction_id && <em style={{color: 'red'}}>{errors.transaction_id}</em>}
              </label>

              <label>
                <span>Reference No / Invoice</span>
                <input value={data.reference_no} onChange={(e) => setData('reference_no', e.target.value)} placeholder="e.g. INV-001" />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Gateway (Optional)</span>
                <select value={data.payment_gateway_id} onChange={(e) => setData('payment_gateway_id', e.target.value)}>
                  <option value="">-- Manual / No Gateway --</option>
                  {gateways.map(gw => (
                    <option key={gw.id} value={gw.id}>{gw.name}</option>
                  ))}
                </select>
              </label>
              
              <label>
                <span>Payment Method</span>
                <input value={data.payment_method} onChange={(e) => setData('payment_method', e.target.value)} placeholder="e.g. Cash, Card, Mobile" />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <label>
                <span>Amount *</span>
                <input type="number" step="0.01" value={data.amount} onChange={(e) => setData('amount', e.target.value)} required />
              </label>

              <label>
                <span>Currency</span>
                <input value={data.currency} onChange={(e) => setData('currency', e.target.value)} />
              </label>

              <label>
                <span>Status *</span>
                <select value={data.status} onChange={(e) => setData('status', e.target.value)} required>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </label>
            </div>

            <label>
              <span>Transaction Date *</span>
              <input type="date" value={data.transaction_date} onChange={(e) => setData('transaction_date', e.target.value)} required />
            </label>

            <label>
              <span>Notes / Reason</span>
              <textarea rows="2" value={data.note} onChange={(e) => setData('note', e.target.value)} placeholder="অতিরিক্ত কোনো তথ্য বা নোট..." />
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : 'Save Transaction'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}