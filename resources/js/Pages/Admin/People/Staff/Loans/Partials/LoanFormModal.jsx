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

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] shadow-2xl overflow-hidden transform transition-all flex flex-col ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Manage Request' : 'Add Advance / Loan Request'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure staff salary advance or loan amount.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-slate-100">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="sm:col-span-2">
                <label className={labelClass}>Select Staff Member <span className="text-rose-500">*</span></label>
                <select value={data.staff_id} onChange={e => setData('staff_id', e.target.value)} required className={inputClass}>
                  <option value="" disabled>Choose...</option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name || ''} ({s.staff_id_no})</option>
                  ))}
                </select>
                {errors.staff_id && <p className="text-rose-500 text-xs mt-1">{errors.staff_id}</p>}
              </div>

              <div>
                <label className={labelClass}>Type <span className="text-rose-500">*</span></label>
                <select value={data.loan_type} onChange={e => setData('loan_type', e.target.value)} required className={inputClass}>
                  <option value="Advance Salary">Advance Salary</option>
                  <option value="Loan">Loan</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Status <span className="text-rose-500">*</span></label>
                <select value={data.status} onChange={e => setData('status', e.target.value)} required className={inputClass}>
                  <option value="Pending">Pending Approval</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Completed">Completed (Paid Off)</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Total Amount (৳) <span className="text-rose-500">*</span></label>
                <input type="number" step="0.01" value={data.amount} onChange={e => setData('amount', e.target.value)} required placeholder="e.g. 5000" className={`${inputClass} font-mono`} />
                {errors.amount && <p className="text-rose-500 text-xs mt-1">{errors.amount}</p>}
              </div>

              <div>
                <label className={labelClass}>Monthly Deduction (৳)</label>
                <input type="number" step="0.01" value={data.monthly_deduction} onChange={e => setData('monthly_deduction', e.target.value)} placeholder="e.g. 1000" className={`${inputClass} font-mono`} />
                <span className="text-[11px] text-slate-400 block mt-1">Leave blank if deducting all at once.</span>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Reason / Notes</label>
                <textarea rows="3" value={data.reason} onChange={e => setData('reason', e.target.value)} placeholder="Enter reason for the advance..." className={`${inputClass} resize-none`} />
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} disabled={processing} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
              <Icon name="save" className="w-4 h-4" />
              {processing ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}