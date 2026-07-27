import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function ItemFormModal({ item, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    name: item?.name ?? '',
    category: item?.category ?? 'Stationery',
    unit: item?.unit ?? 'pcs',
    quantity: item?.quantity ?? 0,
    description: item?.description ?? '',
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.purchase.items.update', item.id), options);
    else post(route('admin.purchase.items.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Item' : 'Add New Item'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Assign to Campus *</span>
              <select value={data.campus_id || ''} onChange={(e) => setData('campus_id', e.target.value)} disabled={!isSuperAdmin} required>
                <option value="" disabled>Select Campus</option>
                {campuses?.map(campus => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
              </select>
              {errors.campus_id && <em>{errors.campus_id}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Item Name *</span>
              <input value={data.name} onChange={(e) => setData('name', e.target.value)} autoFocus required placeholder="e.g. A4 Paper Rim, Whiteboard Marker" />
              {errors.name && <em>{errors.name}</em>}
            </label>

            <label>
              <span>Category *</span>
              <select value={data.category} onChange={(e) => setData('category', e.target.value)} required>
                <option value="Stationery">Stationery</option>
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Cleaning Supplies">Cleaning Supplies</option>
                <option value="Sports">Sports</option>
                <option value="Others">Others</option>
              </select>
              {errors.category && <em>{errors.category}</em>}
            </label>

            <label>
              <span>Unit Type *</span>
              <select value={data.unit} onChange={(e) => setData('unit', e.target.value)} required>
                <option value="pcs">Pieces (pcs)</option>
                <option value="box">Box</option>
                <option value="dozen">Dozen</option>
                <option value="kg">Kg</option>
                <option value="liters">Liters</option>
                <option value="rim">Rim (Paper)</option>
                <option value="set">Set</option>
              </select>
              {errors.unit && <em>{errors.unit}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Initial/Current Stock</span>
              <input type="number" value={data.quantity} onChange={(e) => setData('quantity', e.target.value)} min="0" required />
              {errors.quantity && <em>{errors.quantity}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Description (Optional)</span>
              <textarea rows="2" value={data.description} onChange={(e) => setData('description', e.target.value)} />
            </label>

            <label className="mm-checkbox" style={{ gridColumn: '1 / -1' }}>
              <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} /> Active Item
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
