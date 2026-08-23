import { useForm, router } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, processing, errors, reset } = useForm({
    name: item?.name || '',
    api_key: item?.api_key || '',
    api_secret: item?.api_secret || '',
    webhook_secret: item?.webhook_secret || '',
    currency: item?.currency || 'BDT',
    mode: item?.mode || 'sandbox',
    is_active: item ? item.is_active : false,
    logo: null,
    _method: isEdit ? 'PUT' : 'POST'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const routeName = isEdit ? route('admin.payments.gateways.update', item.id) : route('admin.payments.gateways.store');
    
    post(routeName, {
      forceFormData: true,
      onSuccess: () => { reset(); onClose(); },
    });
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
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Gateway' : 'Add New Gateway'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure API keys and credentials for payment gateway.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]" encType="multipart/form-data">
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="sm:col-span-2">
                <label className={labelClass}>Gateway Name <span className="text-rose-500">*</span></label>
                <input 
                  value={data.name} 
                  onChange={(e) => setData('name', e.target.value)} 
                  placeholder="e.g. bKash, SSLCommerz, Stripe" 
                  className={inputClass} 
                  required 
                  autoFocus
                />
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className={labelClass}>API Key / Store ID</label>
                <input 
                  value={data.api_key} 
                  onChange={(e) => setData('api_key', e.target.value)} 
                  placeholder="Public Key or Store ID" 
                  className={`${inputClass} font-mono`} 
                />
                {errors.api_key && <p className="text-rose-500 text-xs mt-1">{errors.api_key}</p>}
              </div>

              <div>
                <label className={labelClass}>API Secret / Store Password</label>
                <input 
                  type="password" 
                  value={data.api_secret} 
                  onChange={(e) => setData('api_secret', e.target.value)} 
                  placeholder="Secret Key or Store Password" 
                  className={`${inputClass} font-mono`} 
                />
                {errors.api_secret && <p className="text-rose-500 text-xs mt-1">{errors.api_secret}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Webhook Secret / Signature Key</label>
                <input 
                  value={data.webhook_secret} 
                  onChange={(e) => setData('webhook_secret', e.target.value)} 
                  placeholder="For webhook verification (if applicable)" 
                  className={`${inputClass} font-mono`} 
                />
                {errors.webhook_secret && <p className="text-rose-500 text-xs mt-1">{errors.webhook_secret}</p>}
              </div>

              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-5 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <label className={labelClass}>Currency <span className="text-rose-500">*</span></label>
                  <select value={data.currency} onChange={(e) => setData('currency', e.target.value)} required className={`${inputClass} bg-white`}>
                    <option value="BDT">BDT</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Mode <span className="text-rose-500">*</span></label>
                  <select value={data.mode} onChange={(e) => setData('mode', e.target.value)} required className={`${inputClass} bg-white`}>
                    <option value="sandbox">Sandbox (Test)</option>
                    <option value="live">Live (Real)</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Status</label>
                  <select value={data.is_active ? 1 : 0} onChange={(e) => setData('is_active', e.target.value === '1')} required className={`${inputClass} bg-white`}>
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Gateway Logo <span className="text-slate-400 font-normal">(Optional)</span></label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-indigo-400 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Icon name="upload" className="w-6 h-6 text-slate-400 mb-1" />
                    <p className="text-sm text-slate-500 font-semibold">{data.logo ? data.logo.name : 'Click to select image or drag and drop'}</p>
                  </div>
                  <input type="file" onChange={(e) => setData('logo', e.target.files[0])} accept=".jpg,.jpeg,.png,.svg" className="hidden" />
                </label>
                {isEdit && !data.logo && (
                  <p className="text-xs text-slate-500 mt-1.5 italic">Leave empty to keep the current logo.</p>
                )}
                {errors.logo && <p className="text-rose-500 text-xs mt-1">{errors.logo}</p>}
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
              <Icon name="save" className="w-4 h-4" />
              {processing ? 'Saving...' : 'Save Gateway'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}