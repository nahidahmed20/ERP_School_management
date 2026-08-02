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

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={e => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit API Key Settings' : 'Generate New API Key'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={submit} className="mm-form">

          {!isEdit && (
            <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '6px', marginBottom: '15px', fontSize: '13px', color: '#1e3a8a', border: '1px solid #bfdbfe' }}>
              <strong>Note:</strong> The API Key token will be generated automatically and securely by the system once you save this form.
            </div>
          )}

          <div className="mm-form-grid">

            <label style={{ gridColumn: '1 / -1' }}><span>Key Name / Application Name *</span>
              <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required placeholder="e.g. Mobile App Integration" />
              {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}><span>Assign to Tenant (Optional)</span>
              <select value={data.tenant_id} onChange={e => setData('tenant_id', e.target.value)}>
                <option value="">Global / Master API Key</option>
                {tenants?.map(t => (
                  <option key={t.id} value={t.id}>{t.company_name}</option>
                ))}
              </select>
            </label>

            <label><span>Expiry Date (Optional)</span>
              <input type="date" value={data.expires_at} onChange={e => setData('expires_at', e.target.value)} />
            </label>

            <label className="mm-checkbox" style={{ gridColumn: '1 / -1' }}>
              <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} /> Active (Uncheck to revoke access instantly)
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>
              <Icon name={isEdit ? "save" : "key"} /> {processing ? 'Processing...' : (isEdit ? 'Update Key' : 'Generate Key')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
