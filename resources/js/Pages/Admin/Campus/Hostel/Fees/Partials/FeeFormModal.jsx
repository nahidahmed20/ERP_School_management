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

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>

      {/* Responsive Modal Box */}
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Update Fee Record' : 'Add Hostel Fee'}</h3>
            <p className="text-sm text-slate-500 mt-1">Manage student hostel fee collection and status.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div className="sm:col-span-2">
                <label className={labelClass}>Select Student <span className="text-rose-500">*</span></label>
                <select value={data.student_id} onChange={e => setData('student_id', e.target.value)} required className={`${inputClass} bg-white`}>
                  <option value="" disabled>Choose Student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.admission_no})</option>
                  ))}
                </select>
                {errors.student_id && <p className="text-rose-500 text-xs mt-1">{errors.student_id}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Hostel &amp; Room (Optional)</label>
                <select value={data.hostel_room_id} onChange={e => setData('hostel_room_id', e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="">Select Room...</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>{r.hostel_name} - Room {r.room_number}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Billing Month <span className="text-rose-500">*</span></label>
                <select value={data.month} onChange={e => setData('month', e.target.value)} required className={`${inputClass} bg-white`}>
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className={labelClass}>Billing Year <span className="text-rose-500">*</span></label>
                <input type="number" value={data.year} onChange={e => setData('year', e.target.value)} required min="2020" className={`${inputClass} font-mono`} />
              </div>

              <div>
                <label className={labelClass}>Fee Amount (৳) <span className="text-rose-500">*</span></label>
                <input type="number" step="0.01" value={data.amount} onChange={e => setData('amount', e.target.value)} required placeholder="e.g. 2500" className={`${inputClass} font-mono font-bold text-emerald-600`} />
              </div>

              <div>
                <label className={labelClass}>Payment Status <span className="text-rose-500">*</span></label>
                <select value={data.status} onChange={e => setData('status', e.target.value)} required className={`${inputClass} bg-white`}>
                  <option value="Pending">Pending (Due)</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              {data.status === 'Paid' && (
                <div className="sm:col-span-2">
                  <label className={labelClass}>Payment Date <span className="text-rose-500">*</span></label>
                  <input type="date" value={data.payment_date} onChange={e => setData('payment_date', e.target.value)} required className={`${inputClass} font-mono`} />
                </div>
              )}

              <div className="sm:col-span-2">
                <label className={labelClass}>Remarks / Notes</label>
                <textarea rows="2" value={data.remarks} onChange={e => setData('remarks', e.target.value)} placeholder="Cash/Bank receipt details..." className={`${inputClass} resize-none`} />
              </div>

            </div>
          </div>

          {/* Footer - Stacked on Mobile, Row on Desktop */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
              <Icon name="save" className="w-4 h-4" />
              {processing ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
