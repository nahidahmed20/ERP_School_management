import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function RequestFormModal({ item, users, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    requested_by: item?.requested_by ?? auth?.user?.id ?? '', 
    title: item?.title ?? '',
    description: item?.description ?? '',
    estimated_amount: item?.estimated_amount ?? '',
    expected_date: item?.expected_date ?? '',
    status: item?.status ?? 'Pending',
    admin_remark: item?.admin_remark ?? '',
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.purchase.requests.update', item.id), options);
    else post(route('admin.purchase.requests.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Purchase Request' : 'New Purchase Request'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Campus *</span>
              <select value={data.campus_id || ''} onChange={(e) => setData('campus_id', e.target.value)} disabled={!isSuperAdmin} required>
                <option value="" disabled>Select Campus</option>
                {campuses?.map(campus => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
              </select>
              {errors.campus_id && <em>{errors.campus_id}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Request Title (Purpose) *</span>
              <input value={data.title} onChange={(e) => setData('title', e.target.value)} autoFocus required placeholder="e.g. Need 10 new computers for Lab" />
              {errors.title && <em>{errors.title}</em>}
            </label>

            <label>
              <span>Requested By *</span>
              <select value={data.requested_by} onChange={(e) => setData('requested_by', e.target.value)} required>
                <option value="" disabled>Select Requester</option>
                {users?.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              {errors.requested_by && <em>{errors.requested_by}</em>}
            </label>

            <label>
              <span>Estimated Amount (৳) *</span>
              <input type="number" value={data.estimated_amount} onChange={(e) => setData('estimated_amount', e.target.value)} min="0" required />
              {errors.estimated_amount && <em>{errors.estimated_amount}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Description / Item List *</span>
              <textarea rows="3" value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="List the items needed and quantities..." required />
              {errors.description && <em>{errors.description}</em>}
            </label>

            <label>
              <span>Expected Date *</span>
              <input type="date" value={data.expected_date} onChange={(e) => setData('expected_date', e.target.value)} required />
              {errors.expected_date && <em>{errors.expected_date}</em>}
            </label>

            <label>
              <span>Status (Admin Action)</span>
              <select value={data.status} onChange={(e) => setData('status', e.target.value)}>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Completed">Completed</option>
              </select>
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Admin Remark (If rejected/approved)</span>
              <textarea rows="2" value={data.admin_remark} onChange={(e) => setData('admin_remark', e.target.value)} placeholder="Reasons or comments..." />
            </label>

          </div>

          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : (isEdit ? 'Update' : 'Save')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
