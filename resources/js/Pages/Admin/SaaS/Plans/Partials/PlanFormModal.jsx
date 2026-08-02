import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function PlanFormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, reset, errors } = useForm({
    name: item?.name ?? '',
    price: item?.price ?? '',
    currency: item?.currency ?? 'BDT',
    billing_cycle: item?.billing_cycle ?? 'Monthly',
    features: item?.features ? item.features.join('\n') : '', // join array with new lines for textarea
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.saas.plans.update', item.id), options);
    else post(route('admin.saas.plans.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={e => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Subscription Plan' : 'Create New Plan'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">

            <label style={{ gridColumn: '1 / -1' }}><span>Plan Name *</span>
              <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required placeholder="e.g. Premium Plan" />
              {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
            </label>

            <label><span>Currency *</span>
              <select value={data.currency} onChange={e => setData('currency', e.target.value)}>
                <option value="BDT">BDT (৳)</option>
                <option value="USD">USD ($)</option>
              </select>
            </label>

            <label><span>Price *</span>
              <input type="number" step="0.01" value={data.price} onChange={e => setData('price', e.target.value)} required placeholder="e.g. 5000" />
            </label>

            <label style={{ gridColumn: '1 / -1' }}><span>Billing Cycle *</span>
              <select value={data.billing_cycle} onChange={e => setData('billing_cycle', e.target.value)}>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
                <option value="Lifetime">Lifetime (One-time)</option>
              </select>
            </label>

            <label style={{ gridColumn: '1 / -1' }}><span>Plan Features (One feature per line)</span>
              <textarea
                rows="5"
                value={data.features}
                onChange={e => setData('features', e.target.value)}
                placeholder="Unlimited Students&#10;Custom Domain&#10;Premium Support"
              ></textarea>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Press Enter to add a new feature.</span>
            </label>

            <label className="mm-checkbox" style={{ gridColumn: '1 / -1' }}>
              <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} /> Active Plan (Visible to clients)
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>
              <Icon name="save" /> {processing ? 'Saving...' : (isEdit ? 'Update Plan' : 'Create Plan')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
