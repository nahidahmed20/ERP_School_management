import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function AssetFormModal({ item, users, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  // ইউনিক ট্যাগ জেনারেট করা (ডিফল্ট)
  const defaultTag = `AST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    asset_tag: item?.asset_tag ?? defaultTag,
    name: item?.name ?? '',
    category: item?.category ?? 'Electronics',
    assigned_to: item?.assigned_to ?? '',
    location: item?.location ?? '',
    purchase_date: item?.purchase_date ?? '',
    cost: item?.cost ?? '',
    status: item?.status ?? 'Available',
    note: item?.note ?? '',
  });

  // যদি কাউকে অ্যাসাইন করা হয়, তাহলে অটোমেটিক স্ট্যাটাস 'Assigned' হয়ে যাবে
  const handleAssigneeChange = (e) => {
    const userId = e.target.value;
    setData(data => ({
      ...data,
      assigned_to: userId,
      status: userId ? 'Assigned' : 'Available'
    }));
  };

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.purchase.assets.update', item.id), options);
    else post(route('admin.purchase.assets.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Asset Record' : 'Register New Asset'}</h3>
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

            <label>
              <span>Asset Tag / Barcode *</span>
              <input value={data.asset_tag} onChange={(e) => setData('asset_tag', e.target.value)} required placeholder="e.g. AST-2026-0001" />
              {errors.asset_tag && <em>{errors.asset_tag}</em>}
            </label>

            <label>
                <span>Asset Name *</span>
                <input
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    autoFocus
                    required
                    placeholder='e.g. Dell Monitor 24"'
                />
                {errors.name && <em>{errors.name}</em>}
            </label>

            <label>
              <span>Category</span>
              <select value={data.category} onChange={(e) => setData('category', e.target.value)}>
                <option value="Electronics">Electronics / IT</option>
                <option value="Furniture">Furniture</option>
                <option value="Vehicles">Vehicles</option>
                <option value="Others">Others</option>
              </select>
            </label>

            <label>
              <span>Current Status *</span>
              <select value={data.status} onChange={(e) => setData('status', e.target.value)} required>
                <option value="Available">Available (In Store)</option>
                <option value="Assigned">Assigned (In Use)</option>
                <option value="Maintenance">Maintenance / Repair</option>
                <option value="Damaged">Damaged</option>
                <option value="Lost">Lost</option>
              </select>
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Assign To (Staff/User)</span>
              <select value={data.assigned_to} onChange={handleAssigneeChange}>
                <option value="">-- Keep Unassigned --</option>
                {users?.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </label>

            <label>
              <span>Location / Room</span>
              <input value={data.location} onChange={(e) => setData('location', e.target.value)} placeholder="e.g. Lab-01, Principal Room" />
            </label>

            <label>
              <span>Purchase Date</span>
              <input type="date" value={data.purchase_date || ''} onChange={(e) => setData('purchase_date', e.target.value)} />
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Cost (৳)</span>
              <input type="number" value={data.cost} onChange={(e) => setData('cost', e.target.value)} min="0" step="0.01" />
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Additional Notes</span>
              <textarea rows="2" value={data.note} onChange={(e) => setData('note', e.target.value)} placeholder="Condition, serial numbers, etc..." />
            </label>

          </div>

          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : (isEdit ? 'Update Asset' : 'Register Asset')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
