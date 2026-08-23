import { useForm, router } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, gateways, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    payment_gateway_id: item?.payment_gateway_id || '',
    transaction_id: item?.transaction_id || '',
    reference_no: item?.reference_no || '',
    amount: item?.amount || '',
    currency: item?.currency || 'BDT',
    payment_method: item?.payment_method || '',
    status: item?.status || 'Completed',
    transaction_date: item?.transaction_date || new Date().toISOString().split('T')[0],
    note: item?.note || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route('admin.payments.transactions.update', item.id), {
        onSuccess: () => { reset(); onClose(); },
      });
    } else {
      post(route('admin.payments.transactions.store'), {
        onSuccess: () => { reset(); onClose(); },
      });
    }
  };

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>

      {/* Responsive Modal Box */}
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Transaction' : 'Add Manual Transaction'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure transaction details and payment status.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div>
                <label className={labelClass}>Transaction ID <span className="text-rose-500">*</span></label>
                <input
                  value={data.transaction_id}
                  onChange={(e) => setData('transaction_id', e.target.value)}
                  placeholder="e.g. TXN123456"
                  className={`${inputClass} font-mono`}
                  required
                  autoFocus
                />
                {errors.transaction_id && <p className="text-rose-500 text-xs mt-1">{errors.transaction_id}</p>}
              </div>

              <div>
                <label className={labelClass}>Reference No / Invoice</label>
                <input
                  value={data.reference_no}
                  onChange={(e) => setData('reference_no', e.target.value)}
                  placeholder="e.g. INV-001"
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div>
                <label className={labelClass}>Gateway <span className="text-slate-400 font-normal">(Optional)</span></label>
                <select value={data.payment_gateway_id} onChange={(e) => setData('payment_gateway_id', e.target.value)} className={inputClass}>
                  <option value="">-- Manual / No Gateway --</option>
                  {gateways.map(gw => (
                    <option key={gw.id} value={gw.id}>{gw.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Payment Method</label>
                <input
                  value={data.payment_method}
                  onChange={(e) => setData('payment_method', e.target.value)}
                  placeholder="e.g. Cash, Card, Mobile"
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-5 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <label className={labelClass}>Amount <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    value={data.amount}
                    onChange={(e) => setData('amount', e.target.value)}
                    required
                    className={`${inputClass} font-mono font-bold text-emerald-600 bg-white`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Currency</label>
                  <input
                    value={data.currency}
                    onChange={(e) => setData('currency', e.target.value)}
                    className={`${inputClass} font-mono bg-white`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Status <span className="text-rose-500">*</span></label>
                  <select value={data.status} onChange={(e) => setData('status', e.target.value)} required className={`${inputClass} bg-white`}>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Failed">Failed</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Transaction Date <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  value={data.transaction_date}
                  onChange={(e) => setData('transaction_date', e.target.value)}
                  required
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Notes / Reason</label>
                <textarea
                  rows="2"
                  value={data.note}
                  onChange={(e) => setData('note', e.target.value)}
                  placeholder="অতিরিক্ত কোনো তথ্য বা নোট..."
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
              <Icon name="save" className="w-4 h-4" />
              {processing ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
