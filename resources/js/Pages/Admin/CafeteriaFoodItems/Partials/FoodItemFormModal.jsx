import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FoodItemFormModal({ item, outlets, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    cafeteria_outlet_id: item?.cafeteria_outlet_id ?? '',
    name: item?.name ?? '',
    category: item?.category ?? 'Snacks',
    price: item?.price ?? '',
    is_available: item?.is_available ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.cafeteria.menu-items.update', item.id), options);
    else post(route('admin.cafeteria.menu-items.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Food Item' : 'Add Food Item'}</h3>
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
              <span>Outlet / Canteen *</span>
              <select value={data.cafeteria_outlet_id} onChange={e => setData('cafeteria_outlet_id', e.target.value)} required>
                <option value="" disabled>Select Outlet</option>
                {outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
              {errors.cafeteria_outlet_id && <em>{errors.cafeteria_outlet_id}</em>}
            </label>
            
            <label style={{ gridColumn: '1 / -1' }}>
              <span>Food Name *</span>
              <input value={data.name} onChange={e => setData('name', e.target.value)} required />
              {errors.name && <em>{errors.name}</em>}
            </label>

            <label>
              <span>Category *</span>
              <select value={data.category} onChange={e => setData('category', e.target.value)} required>
                <option value="Snacks">Snacks</option>
                <option value="Lunch">Lunch</option>
                <option value="Drinks">Drinks</option>
                <option value="Dessert">Dessert</option>
              </select>
            </label>

            <label>
              <span>Price (৳) *</span>
              <input type="number" step="0.01" min="0" value={data.price} onChange={e => setData('price', e.target.value)} required />
              {errors.price && <em>{errors.price}</em>}
            </label>

            <label className="mm-checkbox" style={{ gridColumn: '1 / -1' }}>
              <input type="checkbox" checked={data.is_available} onChange={e => setData('is_available', e.target.checked)} /> Available in Stock
            </label>
          </div>
          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}