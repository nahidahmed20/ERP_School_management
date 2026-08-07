import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';
import { useEffect } from 'react';

export default function FeeFormModal({ item, students, rooms, onClose }) {
  const isEdit = !!item;

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  const { data, setData, post, put, processing, reset, errors } = useForm({
    student_id: item?.student_id ?? '',
    hostel_room_id: item?.hostel_room_id ?? '',
    amount: item?.amount ?? '',
    month: item?.month ?? currentMonth,
    year: item?.year ?? currentYear,
    status: item?.status ?? 'Pending',
    payment_date: item?.payment_date ? item.payment_date.split('T')[0] : '',
    remarks: item?.remarks ?? '',
  });

  // Auto-set payment date if status changes to Paid
  useEffect(() => {
    if (data.status === 'Paid' && !data.payment_date) {
      setData('payment_date', new Date().toISOString().split('T')[0]);
    }
  }, [data.status]);

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.hostel-fees.update', item.id), options);
    else post(route('admin.hostel-fees.store'), options);
  }

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={e => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Update Fee Record' : 'Add Hostel Fee'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">
            
            <label style={{ gridColumn: '1 / -1' }}><span>Select Student *</span>
              <select value={data.student_id} onChange={e => setData('student_id', e.target.value)} required>
                <option value="">Choose Student...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.admission_no})</option>
                ))}
              </select>
              {errors.student_id && <span className="text-red-500 text-xs">{errors.student_id}</span>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}><span>Hostel & Room (Optional)</span>
              <select value={data.hostel_room_id} onChange={e => setData('hostel_room_id', e.target.value)}>
                <option value="">Select Room...</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>{r.hostel_name} - Room {r.room_number}</option>
                ))}
              </select>
            </label>

            <label><span>Billing Month *</span>
              <select value={data.month} onChange={e => setData('month', e.target.value)} required>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>

            <label><span>Billing Year *</span>
              <input type="number" value={data.year} onChange={e => setData('year', e.target.value)} required min="2020" />
            </label>

            <label><span>Fee Amount (৳) *</span>
              <input type="number" step="0.01" value={data.amount} onChange={e => setData('amount', e.target.value)} required placeholder="e.g. 2500" />
            </label>

            <label><span>Payment Status *</span>
              <select value={data.status} onChange={e => setData('status', e.target.value)} required>
                <option value="Pending">Pending (Due)</option>
                <option value="Paid">Paid</option>
              </select>
            </label>

            {data.status === 'Paid' && (
              <label style={{ gridColumn: '1 / -1' }}><span>Payment Date *</span>
                <input type="date" value={data.payment_date} onChange={e => setData('payment_date', e.target.value)} required />
              </label>
            )}

            <label style={{ gridColumn: '1 / -1' }}><span>Remarks / Notes</span>
              <textarea rows="2" value={data.remarks} onChange={e => setData('remarks', e.target.value)} placeholder="Cash/Bank receipt details..."></textarea>
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing} style={{ background: '#4f46e5' }}>
              <Icon name="save" /> {processing ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}