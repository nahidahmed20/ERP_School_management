import { useState, useEffect, useRef } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

export default function CreateEdit({ order, vendors, purchase_requests, inventory_items, campuses }) {
  const isEdit = !!order;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

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
            Swal.fire({ icon: 'warning', title: 'Already Added!', text: 'এই প্রোডাক্টটি কার্টে আগেই যুক্ত করা আছে। আপনি চাইলে পরিমাণ (Qty) বাড়াতে পারেন।' });
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

  // Deterministic barcode from the PO number — same device used on the invoice,
  // so the two documents read as part of one system.
  const code = String(data.order_number || 'PO');
  const barcodeWidths = Array.from(code).map(ch => (ch.charCodeAt(0) % 4) + 1);
  const Barcode = () => (
    <span className="po-barcode" aria-hidden="true">
      {barcodeWidths.map((w, i) => <span key={i} style={{ width: `${w}px` }} />)}
    </span>
  );

  const statusTone = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('cancel') || s.includes('reject')) return 'status-red';
    if (s.includes('approve') || s.includes('complete') || s.includes('receiv')) return 'status-green';
    return 'status-amber';
  };

  // --- Custom CSS Inject ---
  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');

    .po-app {
      --paper: #F2F4EE;
      --paper-soft: #FBFBF8;
      --ink: #1E2A22;
      --ink-soft: #445044;
      --muted: #77806F;
      --accent: #E2984A;
      --accent-dark: #B96F1F;
      --stamp-red: #BE4438;
      --stamp-green: #2C6E4E;
      --line: #DBD9CB;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: var(--ink);
    }
    .po-app *:focus-visible { outline: 2px solid var(--accent-dark); outline-offset: 2px; }
    .po-app input[type="number"]::-webkit-outer-spin-button,
    .po-app input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

    .po-eyebrow {
      display: inline-flex; align-items: center; gap: 9px;
      font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700;
      letter-spacing: 0.16em; text-transform: uppercase; color: var(--muted);
    }
    .po-back {
      display: inline-flex; align-items: center; gap: 6px;
      color: var(--muted); font-size: 13px; font-weight: 600; text-decoration: none;
      margin-bottom: 10px; transition: color 0.15s ease;
    }
    .po-back:hover { color: var(--ink); }
    .po-title { font-family: 'Space Grotesk', sans-serif; font-size: 25px; font-weight: 700; color: var(--ink); margin: 6px 0 0; letter-spacing: -0.01em; }

    .po-barcode { display: inline-flex; align-items: flex-end; gap: 2px; height: 13px; }
    .po-barcode span { display: block; height: 100%; background: var(--ink); }

    .po-layout { display: grid; grid-template-columns: 1fr 380px; gap: 22px; align-items: start; }
    @media (max-width: 1024px) { .po-layout { grid-template-columns: 1fr; } }

    .po-card {
      background: var(--paper-soft);
      border-radius: 6px;
      border: 1px solid var(--line);
      box-shadow: 0 1px 2px rgba(30, 42, 34, 0.05);
      padding: 26px;
    }

    .po-search-wrapper {
      display: flex; align-items: center; gap: 12px;
      background: var(--ink); border-radius: 8px; padding: 14px 18px;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06);
    }
    .po-search-wrapper input {
      border: none; background: transparent; outline: none; width: 100%;
      font-family: 'JetBrains Mono', monospace; font-size: 15px; color: var(--paper-soft);
    }
    .po-search-wrapper input::placeholder { color: rgba(242,244,238,0.42); }
    .po-search-wrapper .search-ic { color: var(--accent); font-size: 19px; flex-shrink: 0; }

    .po-dropdown {
      position: absolute; top: 100%; left: 0; right: 0; margin-top: 8px;
      background: var(--paper-soft); border: 1px solid var(--line); border-radius: 8px;
      max-height: 350px; overflow-y: auto; z-index: 50;
      box-shadow: 0 12px 24px -8px rgba(30,42,34,0.18);
    }
    .po-row {
      padding: 13px 18px; border-bottom: 1px dashed var(--line); cursor: pointer;
      display: flex; justify-content: space-between; align-items: center; gap: 12px;
      transition: background 0.15s ease;
    }
    .po-row:last-child { border-bottom: none; }
    .po-row:hover { background: #ECEFE7; }
    .po-row-name { font-weight: 600; color: var(--ink); font-size: 14.5px; }
    .po-row-code { color: var(--accent-dark); font-family: 'JetBrains Mono', monospace; font-size: 12px; margin-right: 6px; }
    .po-row-meta { font-size: 12.5px; color: var(--muted); margin-top: 4px; }
    .po-row-meta .in { color: var(--stamp-green); font-weight: 700; }
    .po-row-meta .out { color: var(--stamp-red); font-weight: 700; }
    .po-row-price { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--accent-dark); font-size: 15.5px; white-space: nowrap; }
    .po-empty-search { padding: 22px; text-align: center; color: var(--stamp-red); font-weight: 600; font-size: 14px; }

    .po-table { width: 100%; border-collapse: collapse; margin-top: 22px; }
    .po-table th {
      text-align: left; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700;
      letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted);
      padding: 0 12px 10px; border-bottom: 1px solid var(--line);
    }
    .po-table td { padding: 15px 12px; border-bottom: 1px dashed var(--line); vertical-align: middle; }
    .po-table tr:last-child td { border-bottom: none; }
    .po-item-name { font-weight: 600; color: var(--ink); font-size: 14px; margin-bottom: 4px; }
    .po-item-code { font-size: 11.5px; color: var(--ink-soft); background: #E7E9DF; display: inline-block; padding: 2px 8px; border-radius: 3px; font-family: 'JetBrains Mono', monospace; }
    .po-variant-select { width: 100%; padding: 6px 8px; margin-bottom: 6px; font-size: 12px; border: 1px solid var(--line); border-radius: 5px; background: var(--paper-soft); color: var(--ink); }
    .po-variant-select:last-child { margin-bottom: 0; }
    .po-no-variant { font-size: 12px; color: #A2A899; font-style: italic; }

    .po-num-field {
      width: 100%; padding: 9px 10px; border: 1px solid var(--line); border-radius: 5px;
      background: var(--paper-soft); font-family: 'JetBrains Mono', monospace;
      font-variant-numeric: tabular-nums; color: var(--ink); font-weight: 600;
    }
    .po-num-field:focus { border-color: var(--accent-dark); }
    .po-qty-field { text-align: center; font-size: 15px; }
    .po-line-total { font-family: 'JetBrains Mono', monospace; font-weight: 700; text-align: right; color: var(--ink); font-size: 14.5px; }

    .po-remove-btn {
      color: var(--stamp-red); background: transparent; border: 1px solid transparent; border-radius: 5px;
      padding: 7px 9px; cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.15s ease;
    }
    .po-remove-btn:hover { background: rgba(190,68,56,0.08); border-color: rgba(190,68,56,0.25); }

    .po-empty-cart { text-align: center; padding: 56px 20px; border: 1px dashed var(--line); border-radius: 8px; background: #EFF1E9; }
    .po-empty-cart h4 { font-family: 'Space Grotesk', sans-serif; color: var(--ink-soft); margin: 14px 0 6px; font-size: 15px; }
    .po-empty-cart p { color: var(--muted); font-size: 13px; margin: 0; }

    .po-total-bar { display: flex; justify-content: flex-end; margin-top: 22px; }
    .po-total-chip {
      background: var(--ink); border-radius: 6px; padding: 15px 22px; min-width: 300px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .po-total-chip span:first-child { font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #9AA592; }
    .po-total-chip span:last-child { font-family: 'JetBrains Mono', monospace; font-size: 22px; font-weight: 700; color: var(--accent); }

    /* --- Order Details panel --- */
    .po-panel-head { display: flex; align-items: center; gap: 10px; margin-bottom: 22px; border-bottom: 1px dashed var(--line); padding-bottom: 14px; }
    .po-panel-head h3 { margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 700; color: var(--ink); }

    .po-form-group { margin-bottom: 18px; }
    .po-label { display: flex; align-items: center; justify-content: space-between; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); margin-bottom: 7px; }
    .po-field {
      width: 100%; padding: 10px 13px; font-size: 14px; border: 1px solid var(--line); border-radius: 6px;
      background: var(--paper-soft); color: var(--ink); font-family: 'Inter', sans-serif; transition: all 0.15s ease;
    }
    .po-field:focus { outline: none; border-color: var(--accent-dark); box-shadow: 0 0 0 3px rgba(185,111,31,0.12); }
    .po-error { color: var(--stamp-red); font-size: 12px; margin-top: 4px; display: block; }

    .status-badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 999px; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; border: 1px solid; }
    .status-badge.status-amber { color: var(--accent-dark); border-color: var(--accent-dark); background: rgba(185,111,31,0.08); }
    .status-badge.status-green { color: var(--stamp-green); border-color: var(--stamp-green); background: rgba(44,110,78,0.08); }
    .status-badge.status-red { color: var(--stamp-red); border-color: var(--stamp-red); background: rgba(190,68,56,0.08); }

    .po-submit-btn {
      display: flex; align-items: center; justify-content: center; gap: 9px; width: 100%;
      background: var(--ink); color: var(--accent); border: none; padding: 15px;
      font-family: 'Space Grotesk', sans-serif; font-size: 14.5px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.03em; border-radius: 6px; cursor: pointer;
      transition: all 0.2s ease;
    }
    .po-submit-btn:hover:not(:disabled) { background: #14201A; transform: translateY(-1px); }
    .po-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  `;

  return (
    <AuthenticatedLayout
      header={
        <div className="po-app">
          <style>{customStyles}</style>
          <div>
            <Link href={route('admin.purchase.orders.index')} className="po-back">
                <Icon name="arrow-left" style={{ fontSize: '13px' }}/> Back to Orders
            </Link>
            <div className="po-eyebrow"><Barcode /> Purchase Order</div>
            <h1 className="po-title">{isEdit ? 'Edit Purchase Order' : 'Create New Purchase Order'}</h1>
          </div>
        </div>
      }
    >
      <Head title={isEdit ? 'Edit PO' : 'Create PO'} />

      <div className="po-app">
        <style>{customStyles}</style>
        <form onSubmit={submit}>
          <div className="po-layout">

              {/* Left Column: Order Items */}
              <div className="po-card" style={{ overflow: 'visible' }}>

                  <div className="po-eyebrow" style={{ marginBottom: '12px' }}>Order Items</div>

                  {/* --- SEARCH BOX --- */}
                  <div style={{ position: 'relative' }} ref={searchRef}>
                      <div className="po-search-wrapper">
                          <Icon name="search"  />
                          <input
                              type="text"
                              placeholder="Search product by name or SKU to add..."
                              value={searchTerm}
                              onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }}
                              onFocus={() => setShowResults(true)}
                          />
                      </div>

                      {showResults && searchTerm && (
                          <div className="po-dropdown">
                              {filteredItems.map(item => (
                                  <div key={item.id} onClick={() => addToCart(item)} className="po-row">
                                      <div>
                                          <div className="po-row-name">
                                              {item.item_code && <span className="po-row-code">[{item.item_code}]</span>}
                                              {item.name}
                                          </div>
                                          <div className="po-row-meta">
                                              {item.size?.length > 0 && <span>Sizes: {item.size.join(', ')} &nbsp;·&nbsp; </span>}
                                              {item.color?.length > 0 && <span>Colors: {item.color.join(', ')} &nbsp;·&nbsp; </span>}
                                              <span className={item.quantity > 0 ? 'in' : 'out'}>Stock: {item.quantity}</span>
                                          </div>
                                      </div>
                                      <div className="po-row-price">৳ {item.purchase_price}</div>
                                  </div>
                              ))}
                              {filteredItems.length === 0 && (
                                  <div className="po-empty-search">কোনো প্রোডাক্ট পাওয়া যায়নি!</div>
                              )}
                          </div>
                      )}
                  </div>
                  {/* ----------------------------- */}

                  <table className="po-table">
                      <thead>
                          <tr>
                              <th style={{ width: '32%' }}>Product Detail</th>
                              <th style={{ width: '22%' }}>Variants</th>
                              <th style={{ width: '15%' }}>Qty</th>
                              <th style={{ width: '15%' }}>Unit Price</th>
                              <th style={{ width: '12%', textAlign: 'right' }}>Subtotal</th>
                              <th style={{ width: '4%', textAlign: 'center' }}></th>
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
                                          <div className="po-item-name">{p?.name}</div>
                                          <div className="po-item-code">{p?.item_code}</div>
                                      </td>
                                      <td>
                                          {hasSize && (
                                              <select className="po-variant-select" value={c.size} onChange={(e) => handleCartChange(index, 'size', e.target.value)} required>
                                                  <option value="" disabled>Select Size</option>
                                                  {p.size.map((s, i) => <option key={i} value={s}>{s}</option>)}
                                              </select>
                                          )}
                                          {hasColor && (
                                              <select className="po-variant-select" value={c.color} onChange={(e) => handleCartChange(index, 'color', e.target.value)} required>
                                                  <option value="" disabled>Select Color</option>
                                                  {p.color.map((color, i) => <option key={i} value={color}>{color}</option>)}
                                              </select>
                                          )}
                                          {(!hasSize && !hasColor) && <span className="po-no-variant">No Variants</span>}
                                      </td>
                                      <td>
                                          <input
                                              type="number"
                                              min="1"
                                              value={c.quantity}
                                              onChange={(e) => handleCartChange(index, 'quantity', e.target.value)}
                                              required
                                              className="po-num-field po-qty-field"
                                          />
                                      </td>
                                      <td>
                                          <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={c.unit_price}
                                            onChange={(e) => handleCartChange(index, 'unit_price', e.target.value)}
                                            required
                                            className="po-num-field"
                                          />
                                      </td>
                                      <td className="po-line-total">৳ {(c.quantity * c.unit_price).toFixed(2)}</td>
                                      <td style={{ textAlign: 'center' }}>
                                          <button type="button" onClick={() => removeCartItem(index)} className="po-remove-btn" title="Remove Item">
                                              <Icon name="trash" style={{ fontSize: '15px' }}/>
                                          </button>
                                      </td>
                                  </tr>
                              );
                          })}
                          {cart.length === 0 && (
                              <tr>
                                  <td colSpan="6" style={{ padding: '20px 0', border: 'none' }}>
                                      <div className="po-empty-cart">
                                          <Icon name="box" style={{ fontSize: '30px', color: '#A2A899' }} />
                                          <h4>No items added yet</h4>
                                          <p>উপরের সার্চ বক্স থেকে প্রোডাক্ট খুঁজুন এবং কার্টে যোগ করুন</p>
                                      </div>
                                  </td>
                              </tr>
                          )}
                      </tbody>
                  </table>

                  <div className="po-total-bar">
                      <div className="po-total-chip">
                          <span>Grand Total</span>
                          <span>৳ {Number(data.total_amount || 0).toFixed(2)}</span>
                      </div>
                  </div>
              </div>

              {/* Right Column: Order Details */}
              <div className="po-card">
                  <div className="po-panel-head">
                      <Icon name="file" style={{ fontSize: '19px', color: 'var(--accent-dark)' }} />
                      <h3>Order Details</h3>
                  </div>

                  <div className="po-form-group">
                      <label className="po-label">Campus *</label>
                      <select className="po-field" value={data.campus_id || ''} onChange={(e) => setData('campus_id', e.target.value)} disabled={!isSuperAdmin} required>
                          {campuses?.map(campus => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
                      </select>
                      {errors.campus_id && <span className="po-error">{errors.campus_id}</span>}
                  </div>

                  <div className="po-form-group">
                      <label className="po-label">
                          <span>PO Number *</span>
                          {isEdit && order?.status && <span className={`status-badge ${statusTone(order.status)}`}>{order.status}</span>}
                      </label>
                      <input className="po-field" value={data.order_number} onChange={(e) => setData('order_number', e.target.value)} required />
                      <div style={{ marginTop: '8px' }}><Barcode /></div>
                      {errors.order_number && <span className="po-error">{errors.order_number}</span>}
                  </div>

                  <div className="po-form-group">
                      <label className="po-label">Select Vendor *</label>
                      <select className="po-field" value={data.vendor_id} onChange={(e) => setData('vendor_id', e.target.value)} required>
                          <option value="" disabled>-- Choose Vendor --</option>
                          {vendors?.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                      {errors.vendor_id && <span className="po-error">{errors.vendor_id}</span>}
                  </div>

                  <div className="po-form-group">
                      <label className="po-label">Order Date *</label>
                      <input type="date" className="po-field" value={data.order_date} onChange={(e) => setData('order_date', e.target.value)} required />
                  </div>

                  <div className="po-form-group">
                      <label className="po-label">Shipping Address</label>
                      <textarea className="po-field" rows="2" style={{ resize: 'vertical' }} value={data.shipping_address} onChange={(e) => setData('shipping_address', e.target.value)} />
                  </div>

                  <div className="po-form-group">
                      <label className="po-label">Terms & Notes</label>
                      <textarea className="po-field" rows="2" style={{ resize: 'vertical' }} placeholder="Add any special instructions..." value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                  </div>

                  <div style={{ marginTop: '28px' }}>
                      <button type="submit" className="po-submit-btn" disabled={processing}>
                          <Icon name={isEdit ? "edit" : "check-circle"} style={{ fontSize: '18px' }} />
                          {processing ? 'Processing...' : (isEdit ? 'Update Purchase Order' : 'Place Purchase Order')}
                      </button>
                  </div>
              </div>

          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}