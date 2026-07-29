import { useForm, router } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, assets, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors } = useForm({
    asset_id: item?.asset_id || '',
    assignee_name: item?.assignee_name || '',
    assigned_date: item?.assigned_date || new Date().toISOString().split('T')[0],
    due_date: item?.due_date || '',
    returned_date: item?.returned_date || '',
    status: item?.status || 'Assigned',
    note: item?.note || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route('admin.purchase.asset-assignments.update', item.id), { onSuccess: () => onClose() });
    } else {
      post(route('admin.purchase.asset-assignments.store'), { onSuccess: () => onClose() });
    }
  };

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Assignment' : 'Assign Asset'}</h3>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Assignee Name *</span>
                <input value={data.assignee_name} onChange={(e) => setData('assignee_name', e.target.value)} placeholder="কাকে দেওয়া হচ্ছে" required />
                {errors.assignee_name && <em>{errors.assignee_name}</em>}
              </label>

              <label>
                <span>Status *</span>
                <select value={data.status} onChange={(e) => setData('status', e.target.value)} required>
                  <option value="Assigned">Assigned (দেওয়া হয়েছে)</option>
                  <option value="Returned">Returned (ফেরত দিয়েছে)</option>
                  <option value="Damaged">Damaged (ক্ষতিগ্রস্ত)</option>
                  <option value="Lost">Lost (হারিয়ে গেছে)</option>
                </select>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Assigned Date *</span>
                <input type="date" value={data.assigned_date} onChange={(e) => setData('assigned_date', e.target.value)} required />
                {errors.assigned_date && <em style={{color: 'red'}}>{errors.assigned_date}</em>}
              </label>

              <label>
                <span>Due Date (Optional)</span>
                <input
                   type="date"
                   value={data.due_date}
                   onChange={(e) => setData('due_date', e.target.value)}
                   min={data.assigned_date} 
                />
                {errors.due_date && <em style={{color: 'red'}}>{errors.due_date}</em>}
              </label>
            </div>

            {data.status === 'Returned' && (
                <label>
                    <span>Returned Date</span>
                    <input type="date" value={data.returned_date} onChange={(e) => setData('returned_date', e.target.value)} />
                </label>
            )}

            <label>
              <span>Note / Condition</span>
              <textarea rows="2" value={data.note} onChange={(e) => setData('note', e.target.value)} placeholder="কোনো বিশেষ নোট (যেমন: চার্জারসহ)..." />
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
