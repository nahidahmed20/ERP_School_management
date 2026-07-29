import { useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Icon from '@/Components/Icons';

const SearchableProductDropdown = ({ items, selectedId, onSelect }) => {
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);

    const selectedItem = items.find(i => i.id == selectedId);

    const displayValue = selectedItem
        ? `[${selectedItem.item_code}] ${selectedItem.name} ${selectedItem.size ? `(${selectedItem.size})` : ''} ${selectedItem.color ? `- ${selectedItem.color}` : ''}`
        : search;

    const filtered = items.filter(i =>
        (i.name && i.name.toLowerCase().includes(search.toLowerCase())) ||
        (i.item_code && i.item_code.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <input
                type="text"
                value={open ? search : (selectedItem ? displayValue : '')}
                onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
                onFocus={() => { setOpen(true); setSearch(''); }}
                onBlur={() => setTimeout(() => setOpen(false), 200)}
                placeholder="Search by SKU or Name..."
                style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
                required={!selectedId}
            />
            {open && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #cbd5e1', maxHeight: '200px', overflowY: 'auto', zIndex: 999, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {filtered.map(i => (
                        <div
                            key={i.id}
                            style={{ padding: '8px 10px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}
                            onClick={() => { onSelect(i.id); setOpen(false); }}
                            onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                            onMouseLeave={(e) => e.target.style.background = '#fff'}
                        >
                            <div style={{ fontWeight: '600', color: '#0f172a' }}>
                                <span style={{ color: '#4f46e5' }}>[{i.item_code}]</span> {i.name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                {i.size && `Size: ${i.size} | `} {i.color && `Color: ${i.color} | `} Cost: ৳{i.purchase_price}
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && <div style={{ padding: '8px', color: '#b91c1c' }}>No items found!</div>}
                </div>
            )}
        </div>
    );
}

export default function OrderFormModal({ item, vendors, purchase_requests, inventory_items, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const [cart, setCart] = useState(item?.items || []);

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    vendor_id: item?.vendor_id ?? '',
    purchase_request_id: item?.purchase_request_id ?? '',
    order_number: item?.order_number ?? `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
    order_date: item?.order_date ?? new Date().toISOString().split('T')[0],
    delivery_date: item?.delivery_date ?? '',
    total_amount: item?.total_amount ?? 0,
    status: item?.status ?? 'Pending',
    shipping_address: item?.shipping_address ?? 'Campus Main Store',
    notes: item?.notes ?? '',
    cart: [],
  });

  useEffect(() => {
    const total = cart.reduce((sum, current) => sum + (current.quantity * current.unit_price), 0);
    setData(prev => ({ ...prev, cart: cart, total_amount: total }));
  }, [cart]);

  const addCartItem = () => {
    setCart([...cart, { purchase_item_id: '', quantity: 1, unit_price: 0 }]);
  };

  const removeCartItem = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const handleCartChange = (index, field, value) => {
    const newCart = [...cart];
    newCart[index][field] = value;

    if (field === 'purchase_item_id') {
        const selectedItem = inventory_items.find(i => i.id == value);
        if (selectedItem) newCart[index].unit_price = selectedItem.purchase_price;
    }

    setCart(newCart);
  };

  function submit(e) {
    e.preventDefault();
    if(cart.length === 0) return alert('Please add at least one item to the order!');
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.purchase.orders.update', item.id), options);
    else post(route('admin.purchase.orders.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Purchase Order' : 'Create Purchase Order'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <form onSubmit={submit} className="mm-form" style={{ paddingBottom: '100px' }}>
          <div className="mm-form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>

            <label>
              <span>PO Number *</span>
              <input value={data.order_number} readOnly />
            </label>

            <label>
              <span>Select Vendor *</span>
              <select value={data.vendor_id} onChange={(e) => setData('vendor_id', e.target.value)} required>
                <option value="" disabled>Select Vendor...</option>
                {vendors?.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </label>

            <label>
              <span>Order Date *</span>
              <input type="date" value={data.order_date} onChange={(e) => setData('order_date', e.target.value)} required />
            </label>
          </div>

          <hr style={{ margin: '20px 0', borderColor: '#e2e8f0' }} />

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, color: '#0f172a' }}>Order Items</h4>
                <button type="button" className="btn btn-outline" onClick={addCartItem} style={{ padding: '4px 10px', fontSize: '12px' }}>
                    <Icon name="plus" /> Add Item
                </button>
            </div>

            <table className="mm-table" style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <thead style={{ background: '#f8fafc' }}>
                    <tr>
                        <th style={{ width: '45%' }}>Search Item (SKU or Name)</th>
                        <th>Qty</th>
                        <th>Unit Price (Cost)</th>
                        <th>Subtotal</th>
                        <th style={{ width: '50px' }}></th>
                    </tr>
                </thead>
                <tbody>
                    {cart.map((c, index) => (
                        <tr key={index}>
                            <td style={{ position: 'relative' }}>
                                <SearchableProductDropdown
                                    items={inventory_items}
                                    selectedId={c.purchase_item_id}
                                    onSelect={(val) => handleCartChange(index, 'purchase_item_id', val)}
                                />
                            </td>
                            <td>
                                <input type="number" min="1" value={c.quantity} onChange={(e) => handleCartChange(index, 'quantity', e.target.value)} required style={{ width: '80px', padding: '6px' }} />
                            </td>
                            <td>
                                <input type="number" step="0.01" min="0" value={c.unit_price} onChange={(e) => handleCartChange(index, 'unit_price', e.target.value)} required style={{ width: '100px', padding: '6px' }} />
                            </td>
                            <td style={{ fontWeight: 'bold' }}>
                                ৳ {(c.quantity * c.unit_price).toFixed(2)}
                            </td>
                            <td>
                                <button type="button" onClick={() => removeCartItem(index)} style={{ color: '#b91c1c', border: 'none', background: 'none', cursor: 'pointer' }}><Icon name="trash" /></button>
                            </td>
                        </tr>
                    ))}
                    {cart.length === 0 && (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No items added. Click "Add Item" to start.</td></tr>
                    )}
                </tbody>
            </table>

            <div style={{ textAlign: 'right', marginTop: '10px', fontSize: '18px' }}>
                Grand Total: <strong style={{ color: '#16a34a' }}>৳ {data.total_amount.toFixed(2)}</strong>
            </div>
          </div>

          <div className="mm-modal-foot mt-2" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', padding: '15px 20px', borderTop: '1px solid #e2e8f0', zIndex: 10 }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Processing...' : 'Save Order'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
