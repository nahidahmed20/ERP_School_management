import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function VoucherFormModal({ accounts, onClose }) {
  const { data, setData, post, processing, reset, errors } = useForm({
    date: new Date().toISOString().split('T')[0],
    voucher_type: 'Payment',
    debit_account_id: '',
    credit_account_id: '',
    amount: '',
    description: '',
  });

  function submit(e) {
    e.preventDefault();
    post(route('admin.accounting.vouchers.store'), {
      onSuccess: () => { reset(); onClose(); },
    });
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="mm-modal-head">
          <h3>Create Accounting Voucher</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={submit} className="mm-form">
          
          {/* Helper Note based on type */}
          <div style={{ background: '#f8fafc', padding: '10px 15px', borderRadius: '6px', marginBottom: '15px', fontSize: '12px', color: '#475569', border: '1px solid #e2e8f0' }}>
            {data.voucher_type === 'Payment' && <span><strong>Payment:</strong> Credit cash/bank account and Debit the expense/payable account.</span>}
            {data.voucher_type === 'Receipt' && <span><strong>Receipt:</strong> Debit cash/bank account and Credit the income/receivable account.</span>}
            {data.voucher_type === 'Contra' && <span><strong>Contra:</strong> Used only for transactions between Cash and Bank accounts.</span>}
            {data.voucher_type === 'Journal' && <span><strong>Journal:</strong> Used for adjustments, depreciation, or non-cash transactions.</span>}
          </div>

          <div className="mm-form-grid">
            
            <label><span>Voucher Date *</span>
              <input type="date" value={data.date} onChange={e => setData('date', e.target.value)} required />
            </label>

            <label><span>Voucher Type *</span>
              <select value={data.voucher_type} onChange={e => setData('voucher_type', e.target.value)} required>
                <option value="Payment">Payment Voucher</option>
                <option value="Receipt">Receipt Voucher</option>
                <option value="Contra">Contra Voucher</option>
                <option value="Journal">Journal Voucher</option>
              </select>
            </label>

            <label style={{ gridColumn: '1 / -1' }}><span>Debit Account (DR) *</span>
              <select value={data.debit_account_id} onChange={e => setData('debit_account_id', e.target.value)} required>
                <option value="">Select Debit Account...</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                ))}
              </select>
              {errors.debit_account_id && <span className="text-red-500 text-xs">{errors.debit_account_id}</span>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}><span>Credit Account (CR) *</span>
              <select value={data.credit_account_id} onChange={e => setData('credit_account_id', e.target.value)} required>
                <option value="">Select Credit Account...</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                ))}
              </select>
              {errors.credit_account_id && <span className="text-red-500 text-xs">{errors.credit_account_id}</span>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}><span>Amount (৳) *</span>
              <input type="number" step="0.01" value={data.amount} onChange={e => setData('amount', e.target.value)} required placeholder="Enter amount" />
              {errors.amount && <span className="text-red-500 text-xs">{errors.amount}</span>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}><span>Narration / Description</span>
              <textarea rows="2" value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Transaction details or cheque number..."></textarea>
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing} style={{ background: '#4f46e5' }}>
              <Icon name="check" /> {processing ? 'Posting...' : 'Post Voucher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}