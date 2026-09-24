import { useForm, router } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function AccountFormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    code: item?.code || '',
    name: item?.name || '',
    type: item?.type || 'Asset',
    opening_balance: item?.opening_balance || 0,
    description: item?.description || '',
    is_active: item?.is_active ?? true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const routeName = isEdit
      ? route('admin.accounting.chart.update', item.id)
      : route('admin.accounting.chart.store');

    if (isEdit) {
      put(routeName, { onSuccess: () => { reset(); onClose(); } });
    } else {
      post(routeName, { onSuccess: () => { reset(); onClose(); } });
    }
  };

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Account' : 'Add New Account'}</h3>
            <p className="text-sm text-slate-500 mt-1">Create a bank, cash, or ledger account.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 transition-colors">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div className="sm:col-span-2">
                <label className={labelClass}>Account Category (Type) <span className="text-rose-500">*</span></label>
                <select value={data.type} onChange={(e) => setData('type', e.target.value)} required className={inputClass}>
                  <option value="Asset">Asset (Cash, Bank Accounts)</option>
                  <option value="Liability">Liability (Loans, Payables)</option>
                  <option value="Income">Income (Fees, Revenue)</option>
                  <option value="Expense">Expense (Salaries, Bills)</option>
                  <option value="Equity">Equity (Capital)</option>
                </select>
                {errors.type && <p className="text-rose-500 text-xs mt-1">{errors.type}</p>}
              </div>

              <div>
                <label className={labelClass}>Account Code</label>
                <input type="text" value={data.code} onChange={(e) => setData('code', e.target.value)} placeholder="e.g. 1001" className={`${inputClass} font-mono`} />
                <p className="text-[11px] text-slate-400 mt-1">Leave empty to auto-generate</p>
                {errors.code && <p className="text-rose-500 text-xs mt-1">{errors.code}</p>}
              </div>

              <div>
                <label className={labelClass}>Account Name <span className="text-rose-500">*</span></label>
                <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. DBBL Main Branch" required className={inputClass} />
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Opening Balance (৳)</label>
                <input type="number" step="0.01" value={data.opening_balance} onChange={(e) => setData('opening_balance', e.target.value)} placeholder="0.00" className={`${inputClass} font-mono`} />
                {errors.opening_balance && <p className="text-rose-500 text-xs mt-1">{errors.opening_balance}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Description / Note</label>
                <textarea rows="2" value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="Account details, account number, or branch..." className={`${inputClass} resize-none`} />
                {errors.description && <p className="text-rose-500 text-xs mt-1">{errors.description}</p>}
              </div>

              <div className="sm:col-span-2 flex items-center gap-2 mt-2">
                <input type="checkbox" id="is_active" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                <label htmlFor="is_active" className="text-sm font-semibold text-slate-700 cursor-pointer">Account is Active</label>
              </div>

            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} disabled={processing} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
              <Icon name="save" className="w-4 h-4" />
              {processing ? 'Saving...' : 'Save Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
