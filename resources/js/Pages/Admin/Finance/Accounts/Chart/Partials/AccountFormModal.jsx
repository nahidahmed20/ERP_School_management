import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function AccountFormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, reset, errors } = useForm({
    name: item?.name ?? '',
    code: item?.code ?? '',
    type: item?.type ?? 'Asset',
    opening_balance: item?.opening_balance ?? '0.00',
    description: item?.description ?? '',
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.accounting.chart.update', item.id), options);
    else post(route('admin.accounting.chart.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={e => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Account' : 'Create New Account Head'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">
            
            <label style={{ gridColumn: '1 / -1' }}><span>Account Name *</span>
              <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required placeholder="e.g. Dutch Bangla Bank or Stationery Expense" />
              {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
            </label>

            <label><span>Account Code</span>
              <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} placeholder="e.g. 1001" />
              {errors.code && <span className="text-red-500 text-xs">{errors.code}</span>}
            </label>

            <label><span>Account Type *</span>
              <select value={data.type} onChange={e => setData('type', e.target.value)} required>
                <option value="Asset">Asset (Cash, Banks, Receivables)</option>
                <option value="Liability">Liability (Loans, Payables)</option>
                <option value="Income">Income (Fees, Revenue)</option>
                <option value="Expense">Expense (Salaries, Bills)</option>
                <option value="Equity">Equity (Capital)</option>
              </select>
            </label>

            <label style={{ gridColumn: '1 / -1' }}><span>Opening Balance (৳) *</span>
              <input type="number" step="0.01" value={data.opening_balance} onChange={e => setData('opening_balance', e.target.value)} required />
              <span style={{ fontSize: '11px', color: '#64748b' }}>Enter the initial balance when creating this account.</span>
            </label>

            <label style={{ gridColumn: '1 / -1' }}><span>Description / Notes</span>
              <textarea rows="2" value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Optional details..."></textarea>
            </label>

            <label className="mm-checkbox" style={{ gridColumn: '1 / -1' }}>
              <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} /> Active (Available for transactions)
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing} style={{ background: '#4f46e5' }}>
              <Icon name="save" /> {processing ? 'Saving...' : 'Save Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}