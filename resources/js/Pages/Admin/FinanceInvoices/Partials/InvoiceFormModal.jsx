import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function InvoiceFormModal({ item, students, feeGroups, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const defaultInvoiceNo = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    student_id: item?.student_id ?? '',
    fee_group_id: item?.fee_group_id ?? '',
    invoice_no: item?.invoice_no ?? defaultInvoiceNo,
    invoice_date: item?.invoice_date ?? new Date().toISOString().split('T')[0],
    due_date: item?.due_date ?? '',
    amount: item?.amount ?? '',
    discount: item?.discount ?? 0,
    fine: item?.fine ?? 0,
    status: item?.status ?? 'Unpaid',
    note: item?.note ?? '',
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.fees.invoices.update', item.id), options);
    else post(route('admin.fees.invoices.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Invoice' : 'Create Fee Invoice'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">
            
            <label style={{ gridColumn: '1 / -1' }}>
              <span>Campus *</span>
              <select value={data.campus_id || ''} onChange={(e) => setData('campus_id', e.target.value)} disabled={!isSuperAdmin} required>
                <option value="" disabled>Select Campus</option>
                {campuses?.map(campus => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
              </select>
              {errors.campus_id && <em>{errors.campus_id}</em>}
            </label>

            <label>
              <span>Invoice Number *</span>
              <input value={data.invoice_no} onChange={(e) => setData('invoice_no', e.target.value)} required />
              {errors.invoice_no && <em>{errors.invoice_no}</em>}
            </label>

            <label>
              <span>Select Student *</span>
              <select value={data.student_id} onChange={(e) => setData('student_id', e.target.value)} required>
                <option value="" disabled>-- Choose Student --</option>
                {students?.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.admission_no})</option>)}
              </select>
              {errors.student_id && <em>{errors.student_id}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Fee Group / Head *</span>
              <select value={data.fee_group_id} onChange={(e) => setData('fee_group_id', e.target.value)} required>
                <option value="" disabled>-- Choose Fee Group --</option>
                {feeGroups?.map(fg => <option key={fg.id} value={fg.id}>{fg.name}</option>)}
              </select>
              {errors.fee_group_id && <em>{errors.fee_group_id}</em>}
            </label>

            <label>
              <span>Invoice Date *</span>
              <input type="date" value={data.invoice_date} onChange={(e) => setData('invoice_date', e.target.value)} required />
              {errors.invoice_date && <em>{errors.invoice_date}</em>}
            </label>

            <label>
              <span>Due Date *</span>
              <input type="date" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} required />
              {errors.due_date && <em>{errors.due_date}</em>}
            </label>

            <label>
              <span>Amount (৳) *</span>
              <input type="number" value={data.amount} onChange={(e) => setData('amount', e.target.value)} min="0" step="0.01" required />
              {errors.amount && <em>{errors.amount}</em>}
            </label>

            <label>
              <span>Discount (৳)</span>
              <input type="number" value={data.discount} onChange={(e) => setData('discount', e.target.value)} min="0" step="0.01" />
            </label>

            <label>
              <span>Fine (৳)</span>
              <input type="number" value={data.fine} onChange={(e) => setData('fine', e.target.value)} min="0" step="0.01" />
            </label>

            <label>
              <span>Status *</span>
              <select value={data.status} onChange={(e) => setData('status', e.target.value)} required>
                <option value="Unpaid">Unpaid</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Notes / Remarks</span>
              <textarea rows="2" value={data.note} onChange={(e) => setData('note', e.target.value)} placeholder="Any billing remarks..." />
            </label>

          </div>

          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : (isEdit ? 'Update Invoice' : 'Create Invoice')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}