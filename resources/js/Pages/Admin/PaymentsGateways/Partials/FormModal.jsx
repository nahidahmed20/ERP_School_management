import { useForm, router } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, processing, errors } = useForm({
    name: item?.name || '',
    api_key: item?.api_key || '',
    api_secret: item?.api_secret || '',
    webhook_secret: item?.webhook_secret || '',
    currency: item?.currency || 'BDT',
    mode: item?.mode || 'sandbox',
    is_active: item ? item.is_active : false,
    logo: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      router.post(route('admin.payments.gateways.update', item.id), {
        ...data,
        _method: 'PUT',
      }, {
        onSuccess: () => onClose(),
      });
    } else {
      post(route('admin.payments.gateways.store'), {
        onSuccess: () => onClose(),
      });
    }
  };

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Gateway' : 'Add New Gateway'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mm-form">
          <div className="mm-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            
            <label>
              <span>Gateway Name *</span>
              <input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. bKash, SSLCommerz, Stripe" required />
              {errors.name && <em>{errors.name}</em>}
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>API Key / Store ID</span>
                <input value={data.api_key} onChange={(e) => setData('api_key', e.target.value)} placeholder="Public Key or Store ID" />
              </label>

              <label>
                <span>API Secret / Store Password</span>
                <input type="password" value={data.api_secret} onChange={(e) => setData('api_secret', e.target.value)} placeholder="Secret Key or Store Password" />
              </label>
            </div>

            <label>
              <span>Webhook Secret / Signature Key</span>
              <input value={data.webhook_secret} onChange={(e) => setData('webhook_secret', e.target.value)} placeholder="For webhook verification (if applicable)" />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <label>
                <span>Currency *</span>
                <select value={data.currency} onChange={(e) => setData('currency', e.target.value)} required>
                  <option value="BDT">BDT</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </label>

              <label>
                <span>Mode *</span>
                <select value={data.mode} onChange={(e) => setData('mode', e.target.value)} required>
                  <option value="sandbox">Sandbox (Test)</option>
                  <option value="live">Live (Real)</option>
                </select>
              </label>

              <label>
                <span>Status</span>
                <select value={data.is_active ? 1 : 0} onChange={(e) => setData('is_active', e.target.value === '1')} required>
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </label>
            </div>

            <label>
              <span>Gateway Logo (Optional)</span>
              <input type="file" onChange={(e) => setData('logo', e.target.files[0])} style={{ padding: '7px', background: '#f8fafc', border: '1px dashed #cbd5e1' }} accept=".jpg,.jpeg,.png,.svg" />
              {errors.logo && <em>{errors.logo}</em>}
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : 'Save Gateway'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}