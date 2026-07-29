import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, assets, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors } = useForm({
    asset_id: item?.asset_id || '',
    title: item?.title || '',
    maintenance_type: item?.maintenance_type || 'Repair',
    service_provider: item?.service_provider || '',
    cost: item?.cost || '',
    start_date: item?.start_date || new Date().toISOString().split('T')[0],
    end_date: item?.end_date || '',
    status: item?.status || 'Pending',
    details: item?.details || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route('admin.purchase.asset-maintenance.update', item.id), { onSuccess: () => onClose() });
    } else {
      post(route('admin.purchase.asset-maintenance.store'), { onSuccess: () => onClose() });
    }
  };

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Maintenance Task' : 'Add Maintenance Task'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mm-form">
          <div className="mm-form-grid" style={{ gridTemplateColumns: '1fr' }}>

            <label>
              <span>Select Asset *</span>
              <select value={data.asset_id} onChange={(e) => setData('asset_id', e.target.value)} required>
                <option value="">-- অ্যাসেট সিলেক্ট করুন --</option>
                {assets.map(asset => (
                  <option key={asset.id} value={asset.id}>{asset.name}</option>
                ))}
              </select>
              {errors.asset_id && <em>{errors.asset_id}</em>}
            </label>

            <label>
              <span>Task Title *</span>
              <input value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="e.g. AC Gas Refill, RAM Upgrade" required />
              {errors.title && <em>{errors.title}</em>}
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Maintenance Type *</span>
                <select value={data.maintenance_type} onChange={(e) => setData('maintenance_type', e.target.value)} required>
                  <option value="Repair">Repair (মেরামত)</option>
                  <option value="Servicing">Servicing (সার্ভিসিং)</option>
                  <option value="Upgrade">Upgrade (আপগ্রেড)</option>
                </select>
              </label>

              <label>
                <span>Estimated / Actual Cost *</span>
                <input type="number" step="0.01" value={data.cost} onChange={(e) => setData('cost', e.target.value)} placeholder="0.00" required />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Service Provider (Optional)</span>
                <input value={data.service_provider} onChange={(e) => setData('service_provider', e.target.value)} placeholder="Shop name or technician" />
              </label>

              <label>
                <span>Status *</span>
                <select value={data.status} onChange={(e) => setData('status', e.target.value)} required>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Start Date *</span>
                <input type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} required />
                {errors.start_date && <em style={{color: 'red'}}>{errors.start_date}</em>}
              </label>

              <label>
                <span>End Date (Optional)</span>
                <input
                  type="date"
                  value={data.end_date}
                  onChange={(e) => setData('end_date', e.target.value)}
                  min={data.start_date}
                />
                {errors.end_date && <em style={{color: 'red'}}>{errors.end_date}</em>}
              </label>
            </div>

            <label>
              <span>Details / Issue Description</span>
              <textarea rows="2" value={data.details} onChange={(e) => setData('details', e.target.value)} placeholder="সমস্যার বিস্তারিত বর্ণনা বা কী কাজ করা হয়েছে..." />
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : 'Save Record'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
