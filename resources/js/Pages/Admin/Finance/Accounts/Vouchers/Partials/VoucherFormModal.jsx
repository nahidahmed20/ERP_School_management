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

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  // Dynamic Notice Based on Voucher Type
  const getVoucherNotice = () => {
    switch (data.voucher_type) {
      case 'Payment': return { color: 'bg-rose-50 border-rose-200 text-rose-800', text: 'Credit cash/bank account and Debit the expense/payable account.' };
      case 'Receipt': return { color: 'bg-emerald-50 border-emerald-200 text-emerald-800', text: 'Debit cash/bank account and Credit the income/receivable account.' };
      case 'Contra': return { color: 'bg-sky-50 border-sky-200 text-sky-800', text: 'Used only for transactions between Cash and Bank accounts.' };
      case 'Journal': return { color: 'bg-slate-100 border-slate-300 text-slate-800', text: 'Used for adjustments, depreciation, or non-cash transactions.' };
      default: return { color: 'bg-indigo-50 border-indigo-200 text-indigo-800', text: 'Select a voucher type to see rules.' };
    }
  };

  const notice = getVoucherNotice();

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
            <h3 className="text-xl font-bold text-slate-900">Create Accounting Voucher</h3>
            <p className="text-sm text-slate-500 mt-1">Post a new transaction into the ledger.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">

            {/* Helper Notice */}
            <div className={`p-4 rounded-xl border flex items-start gap-3 text-sm leading-relaxed ${notice.color}`}>
              <Icon name="info" className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="block sm:inline">{data.voucher_type} Rule:</strong> {notice.text}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div>
                <label className={labelClass}>Voucher Date <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  value={data.date}
                  onChange={e => setData('date', e.target.value)}
                  required
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div>
                <label className={labelClass}>Voucher Type <span className="text-rose-500">*</span></label>
                <select
                  value={data.voucher_type}
                  onChange={e => setData('voucher_type', e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="Payment">Payment Voucher</option>
                  <option value="Receipt">Receipt Voucher</option>
                  <option value="Contra">Contra Voucher</option>
                  <option value="Journal">Journal Voucher</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Debit Account (DR) <span className="text-rose-500">*</span></label>
                <select
                  value={data.debit_account_id}
                  onChange={e => setData('debit_account_id', e.target.value)}
                  required
                  className={`${inputClass} border-indigo-200 bg-indigo-50/30`}
                >
                  <option value="" disabled>-- Select Debit Account --</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                  ))}
                </select>
                {errors.debit_account_id && <p className="text-rose-500 text-xs mt-1">{errors.debit_account_id}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Credit Account (CR) <span className="text-rose-500">*</span></label>
                <select
                  value={data.credit_account_id}
                  onChange={e => setData('credit_account_id', e.target.value)}
                  required
                  className={`${inputClass} border-amber-200 bg-amber-50/30`}
                >
                  <option value="" disabled>-- Select Credit Account --</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                  ))}
                </select>
                {errors.credit_account_id && <p className="text-rose-500 text-xs mt-1">{errors.credit_account_id}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Amount (৳) <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  value={data.amount}
                  onChange={e => setData('amount', e.target.value)}
                  required
                  placeholder="e.g. 5000.00"
                  className={`${inputClass} font-mono text-lg font-bold text-emerald-600`}
                />
                {errors.amount && <p className="text-rose-500 text-xs mt-1">{errors.amount}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Narration / Description</label>
                <textarea
                  rows="2"
                  value={data.description}
                  onChange={e => setData('description', e.target.value)}
                  placeholder="Transaction details or cheque number..."
                  className={`${inputClass} resize-none`}
                />
              </div>

            </div>
          </div>

          {/* Footer - Stacked on Mobile, Row on Desktop */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
              <Icon name="check" className="w-4 h-4" />
              {processing ? 'Posting...' : 'Post Voucher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
