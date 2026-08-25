import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function ApiKeyFormModal({ item, tenants, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, reset, errors } = useForm({
    name: item?.name ?? '',
    tenant_id: item?.tenant_id ?? '',
    expires_at: item?.expires_at ? item.expires_at.split('T')[0] : '',
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.saas.apikeys.update', item.id), options);
    else post(route('admin.saas.apikeys.store'), options);
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      
      {/* Responsive Modal Box */}
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit API Key Settings' : 'Generate New API Key'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure permissions and access for third-party integrations.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">

            {!isEdit && (
              <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-xl flex items-start gap-3 shadow-sm animate-in fade-in">
                <Icon name="info" className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-blue-800 mb-0.5">Automatic Generation</h4>
                  <p className="text-xs font-medium text-blue-700 leading-relaxed">
                    The API Key token will be generated automatically and securely by the system once you save this form. You will be able to copy it from the list.
                  </p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="sm:col-span-2">
                <label className={labelClass}>Key Name / Application Name <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={data.name} 
                  onChange={e => setData('name', e.target.value)} 
                  required 
                  placeholder="e.g. Mobile App Integration" 
                  className={inputClass} 
                  autoFocus 
                />
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Assign to Tenant (Optional)</label>
                <select value={data.tenant_id} onChange={e => setData('tenant_id', e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="">Global / Master API Key</option>
                  {tenants?.map(t => (
                    <option key={t.id} value={t.id}>{t.company_name}</option>
                  ))}
                </select>
                {errors.tenant_id && <p className="text-rose-500 text-xs mt-1">{errors.tenant_id}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Expiry Date (Optional)</label>
                <input 
                  type="date" 
                  value={data.expires_at} 
                  onChange={e => setData('expires_at', e.target.value)} 
                  className={`${inputClass} font-mono`} 
                />
                <span className="text-xs text-slate-400 mt-1.5 block">Leave empty if the key should never expire.</span>
                {errors.expires_at && <p className="text-rose-500 text-xs mt-1">{errors.expires_at}</p>}
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer group w-max">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={data.is_active}
                      onChange={(e) => setData('is_active', e.target.checked)}
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-0 checked:bg-emerald-600 checked:border-emerald-600 cursor-pointer transition-colors"
                    />
                    <svg className="absolute w-3.5 h-3.5 top-[3px] left-[3px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Active Key</span>
                    <span className="text-xs text-slate-400">Uncheck to revoke access instantly without deleting the key.</span>
                  </div>
                </label>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
              <Icon name={isEdit ? "save" : "key"} className="w-4 h-4" />
              {processing ? 'Processing...' : (isEdit ? 'Update Key' : 'Generate Key')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}