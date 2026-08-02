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

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={e => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Tenant Billing' : 'Onboard New Tenant'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">

            <label style={{ gridColumn: '1 / -1' }}><span>School / Company Name *</span>
              <input type="text" value={data.company_name} onChange={e => setData('company_name', e.target.value)} required placeholder="e.g. Dhaka Public School" />
              {errors.company_name && <span className="text-red-500 text-xs">{errors.company_name}</span>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}><span>Subdomain / Domain *</span>
              <input type="text" value={data.domain} onChange={e => setData('domain', e.target.value)} required placeholder="e.g. dhakapublic.schoolerp.com" />
              {errors.domain && <span className="text-red-500 text-xs">{errors.domain}</span>}
            </label>

            <label><span>Admin Email (Primary) *</span>
              <input type="email" value={data.admin_email} onChange={e => setData('admin_email', e.target.value)} required placeholder="admin@dhakapublic.com" />
            </label>

            <label><span>Admin Phone</span>
              <input type="text" value={data.admin_phone} onChange={e => setData('admin_phone', e.target.value)} placeholder="+8801..." />
            </label>

            <label><span>Subscription Plan *</span>
              <select value={data.subscription_plan} onChange={e => setData('subscription_plan', e.target.value)}>
                <option value="Trial">14-Days Trial</option>
                <option value="Basic">Basic Plan</option>
                <option value="Standard">Standard Plan</option>
                <option value="Premium">Premium Plan</option>
              </select>
            </label>

            <label><span>Valid Until (Billing Date)</span>
              <input type="date" value={data.valid_until} onChange={e => setData('valid_until', e.target.value)} />
            </label>

            <label style={{ gridColumn: '1 / -1' }}><span>Tenant Status *</span>
              <select value={data.status} onChange={e => setData('status', e.target.value)}>
                <option value="Active">Active & Running</option>
                <option value="Suspended">Suspended (Unpaid)</option>
                <option value="Trial Expired">Trial Expired</option>
              </select>
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>
              <Icon name="save" /> {processing ? 'Saving...' : (isEdit ? 'Update Tenant' : 'Onboard Tenant')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
