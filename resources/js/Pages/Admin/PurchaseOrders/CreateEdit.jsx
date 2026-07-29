import { useState, useEffect, useRef } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

export default function CreateEdit({ order, vendors, purchase_requests, inventory_items, campuses }) {
  const isEdit = !!order;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  // Edit Mode এ আগের আইটেমগুলো লোড করা
  const initialCart = (order?.items || []).map(oi => ({
      purchase_item_id: oi.purchase_item_id,
      product: inventory_items.find(i => i.id == oi.purchase_item_id) || {},
      size: oi.size || '',
      color: oi.color || '',
      quantity: oi.quantity,
      unit_price: oi.unit_price
  }));

  const [cart, setCart] = useState(initialCart);

  // Search Box States
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const { data, setData, post, put, processing, errors } = useForm({
    campus_id: order?.campus_id ?? auth?.active_campus_id,
    vendor_id: order?.vendor_id ?? '',
    purchase_request_id: order?.purchase_request_id ?? '',
    order_number: order?.order_number ?? `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
    order_date: order?.order_date ?? new Date().toISOString().split('T')[0],
    delivery_date: order?.delivery_date ?? '',
    total_amount: order?.total_amount ? Number(order.total_amount) : 0,
    status: order?.status ?? 'Pending',
    shipping_address: order?.shipping_address ?? 'Campus Main Store',
    notes: order?.notes ?? '',
    cart: [],
  });

  useEffect(() => {
    const total = cart.reduce((sum, current) => sum + (Number(current.quantity) * Number(current.unit_price)), 0);

    const payloadCart = cart.map(c => ({
        purchase_item_id: c.purchase_item_id,
        size: c.size,
        color: c.color,
        quantity: c.quantity,
        unit_price: c.unit_price
    }));
    setData(prev => ({ ...prev, cart: payloadCart, total_amount: total }));
  }, [cart]);

  useEffect(() => {
    const handleClickOutside = (event) => {
        if (searchRef.current && !searchRef.current.contains(event.target)) {
            setShowResults(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Search & Filter Logic ---
  const filteredItems = inventory_items.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.item_code && i.item_code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // --- Add to Cart Logic ---
  const addToCart = (product) => {
    const hasVariants = (product.size && product.size.length > 0) || (product.color && product.color.length > 0);

    if (!hasVariants) {
        const exists = cart.find(c => c.purchase_item_id === product.id);
        if (exists) {
            Swal.fire({ icon: 'warning', title: 'Already Added!', text: 'এই প্রোডাক্টটি কার্টে আগেই যুক্ত করা আছে। আপনি চাইলে পরিমাণ (Qty) বাড়াতে পারেন।' });
            setSearchTerm('');
            setShowResults(false);
            return;
        }
    }

    const newItem = {
        purchase_item_id: product.id,
        product: product,
        size: '',
        color: '',
        quantity: 1,
        unit_price: product.purchase_price || 0,
    };

    setCart([newItem, ...cart]);
    setSearchTerm('');
    setShowResults(false);
  };

  const handleCartChange = (index, field, value) => {
    const newCart = [...cart];
    const currentItem = newCart[index];
    const newValueObj = { ...currentItem, [field]: value };

    if (field === 'size' || field === 'color') {
        const duplicateIndex = newCart.findIndex((c, i) =>
            i !== index &&
            c.purchase_item_id === newValueObj.purchase_item_id &&
            c.size === newValueObj.size &&
            c.color === newValueObj.color &&
            (newValueObj.size !== '' || newValueObj.color !== '')
        );

        if (duplicateIndex !== -1) {
            Swal.fire({ icon: 'error', title: 'Duplicate Variant!', text: 'একই সাইজ এবং কালারের এই প্রোডাক্টটি কার্টে আগেই আছে!' });
            return;
        }
    }

    newCart[index][field] = value;
    setCart(newCart);
  };

  const removeCartItem = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  // --- Submit Order ---
  function submit(e) {
    e.preventDefault();
    if(cart.length === 0) return Swal.fire('Error', 'কার্টে অন্তত একটি আইটেম যোগ করুন!', 'error');

    const invalidRow = cart.find(c => {
        if (c.product?.size?.length > 0 && !c.size) return true;
        if (c.product?.color?.length > 0 && !c.color) return true;
        return false;
    });

    if (invalidRow) {
        return Swal.fire('Missing Variants', 'দয়া করে কার্টে থাকা সকল প্রোডাক্টের Size এবং Color সিলেক্ট করুন।', 'error');
    }

    if (isEdit) put(route('admin.purchase.orders.update', order.id));
    else post(route('admin.purchase.orders.store'));
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <Link href={route('admin.purchase.orders.index')} className="back-link" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '13px', marginBottom: '5px', textDecoration: 'none' }}>
                <Icon name="arrow-left" style={{ fontSize: '12px' }}/> Back to Orders
            </Link>
            <h1>{isEdit ? 'Edit Purchase Order' : 'Create New Purchase Order'}</h1>
          </div>
        </div>
      }
    >
      <Head title={isEdit ? 'Edit PO' : 'Create PO'} />

      <form onSubmit={submit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>

            {/* Left Column: Cart & Search Section */}
            <div className="card mm-card" style={{ padding: '20px', overflow: 'visible' }}>

                {/* --- ADVANCED SEARCH BOX --- */}
                <div style={{ marginBottom: '25px', position: 'relative' }} ref={searchRef}>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 15px' }}>
                        <Icon name="search" style={{ color: '#64748b', marginRight: '10px' }} />
                        <input
                            type="text"
                            placeholder="Search product by name or SKU to add..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }}
                            onFocus={() => setShowResults(true)}
                            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '16px' }}
                        />
                    </div>

                    {showResults && searchTerm && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '5px', maxHeight: '300px', overflowY: 'auto', zIndex: 50, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                            {filteredItems.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => addToCart(item)}
                                    style={{ padding: '12px 15px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                >
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#0f172a' }}>
                                            {item.item_code && <span style={{ color: '#4f46e5', marginRight: '5px' }}>[{item.item_code}]</span>}
                                            {item.name}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                                            {item.size?.length > 0 && <span>Sizes: {item.size.join(', ')} | </span>}
                                            {item.color?.length > 0 && <span>Colors: {item.color.join(', ')} | </span>}
                                            Stock: {item.quantity}
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 'bold', color: '#059669' }}>৳{item.purchase_price}</div>
                                </div>
                            ))}
                            {filteredItems.length === 0 && (
                                <div style={{ padding: '15px', textAlign: 'center', color: '#b91c1c' }}>কোনো প্রোডাক্ট পাওয়া যায়নি!</div>
                            )}
                        </div>
                    )}
                </div>
                {/* ----------------------------- */}

                <table className="mm-table" style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <thead style={{ background: '#f8fafc' }}>
                        <tr>
                            <th style={{ width: '32%' }}>Product Detail</th>
                            <th style={{ width: '20%' }}>Variants</th>
                            <th style={{ width: '16%' }}>Qty</th>
                            <th style={{ width: '15%' }}>Unit Price</th>
                            <th style={{ width: '12%', textAlign: 'right' }}>Subtotal</th>
                            <th style={{ width: '5%' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {cart.map((c, index) => {
                            const p = c.product;
                            const hasSize = p?.size && p.size.length > 0;
                            const hasColor = p?.color && p.color.length > 0;

                            return (
                                <tr key={index}>
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#111827' }}>{p?.name}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{p?.item_code}</div>
                                    </td>
                                    <td>
                                        {hasSize && (
                                            <select value={c.size} onChange={(e) => handleCartChange(index, 'size', e.target.value)} style={{ width: '100%', padding: '4px', marginBottom: '4px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }} required>
                                                <option value="" disabled>Select Size</option>
                                                {p.size.map((s, i) => <option key={i} value={s}>{s}</option>)}
                                            </select>
                                        )}
                                        {hasColor && (
                                            <select value={c.color} onChange={(e) => handleCartChange(index, 'color', e.target.value)} style={{ width: '100%', padding: '4px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }} required>
                                                <option value="" disabled>Select Color</option>
                                                {p.color.map((color, i) => <option key={i} value={color}>{color}</option>)}
                                            </select>
                                        )}
                                        {(!hasSize && !hasColor) && <span style={{ fontSize:'12px', color:'#94a3b8'}}>No Variants</span>}
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            min="1"
                                            value={c.quantity}
                                            onChange={(e) => handleCartChange(index, 'quantity', e.target.value)}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '10px 8px',
                                                fontSize: '16px',
                                                fontWeight: 'bold',
                                                textAlign: 'center',
                                                border: '1px solid #94a3b8',
                                                borderRadius: '6px'
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <input type="number" step="0.01" min="0" value={c.unit_price} onChange={(e) => handleCartChange(index, 'unit_price', e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                                    </td>
                                    <td style={{ fontWeight: 'bold', textAlign: 'right', verticalAlign: 'middle', color: '#0f172a' }}>
                                        ৳ {(c.quantity * c.unit_price).toFixed(2)}
                                    </td>
                                    <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                        <button type="button" onClick={() => removeCartItem(index)} style={{ color: '#b91c1c', border: 'none', background: '#fee2e2', borderRadius: '4px', padding: '5px 8px', cursor: 'pointer' }}>
                                            <Icon name="trash" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {cart.length === 0 && (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                <Icon name="cart" style={{ fontSize: '30px', color: '#cbd5e1', marginBottom: '10px', display: 'block', margin: '0 auto' }} />
                                উপরের সার্চ বক্স থেকে প্রোডাক্ট খুঁজুন
                            </td></tr>
                        )}
                    </tbody>
                </table>

                <div style={{ textAlign: 'right', marginTop: '20px', fontSize: '20px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    Grand Total: <strong style={{ color: '#16a34a' }}>৳ {Number(data.total_amount || 0).toFixed(2)}</strong>
                </div>
            </div>

            {/* Right Column: Order Details */}
            <div className="card mm-card" style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Order Information</h3>

                <div className="mm-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                    <label>
                        <span>Campus *</span>
                        <select value={data.campus_id || ''} onChange={(e) => setData('campus_id', e.target.value)} disabled={!isSuperAdmin} required>
                            {campuses?.map(campus => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
                        </select>
                        {errors.campus_id && <em style={{color:'red'}}>{errors.campus_id}</em>}
                    </label>

                    <label>
                        <span>PO Number *</span>
                        <input value={data.order_number} onChange={(e) => setData('order_number', e.target.value)} required />
                        {errors.order_number && <em style={{color:'red'}}>{errors.order_number}</em>}
                    </label>

                    <label>
                        <span>Select Vendor *</span>
                        <select value={data.vendor_id} onChange={(e) => setData('vendor_id', e.target.value)} required>
                            <option value="" disabled>-- Choose Vendor --</option>
                            {vendors?.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                        {errors.vendor_id && <em style={{color:'red'}}>{errors.vendor_id}</em>}
                    </label>

                    <label>
                        <span>Order Date *</span>
                        <input type="date" value={data.order_date} onChange={(e) => setData('order_date', e.target.value)} required />
                    </label>

                    <label>
                        <span>Shipping Address</span>
                        <textarea rows="2" value={data.shipping_address} onChange={(e) => setData('shipping_address', e.target.value)} />
                    </label>

                    <label>
                        <span>Terms & Notes</span>
                        <textarea rows="2" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                    </label>
                </div>

                <div style={{ marginTop: '20px' }}>
                    <button type="submit" className="btn" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '16px' }} disabled={processing}>
                        <Icon name="check" /> {processing ? 'Processing...' : (isEdit ? 'Update Order' : 'Place Order')}
                    </button>
                </div>
            </div>

        </div>
      </form>
    </AuthenticatedLayout>
  );
}
