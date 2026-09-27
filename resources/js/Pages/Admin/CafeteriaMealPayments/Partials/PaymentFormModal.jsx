import { useForm, usePage } from '@inertiajs/react';
import WorkingCampusField from '@/Components/WorkingCampusField';
import Icon from '@/Components/Icons';

export default function PaymentFormModal({ item, users, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? auth?.active_campus_id ?? activeCampusId ?? '',
    user_id: item?.wallet?.user_id ?? '',
    amount: item?.amount ?? '',
    payment_method: item?.payment_method ?? 'Cash',
    transaction_id: item?.reference_no ?? '',
    remarks: item?.notes ?? '',
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.cafeteria.meal-payments.update', item.id), options);
    else post(route('admin.cafeteria.meal-payments.store'), options);
  }

  const inputClass = "block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Icon name="credit-card" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Update Payment' : 'New Wallet Recharge'}</h3>
              <p className="text-sm text-slate-500">Top-up student or staff cafeteria wallet.</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex justify-center items-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"><Icon name="close" className="w-5 h-5" /></button>
        </div>

        {/* Body */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelClass}>Campus Selection <span className="text-rose-500">*</span></label>
                <WorkingCampusField value={data.campus_id} campuses={campuses} className={`${inputClass} ${!isSuperAdmin ? 'bg-slate-100 opacity-70 cursor-not-allowed' : ''}`} />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Select Account <span className="text-rose-500">*</span></label>
                <select value={data.user_id} onChange={e => setData('user_id', e.target.value)} required className={inputClass} disabled={isEdit}>
                  <option value="" disabled>Search Student or Staff...</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                {isEdit && <p className="text-[11px] font-bold text-amber-600 mt-1.5 uppercase">User account cannot be changed after creation.</p>}
                {errors.user_id && <p className="text-rose-500 text-xs mt-1">{errors.user_id}</p>}
              </div>

              <div>
                <label className={labelClass}>Recharge Amount (৳) <span className="text-rose-500">*</span></label>
                <input type="number" step="0.01" min="1" value={data.amount} onChange={e => setData('amount', e.target.value)} required placeholder="e.g. 500" className={`${inputClass} font-mono font-bold text-lg text-emerald-600 placeholder:text-slate-300 placeholder:font-normal`} />
              </div>

              <div>
                <label className={labelClass}>Payment Method <span className="text-rose-500">*</span></label>
                <select value={data.payment_method} onChange={e => setData('payment_method', e.target.value)} required className={inputClass}>
                  <option value="Cash">Cash</option>
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Bank">Bank / Card</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Transaction / Receipt ID (Optional)</label>
                <input type="text" value={data.transaction_id} onChange={e => setData('transaction_id', e.target.value)} placeholder="e.g. TRX987654321" className={`${inputClass} font-mono`} />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Internal Notes (Optional)</label>
                <textarea rows="2" value={data.remarks} onChange={e => setData('remarks', e.target.value)} placeholder="Any special notes about this payment..." className={`${inputClass} resize-none`} />
              </div>
            </div>

            {/* 🟢 Pro feature hint */}
            {!isEdit && (
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-blue-800">
                <Icon name="info" className="w-5 h-5 shrink-0 text-blue-500" />
                <p className="text-sm">Upon saving, the wallet balance will be updated instantly, and the user can use it immediately at the cafeteria POS.</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0 rounded-b-3xl">
            <button type="button" onClick={onClose} disabled={processing} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors">
              Cancel
            </button>
            
            <button type="submit" disabled={processing} className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 shadow-xl shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 min-w-[200px]">
              {processing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white/70" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Icon name="check-circle" className="w-5 h-5 text-white/70" /> {isEdit ? 'Update Payment' : 'Confirm Recharge'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}