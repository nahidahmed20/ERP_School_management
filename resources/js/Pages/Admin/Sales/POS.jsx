import { useState, useEffect, useRef } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

export default function POS({ inventory_items, sale }) {
  const isEdit = !!sale;

  const initialCart = (sale?.items || []).map(oi => ({
      purchase_item_id: oi.purchase_item_id,
      product: inventory_items.find(i => i.id == oi.purchase_item_id) || {},
      size: oi.size || '',
      color: oi.color || '',
      quantity: oi.quantity,
      unit_price: oi.unit_price
  }));

  const [cart, setCart] = useState(initialCart);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const { data, setData, post, put, processing, errors } = useForm({
    customer_name: sale?.customer_name ?? 'Walk-in Customer',
    customer_phone: sale?.customer_phone ?? '',
    subtotal: sale?.subtotal ? Number(sale.subtotal) : 0,
    discount: sale?.discount ? Number(sale.discount) : 0,
    total_amount: sale?.total_amount ? Number(sale.total_amount) : 0,
    paid_amount: sale?.paid_amount ? Number(sale.paid_amount) : 0,
    payment_method: sale?.payment_method ?? 'Cash',
    cart: [],
  });

  // Calculation Logic (Cart, Subtotal, Total)
  useEffect(() => {
    const subtotal = cart.reduce((sum, current) => sum + (Number(current.quantity) * Number(current.unit_price)), 0);
    const discount = Number(data.discount) || 0;
    const total = subtotal - discount;

    const payloadCart = cart.map(c => ({
        purchase_item_id: c.purchase_item_id,
        size: c.size,
        color: c.color,
        quantity: c.quantity,
        unit_price: c.unit_price
    }));

    setData(prev => ({ ...prev, cart: payloadCart, subtotal: subtotal, total_amount: total }));
  }, [cart, data.discount]);

  // Click outside to close search
  useEffect(() => {
    const handleClickOutside = (event) => {
        if (searchRef.current && !searchRef.current.contains(event.target)) setShowResults(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredItems = inventory_items.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.item_code && i.item_code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addToCart = (product) => {
    const hasVariants = (product.size && product.size.length > 0) || (product.color && product.color.length > 0);

    // If no variants, check duplicate and handle Qty increment
    if (!hasVariants) {
        const existingIndex = cart.findIndex(c => c.purchase_item_id === product.id);
        if (existingIndex !== -1) {
            const currentQty = Number(cart[existingIndex].quantity);
            if (currentQty + 1 > product.quantity && !isEdit) {
                return Swal.fire({ icon: 'error', title: 'Out of Stock!', text: `স্টকে মাত্র ${product.quantity} টি আছে।` });
            }
            const newCart = [...cart];
            newCart[existingIndex].quantity = currentQty + 1;
            setCart(newCart);
            setSearchTerm('');
            setShowResults(false);
            return;
        }
    }

    if (product.quantity < 1 && !isEdit) {
        return Swal.fire({ icon: 'error', title: 'Stock Out', text: 'এই প্রোডাক্টটি স্টকে নেই!' });
    }

    setCart([{ purchase_item_id: product.id, product: product, size: '', color: '', quantity: 1, unit_price: product.selling_price || 0 }, ...cart]);
    setSearchTerm('');
    setShowResults(false);
  };

  const handleCartChange = (index, field, value) => {
    const newCart = [...cart];
    const currentItem = newCart[index];

    // Qty Checking
    if (field === 'quantity') {
        const maxQty = currentItem.product.quantity;
        if (Number(value) > maxQty && !isEdit) {
            Swal.fire({ icon: 'warning', title: 'Stock Limit Reached', text: `স্টকে সর্বোচ্চ ${maxQty} টি আছে।` });
            value = maxQty;
        }
    }

    // Duplicate Variant Check
    if (field === 'size' || field === 'color') {
        const tempObj = { ...currentItem, [field]: value };
        const duplicate = newCart.find((c, i) => i !== index && c.purchase_item_id === tempObj.purchase_item_id && c.size === tempObj.size && c.color === tempObj.color && (tempObj.size !== '' || tempObj.color !== ''));
        if (duplicate) return Swal.fire({ icon: 'error', title: 'Duplicate!', text: 'এই সাইজ এবং কালারটি আগেই যুক্ত করা আছে!' });
    }

    newCart[index][field] = value;
    setCart(newCart);
  };

  const removeCartItem = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  function submit(e) {
    e.preventDefault();
    if(cart.length === 0) return Swal.fire('Error', 'কার্টে কোনো আইটেম নেই!', 'error');

    const invalidRow = cart.find(c => (c.product?.size?.length > 0 && !c.size) || (c.product?.color?.length > 0 && !c.color));
    if (invalidRow) return Swal.fire('Warning', 'দয়া করে প্রোডাক্টের Size এবং Color সিলেক্ট করুন।', 'warning');

    if (isEdit) put(route('admin.sales.update', sale.id));
    else post(route('admin.sales.store'));
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head" style={{ paddingBottom: '10px' }}>
          <div>
            <Link href={route('admin.sales.index')} className="back-link" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '13px', textDecoration: 'none' }}>
                <Icon name="arrow-left" style={{ fontSize: '12px' }}/> Back to Sales History
            </Link>
            <h1>{isEdit ? 'Edit Sale / Invoice' : 'POS - Point of Sale'}</h1>
          </div>
        </div>
      }
    >
      <Head title={isEdit ? 'Edit POS' : 'POS'} />

      <form onSubmit={submit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px', alignItems: 'start' }}>

            {/* Left Column: Cart & Products */}
            <div className="card mm-card" style={{ padding: '20px', minHeight: '70vh', overflow: 'visible' }}>

                {/* Search Bar */}
                <div style={{ marginBottom: '20px', position: 'relative' }} ref={searchRef}>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '2px solid #16a34a', borderRadius: '8px', padding: '12px 15px' }}>
                        <Icon name="search" style={{ color: '#16a34a', marginRight: '10px', fontSize: '20px' }} />
                        <input
                            type="text"
                            placeholder="Scan barcode or type product name/SKU..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }}
                            onFocus={() => setShowResults(true)}
                            autoFocus
                            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '18px', fontWeight: '500' }}
                        />
                    </div>

                    {showResults && searchTerm && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '5px', maxHeight: '350px', overflowY: 'auto', zIndex: 999, boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
                            {filteredItems.map(item => (
                                <div key={item.id} onClick={() => addToCart(item)} style={{ padding: '15px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}>
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>{item.item_code && <span style={{ color: '#16a34a' }}>[{item.item_code}]</span>} {item.name}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                            {item.size?.length > 0 && <span>Sizes: {item.size.join(', ')} | </span>}
                                            {item.color?.length > 0 && <span>Colors: {item.color.join(', ')} | </span>}
                                            <span style={{ color: item.quantity > 0 ? '#047857' : '#b91c1c', fontWeight: 'bold' }}>Stock: {item.quantity}</span>
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '16px' }}>৳{item.selling_price}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cart Table */}
                <table className="mm-table" style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <thead style={{ background: '#f1f5f9' }}>
                        <tr>
                            <th style={{ width: '35%' }}>Product</th>
                            <th style={{ width: '22%' }}>Variant</th>
                            <th style={{ width: '15%', textAlign: 'center' }}>Qty</th>
                            <th style={{ width: '13%' }}>Price</th>
                            <th style={{ width: '10%', textAlign: 'right' }}>Total</th>
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
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>Stock: {p?.quantity} {p?.unit}</div>
                                    </td>
                                    <td>
                                        {hasSize && <select value={c.size} onChange={(e) => handleCartChange(index, 'size', e.target.value)} style={{ width: '100%', padding: '4px', marginBottom: '4px', fontSize: '12px', border: '1px solid #cbd5e1' }} required><option value="" disabled>Size</option>{p.size.map((s, i) => <option key={i} value={s}>{s}</option>)}</select>}
                                        {hasColor && <select value={c.color} onChange={(e) => handleCartChange(index, 'color', e.target.value)} style={{ width: '100%', padding: '4px', fontSize: '12px', border: '1px solid #cbd5e1' }} required><option value="" disabled>Color</option>{p.color.map((color, i) => <option key={i} value={color}>{color}</option>)}</select>}
                                        {(!hasSize && !hasColor) && <span style={{ fontSize:'12px', color:'#94a3b8'}}>-</span>}
                                    </td>
                                    <td>
                                        <input type="number" min="1" value={c.quantity} onChange={(e) => handleCartChange(index, 'quantity', e.target.value)} required style={{ width: '100%', padding: '8px', fontSize: '16px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #94a3b8', borderRadius: '4px' }} />
                                    </td>
                                    <td>
                                        <input type="number" step="0.01" min="0" value={c.unit_price} onChange={(e) => handleCartChange(index, 'unit_price', e.target.value)} required style={{ width: '100%', padding: '6px', fontSize: '14px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                                    </td>
                                    <td style={{ fontWeight: 'bold', textAlign: 'right', verticalAlign: 'middle', color: '#0f172a' }}>
                                        ৳ {(c.quantity * c.unit_price).toFixed(2)}
                                    </td>
                                    <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                                        <button type="button" onClick={() => removeCartItem(index)} style={{ color: '#b91c1c', border: 'none', background: '#fee2e2', borderRadius: '4px', padding: '5px 8px', cursor: 'pointer' }}><Icon name="trash" /></button>
                                    </td>
                                </tr>
                            );
                        })}
                        {cart.length === 0 && (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>সার্চ বক্স থেকে প্রোডাক্ট স্ক্যান বা সার্চ করুন</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Right Column: Billing & Customer */}
            <div className="card mm-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#334155' }}>Customer Info</h3>
                    <div style={{ marginBottom: '10px' }}>
                        <input type="text" placeholder="Customer Name (Walk-in)" value={data.customer_name} onChange={(e) => setData('customer_name', e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                    </div>
                    <div>
                        <input type="text" placeholder="Phone Number" value={data.customer_phone} onChange={(e) => setData('customer_phone', e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                    </div>
                </div>

                <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '15px', color: '#475569' }}>
                        <span>Subtotal</span>
                        <strong>৳ {Number(data.subtotal).toFixed(2)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <span style={{ fontSize: '15px', color: '#475569' }}>Discount</span>
                        <input type="number" step="0.01" min="0" value={data.discount} onChange={(e) => setData('discount', e.target.value)} style={{ width: '100px', padding: '6px', textAlign: 'right', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#b91c1c', fontWeight: 'bold' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', padding: '15px 0', borderTop: '2px dashed #cbd5e1', borderBottom: '2px dashed #cbd5e1', fontSize: '22px' }}>
                        <span style={{ color: '#0f172a', fontWeight: 'bold' }}>Total</span>
                        <strong style={{ color: '#16a34a' }}>৳ {Number(data.total_amount).toFixed(2)}</strong>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '5px' }}>Paid Amount</label>
                        <input type="number" step="0.01" min="0" value={data.paid_amount} onChange={(e) => setData('paid_amount', e.target.value)} onFocus={(e) => e.target.select()} style={{ width: '100%', padding: '12px', fontSize: '18px', fontWeight: 'bold', border: '1px solid #cbd5e1', borderRadius: '6px', textAlign: 'center' }} />
                    </div>

                    {/* Due Amount Highlight */}
                    {(data.total_amount - data.paid_amount) > 0 && (
                        <div style={{ textAlign: 'center', color: '#b91c1c', fontSize: '14px', fontWeight: 'bold', marginBottom: '15px', background: '#fee2e2', padding: '8px', borderRadius: '6px' }}>
                            Due: ৳ {Number(data.total_amount - data.paid_amount).toFixed(2)}
                        </div>
                    )}
                    {(data.total_amount - data.paid_amount) < 0 && (
                        <div style={{ textAlign: 'center', color: '#047857', fontSize: '14px', fontWeight: 'bold', marginBottom: '15px', background: '#dcfce7', padding: '8px', borderRadius: '6px' }}>
                            Change (ফেরত): ৳ {Math.abs(data.total_amount - data.paid_amount).toFixed(2)}
                        </div>
                    )}

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', color: '#64748b', marginBottom: '5px' }}>Payment Method</label>
                        <select value={data.payment_method} onChange={(e) => setData('payment_method', e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: '500' }}>
                            <option value="Cash">Cash (ক্যাশ)</option>
                            <option value="bKash">bKash (বিকাশ)</option>
                            <option value="Card">Card (কার্ড)</option>
                        </select>
                    </div>

                    <button type="submit" className="btn" style={{ width: '100%', justifyContent: 'center', padding: '15px', fontSize: '18px', background: '#16a34a', borderColor: '#16a34a' }} disabled={processing}>
                        <Icon name="check" /> {processing ? 'Processing...' : (isEdit ? 'Update Bill' : 'Confirm Sale')}
                    </button>
                </div>
            </div>

        </div>
      </form>
    </AuthenticatedLayout>
  );
}
