import { useForm, router } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, transactions, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors } = useForm({
    payment_transaction_id: item?.payment_transaction_id || '',
    amount: item?.amount || '',
    reason: item?.reason || '',
    status: item?.status || 'Pending',
    refund_date: item?.refund_date || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route('admin.payments.refunds.update', item.id), {
        onSuccess: () => onClose(),
      });
    } else {
      post(route('admin.payments.refunds.store'), {
        onSuccess: () => onClose(),
      });
    }
  };

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Refund' : 'Initiate Refund'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mm-form">
          <div className="mm-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            
            <label>
              <span>Select Transaction (Only Completed ones) *</span>
              <select value={data.payment_transaction_id} onChange={(e) => setData('payment_transaction_id', e.target.value)} required disabled={isEdit}>
                <option value="">-- ট্রানজেকশন সিলেক্ট করুন --</option>
                {transactions.map(txn => (
                  <option key={txn.id} value={txn.id}>
                    {txn.transaction_id} (Paid: {txn.amount} {txn.currency}) - {txn.reference_no}
                  </option>
                ))}
              </select>
              {errors.payment_transaction_id && <em>{errors.payment_transaction_id}</em>}
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Refund Amount *</span>
                <input type="number" step="0.01" value={data.amount} onChange={(e) => setData('amount', e.target.value)} placeholder="কত টাকা ফেরত দেবেন" required />
              </label>

              <label>
                <span>Status *</span>
                <select value={data.status} onChange={(e) => setData('status', e.target.value)} required>
                  <option value="Pending">Pending (অপেক্ষমান)</option>
                  <option value="Approved">Approved (অনুমোদিত)</option>
                  <option value="Refunded">Refunded (ফেরত দেওয়া হয়েছে)</option>
                  <option value="Rejected">Rejected (বাতিল)</option>
                </select>
              </label>
            </div>

            <label>
              <span>Refund Date (If Refunded)</span>
              <input type="date" value={data.refund_date} onChange={(e) => setData('refund_date', e.target.value)} />
            </label>

            <label>
              <span>Reason for Refund *</span>
              <textarea rows="3" value={data.reason} onChange={(e) => setData('reason', e.target.value)} placeholder="কেন টাকা ফেরত দেওয়া হচ্ছে তার কারণ..." required />
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : 'Save Refund'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}