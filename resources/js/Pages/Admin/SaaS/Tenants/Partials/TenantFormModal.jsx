import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function TenantFormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, reset, errors } = useForm({
    company_name: item?.company_name ?? '',
    domain: item?.domain ?? '',
    admin_email: item?.admin_email ?? '',
    admin_phone: item?.admin_phone ?? '',
    subscription_plan: item?.subscription_plan ?? 'Trial',
    status: item?.status ?? 'Active',
    valid_until: item?.valid_until ? item.valid_until.split('T')[0] : '', // Format for date input
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.saas.tenants.update', item.id), options);
    else post(route('admin.saas.tenants.store'), options);
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
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Tenant Billing' : 'Onboard New Tenant'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure client details, domain, and subscription plan.</p>
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
                <label className={labelClass}>School / Company Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={data.company_name}
                  onChange={e => setData('company_name', e.target.value)}
                  required
                  placeholder="e.g. Dhaka Public School"
                  className={inputClass}
                  autoFocus
                />
                {errors.company_name && <p className="text-rose-500 text-xs mt-1">{errors.company_name}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Subdomain / Domain <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="globe" className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={data.domain}
                    onChange={e => setData('domain', e.target.value)}
                    required
                    placeholder="e.g. dhakapublic.schoolerp.com"
                    className={`${inputClass} pl-9 font-mono`}
                  />
                </div>
                {errors.domain && <p className="text-rose-500 text-xs mt-1">{errors.domain}</p>}
              </div>

              <div>
                <label className={labelClass}>Admin Email (Primary) <span className="text-rose-500">*</span></label>
                <input
                  type="email"
                  value={data.admin_email}
                  onChange={e => setData('admin_email', e.target.value)}
                  required
                  placeholder="admin@dhakapublic.com"
                  className={inputClass}
                />
                {errors.admin_email && <p className="text-rose-500 text-xs mt-1">{errors.admin_email}</p>}
              </div>

              <div>
                <label className={labelClass}>Admin Phone</label>
                <input
                  type="text"
                  value={data.admin_phone}
                  onChange={e => setData('admin_phone', e.target.value)}
                  placeholder="+8801..."
                  className={`${inputClass} font-mono`}
                />
                {errors.admin_phone && <p className="text-rose-500 text-xs mt-1">{errors.admin_phone}</p>}
              </div>

              <div>
                <label className={labelClass}>Subscription Plan <span className="text-rose-500">*</span></label>
                <select value={data.subscription_plan} onChange={e => setData('subscription_plan', e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="Trial">14-Days Trial</option>
                  <option value="Basic">Basic Plan</option>
                  <option value="Standard">Standard Plan</option>
                  <option value="Premium">Premium Plan</option>
                </select>
                {errors.subscription_plan && <p className="text-rose-500 text-xs mt-1">{errors.subscription_plan}</p>}
              </div>

              <div>
                <label className={labelClass}>Valid Until (Billing Date)</label>
                <input
                  type="date"
                  value={data.valid_until}
                  onChange={e => setData('valid_until', e.target.value)}
                  className={`${inputClass} font-mono`}
                />
                <span className="text-xs text-slate-400 mt-1 block">Leave empty for lifetime access.</span>
                {errors.valid_until && <p className="text-rose-500 text-xs mt-1">{errors.valid_until}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Tenant Status <span className="text-rose-500">*</span></label>
                <select value={data.status} onChange={e => setData('status', e.target.value)} className={`${inputClass} bg-white font-semibold ${
                  data.status === 'Active' ? 'text-emerald-700 border-emerald-300' :
                  data.status === 'Trial Expired' ? 'text-rose-700 border-rose-300' :
                  'text-amber-700 border-amber-300'
                }`}>
                  <option value="Active">Active & Running</option>
                  <option value="Suspended">Suspended (Unpaid)</option>
                  <option value="Trial Expired">Trial Expired</option>
                </select>
                {errors.status && <p className="text-rose-500 text-xs mt-1">{errors.status}</p>}
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
              <Icon name="save" className="w-4 h-4" />
              {processing ? 'Saving...' : (isEdit ? 'Update Tenant' : 'Onboard Tenant')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
