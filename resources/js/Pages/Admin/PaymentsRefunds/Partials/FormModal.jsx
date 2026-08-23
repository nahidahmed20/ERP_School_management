import { useForm, router } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, transactions, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    payment_transaction_id: item?.payment_transaction_id || '',
    amount: item?.amount || '',
    reason: item?.reason || '',
    status: item?.status || 'Pending',
    refund_date: item?.refund_date || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route('admin.payments.refunds.update', item.id), {
        onSuccess: () => { reset(); onClose(); },
      });
    } else {
      post(route('admin.payments.refunds.store'), {
        onSuccess: () => { reset(); onClose(); },
      });
    }
  };

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div 
        className="mm-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ padding: 0, overflow: 'hidden', maxWidth: '800px', width: '100%' }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Refund' : 'Initiate Refund'}</h3>
            <p className="text-sm text-slate-500 mt-1">Request or update a transaction refund.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]">
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="sm:col-span-2">
                <label className={labelClass}>Select Transaction (Only Completed) <span className="text-rose-500">*</span></label>
                <select 
                  value={data.payment_transaction_id} 
                  onChange={(e) => setData('payment_transaction_id', e.target.value)} 
                  required 
                  disabled={isEdit} 
                  className={`${inputClass} disabled:bg-slate-100 disabled:opacity-70`}
                >
                  <option value="" disabled>-- ট্রানজেকশন সিলেক্ট করুন --</option>
                  {transactions.map(txn => (
                    <option key={txn.id} value={txn.id}>
                      {txn.transaction_id} (Paid: {txn.amount} {txn.currency}) - {txn.reference_no}
                    </option>
                  ))}
                </select>
                {errors.payment_transaction_id && <p className="text-rose-500 text-xs mt-1">{errors.payment_transaction_id}</p>}
              </div>

              <div>
                <label className={labelClass}>Refund Amount <span className="text-rose-500">*</span></label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={data.amount} 
                  onChange={(e) => setData('amount', e.target.value)} 
                  placeholder="কত টাকা ফেরত দেবেন" 
                  className={`${inputClass} font-mono text-lg font-bold text-rose-600 bg-white`} 
                  required 
                  autoFocus
                />
                {errors.amount && <p className="text-rose-500 text-xs mt-1">{errors.amount}</p>}
              </div>

              <div>
                <label className={labelClass}>Status <span className="text-rose-500">*</span></label>
                <select value={data.status} onChange={(e) => setData('status', e.target.value)} required className={`${inputClass} bg-white`}>
                  <option value="Pending">Pending (অপেক্ষমান)</option>
                  <option value="Approved">Approved (অনুমোদিত)</option>
                  <option value="Refunded">Refunded (ফেরত দেওয়া হয়েছে)</option>
                  <option value="Rejected">Rejected (বাতিল)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Refund Date (If Refunded)</label>
                <input 
                  type="date" 
                  value={data.refund_date} 
                  onChange={(e) => setData('refund_date', e.target.value)} 
                  className={`${inputClass} font-mono`} 
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Reason for Refund <span className="text-rose-500">*</span></label>
                <textarea 
                  rows="3" 
                  value={data.reason} 
                  onChange={(e) => setData('reason', e.target.value)} 
                  placeholder="কেন টাকা ফেরত দেওয়া হচ্ছে তার কারণ..." 
                  className={`${inputClass} resize-none`} 
                  required 
                />
                {errors.reason && <p className="text-rose-500 text-xs mt-1">{errors.reason}</p>}
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
              <Icon name="refresh" className="w-4 h-4" />
              {processing ? 'Saving...' : 'Save Refund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}