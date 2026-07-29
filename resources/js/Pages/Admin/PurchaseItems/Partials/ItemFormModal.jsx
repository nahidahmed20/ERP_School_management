import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function ItemFormModal({ item, campuses, sizes, colors, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const generateSKU = () => {
    return `PRD-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  };

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    item_code: item?.item_code || generateSKU(),
    name: item?.name ?? '',
    category: item?.category ?? 'Stationery',
    size: item?.size ?? [], // Array
    color: item?.color ?? [], // Array
    unit: item?.unit ?? 'pcs',
    quantity: item?.quantity ?? 0,
    purchase_price: item?.purchase_price ?? '',
    selling_price: item?.selling_price ?? '',
    description: item?.description ?? '',
    is_active: item?.is_active ?? true,
  });

  const toggleArrayItem = (field, value) => {
    const currentArray = data[field] || [];
    if (currentArray.includes(value)) {
        setData(field, currentArray.filter(i => i !== value));
    } else {
        setData(field, [...currentArray, value]);
    }
  };

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
              <span>Item Name *</span>
              <input value={data.name} onChange={(e) => setData('name', e.target.value)} required placeholder="e.g. School T-Shirt" />
              {errors.name && <em>{errors.name}</em>}
            </label>

            <label>
              <span>Item Code / SKU *</span>
              <input value={data.item_code} onChange={(e) => setData('item_code', e.target.value)} required />
              {errors.item_code && <em>{errors.item_code}</em>}
            </label>

            <label>
              <span>Category *</span>
              <select value={data.category} onChange={(e) => setData('category', e.target.value)} required>
                <option value="Uniforms">Uniforms</option>
                <option value="Books">Books</option>
                <option value="Stationery">Stationery</option>
                <option value="Others">Others</option>
              </select>
            </label>

            {/* Multiple Sizes Selection */}
            <div style={{ gridColumn: '1 / -1', padding: '10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>Select Available Sizes</span>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                {sizes?.map(s => (
                  <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', margin: 0 }}>
                    <input
                       type="checkbox"
                       checked={data.size.includes(s.name)}
                       onChange={() => toggleArrayItem('size', s.name)}
                    />
                    {s.name}
                  </label>
                ))}
                {sizes?.length === 0 && <span style={{ color: '#64748b', fontSize: '12px' }}>No sizes created yet.</span>}
              </div>
            </div>

            {/* Multiple Colors Selection */}
            <div style={{ gridColumn: '1 / -1', padding: '10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>Select Available Colors</span>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                {colors?.map(c => (
                  <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', margin: 0 }}>
                    <input
                       type="checkbox"
                       checked={data.color.includes(c.name)}
                       onChange={() => toggleArrayItem('color', c.name)}
                    />
                    {c.name}
                  </label>
                ))}
                {colors?.length === 0 && <span style={{ color: '#64748b', fontSize: '12px' }}>No colors created yet.</span>}
              </div>
            </div>

            <label>
              <span>Unit Type *</span>
              <select value={data.unit} onChange={(e) => setData('unit', e.target.value)} required>
                <option value="pcs">Pieces (pcs)</option>
                <option value="set">Set</option>
                <option value="box">Box</option>
              </select>
            </label>

            <label>
              <span>Initial/Current Stock *</span>
              <input type="number" value={data.quantity} onChange={(e) => setData('quantity', e.target.value)} min="0" required />
            </label>

            <label>
              <span>Purchase Price (Buying Cost)</span>
              <input type="number" step="0.01" value={data.purchase_price} onChange={(e) => setData('purchase_price', e.target.value)} min="0" />
            </label>

            <label>
              <span>Selling Price (POS Sale Price) *</span>
              <input type="number" step="0.01" value={data.selling_price} onChange={(e) => setData('selling_price', e.target.value)} min="0" required />
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Assign to Campus *</span>
              <select value={data.campus_id || ''} onChange={(e) => setData('campus_id', e.target.value)} disabled={!isSuperAdmin} required>
                <option value="" disabled>Select Campus</option>
                {campuses?.map(campus => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
              </select>
            </label>

          </div>

          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : 'Save Item'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
