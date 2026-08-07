import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function LoanFormModal({ item, staffList, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, reset, errors } = useForm({
    staff_id: item?.staff_id ?? '',
    loan_type: item?.loan_type ?? 'Advance Salary',
    amount: item?.amount ?? '',
    monthly_deduction: item?.monthly_deduction ?? '',
    reason: item?.reason ?? '',
    status: item?.status ?? 'Pending',
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.staff-loans.update', item.id), options);
    else post(route('admin.staff-loans.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={e => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Manage Request' : 'Add Advance / Loan Request'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">
            
            <label style={{ gridColumn: '1 / -1' }}><span>Select Staff Member *</span>
              <select value={data.staff_id} onChange={e => setData('staff_id', e.target.value)} required>
                <option value="">Choose...</option>
                {staffList.map(s => (
                  <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.staff_id_no})</option>
                ))}
              </select>
              {errors.staff_id && <span className="text-red-500 text-xs">{errors.staff_id}</span>}
            </label>

            <label><span>Type *</span>
              <select value={data.loan_type} onChange={e => setData('loan_type', e.target.value)} required>
                <option value="Advance Salary">Advance Salary</option>
                <option value="Loan">Loan</option>
              </select>
            </label>

            <label><span>Status *</span>
              <select value={data.status} onChange={e => setData('status', e.target.value)} required>
                <option value="Pending">Pending Approval</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Completed">Completed (Paid Off)</option>
              </select>
            </label>

            <label><span>Total Amount (৳) *</span>
              <input type="number" step="0.01" value={data.amount} onChange={e => setData('amount', e.target.value)} required placeholder="e.g. 5000" />
              {errors.amount && <span className="text-red-500 text-xs">{errors.amount}</span>}
            </label>

            <label><span>Monthly Deduction (৳)</span>
              <input type="number" step="0.01" value={data.monthly_deduction} onChange={e => setData('monthly_deduction', e.target.value)} placeholder="e.g. 1000" />
              <span style={{ fontSize: '11px', color: '#64748b' }}>Leave blank if deducting all at once.</span>
            </label>

            <label style={{ gridColumn: '1 / -1' }}><span>Reason / Notes</span>
              <textarea rows="3" value={data.reason} onChange={e => setData('reason', e.target.value)} placeholder="Enter reason for the advance..."></textarea>
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>
              <Icon name="save" /> {processing ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}