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

  // Decorative barcode mark — reused in the header, the register panel and the receipt slip
  const barcodeWidths = [2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2];
  const Barcode = ({ tone = 'dark' }) => (
    <span className={`barcode-mark ${tone === 'light' ? 'barcode-mark--light' : ''}`} aria-hidden="true">
      {barcodeWidths.map((w, i) => <span key={i} style={{ width: `${w}px` }} />)}
    </span>
  );

  const due = Number(data.total_amount) - Number(data.paid_amount);

  // --- Custom CSS Inject ---
  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');

    .pos-app {
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
    .pos-app *:focus-visible {
      outline: 2px solid var(--accent-dark);
      outline-offset: 2px;
    }
    .pos-app input[type="number"]::-webkit-outer-spin-button,
    .pos-app input[type="number"]::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    /* ---------- Header ---------- */
    .till-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 6px;
    }
    .till-back {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--muted);
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      margin-bottom: 10px;
      transition: color 0.15s ease;
    }
    .till-back:hover { color: var(--ink); }
    .till-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 26px;
      font-weight: 700;
      color: var(--ink);
      margin: 0;
      letter-spacing: -0.01em;
    }
    .barcode-mark { display: inline-flex; align-items: flex-end; gap: 2px; height: 14px; }
    .barcode-mark span { display: block; height: 100%; background: var(--ink); }
    .barcode-mark--light span { background: var(--paper-soft); }

    /* ---------- Layout ---------- */
    .register-layout {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 22px;
      align-items: start;
    }
    @media (max-width: 1024px) {
      .register-layout { grid-template-columns: 1fr; }
      .checkout-sticky { position: static !important; }
    }

    .register-panel {
      background: var(--paper-soft);
      border: 1px solid var(--line);
      border-radius: 6px;
      box-shadow: 0 1px 2px rgba(30, 42, 34, 0.05);
      padding: 26px;
      min-height: 75vh;
      display: flex;
      flex-direction: column;
    }

    /* ---------- Scanner search ---------- */
    .scan-wrap {
      position: relative;
      background: var(--ink);
      border-radius: 8px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 14px;
      overflow: hidden;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06);
    }
    .scan-wrap .scan-icon { color: var(--accent); font-size: 20px; flex-shrink: 0; }
    .scan-input {
      border: none;
      background: transparent;
      outline: none;
      width: 100%;
      font-family: 'JetBrains Mono', monospace;
      font-size: 16px;
      font-weight: 500;
      color: var(--paper-soft);
      letter-spacing: 0.01em;
    }
    .scan-input::placeholder { color: rgba(242,244,238,0.4); }
    .scan-line {
      position: absolute;
      top: 0; bottom: 0; left: -20%;
      width: 20%;
      background: linear-gradient(90deg, transparent, rgba(226,152,74,0.18), transparent);
      animation: scanmove 2.6s linear infinite;
    }
    @media (prefers-reduced-motion: reduce) { .scan-line { animation: none; display: none; } }
    @keyframes scanmove {
      0% { left: -20%; }
      100% { left: 100%; }
    }

    .search-dropdown {
      position: absolute;
      top: 100%; left: 0; right: 0;
      background: var(--paper-soft);
      border: 1px solid var(--line);
      border-radius: 8px;
      margin-top: 8px;
      max-height: 360px;
      overflow-y: auto;
      z-index: 50;
      box-shadow: 0 12px 24px -8px rgba(30,42,34,0.18);
    }
    .search-row {
      padding: 14px 18px;
      border-bottom: 1px dashed var(--line);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      transition: background 0.15s ease;
    }
    .search-row:last-child { border-bottom: none; }
    .search-row:hover { background: #ECEFE7; }
    .search-row-name { font-weight: 600; color: var(--ink); font-size: 14.5px; }
    .search-row-code { color: var(--accent-dark); font-family: 'JetBrains Mono', monospace; font-size: 12px; margin-right: 6px; }
    .search-row-meta { font-size: 12.5px; color: var(--muted); margin-top: 4px; }
    .stock-pill { font-weight: 700; font-variant-numeric: tabular-nums; }
    .stock-pill.ok { color: var(--stamp-green); }
    .stock-pill.out { color: var(--stamp-red); }
    .search-row-price { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--ink); font-size: 15px; white-space: nowrap; }
    .search-empty {
      padding: 26px; text-align: center; color: var(--stamp-red); font-weight: 600; font-size: 14px;
    }

    /* ---------- Cart / line items ---------- */
    .cart-wrap { flex: 1; overflow-x: auto; margin-top: 24px; }
    .receipt-table { width: 100%; border-collapse: collapse; }
    .receipt-table th {
      text-align: left;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--muted);
      padding: 0 12px 10px;
      border-bottom: 1px solid var(--line);
    }
    .receipt-table td {
      padding: 14px 12px;
      border-bottom: 1px dashed var(--line);
      vertical-align: middle;
    }
    .receipt-table tr:last-child td { border-bottom: none; }
    .item-name { font-weight: 600; color: var(--ink); font-size: 14px; margin-bottom: 4px; }
    .item-stock {
      font-size: 11px;
      display: inline-block;
      color: var(--ink-soft);
      background: #E7E9DF;
      padding: 2px 8px;
      border-radius: 3px;
      font-family: 'JetBrains Mono', monospace;
    }
    .variant-select {
      width: 100%;
      padding: 6px 8px;
      margin-bottom: 6px;
      font-size: 12px;
      border: 1px solid var(--line);
      border-radius: 5px;
      background: var(--paper-soft);
      color: var(--ink);
    }
    .variant-select:last-child { margin-bottom: 0; }
    .no-variant { font-size: 12px; color: #A2A899; font-style: italic; }
    .num-field {
      width: 100%;
      padding: 9px 10px;
      border: 1px solid var(--line);
      border-radius: 5px;
      background: var(--paper-soft);
      font-family: 'JetBrains Mono', monospace;
      font-variant-numeric: tabular-nums;
      color: var(--ink);
      font-weight: 600;
    }
    .num-field:focus { border-color: var(--accent-dark); }
    .qty-field { text-align: center; font-size: 15px; }
    .line-total {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      text-align: right;
      color: var(--ink);
      font-size: 14.5px;
      font-variant-numeric: tabular-nums;
    }
    .remove-btn {
      color: var(--stamp-red);
      background: transparent;
      border: 1px solid transparent;
      border-radius: 5px;
      padding: 7px 9px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }
    .remove-btn:hover { background: rgba(190,68,56,0.08); border-color: rgba(190,68,56,0.25); }

    .cart-empty {
      text-align: center;
      padding: 60px 20px;
      border: 1px dashed var(--line);
      border-radius: 8px;
      background: #EFF1E9;
    }
    .cart-empty h4 { font-family: 'Space Grotesk', sans-serif; color: var(--ink-soft); margin: 14px 0 6px; font-size: 15px; }
    .cart-empty p { color: var(--muted); font-size: 13px; margin: 0; }

    /* ---------- Receipt slip (right column) ---------- */
    .receipt-tear {
      height: 12px;
      background:
        linear-gradient(135deg, var(--paper-soft) 25%, transparent 25.5%) 0 0 / 14px 14px repeat-x,
        linear-gradient(225deg, var(--paper-soft) 25%, transparent 25.5%) 0 0 / 14px 14px repeat-x;
    }
    .receipt-tear-bottom { transform: rotate(180deg); }
    .receipt-slip {
      background: var(--paper-soft);
      border-left: 1px solid var(--line);
      border-right: 1px solid var(--line);
      box-shadow: 0 1px 2px rgba(30,42,34,0.05);
      padding: 0;
      overflow: hidden;
    }

    .receipt-header {
      padding: 22px 24px 20px;
      border-bottom: 1px dashed var(--line);
    }
    .receipt-field {
      width: 100%;
      border: none;
      border-bottom: 1px solid var(--line);
      background: transparent;
      padding: 8px 2px;
      font-size: 14px;
      color: var(--ink);
      margin-bottom: 10px;
      font-family: 'Inter', sans-serif;
    }
    .receipt-field:last-child { margin-bottom: 0; }
    .receipt-field:focus { outline: none; border-bottom-color: var(--accent-dark); }
    .receipt-field::placeholder { color: #A2A899; }

    .receipt-body { padding: 20px 24px 24px; }
    .summary-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 14px; }
    .summary-label { color: var(--muted); }
    .summary-value { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--ink); font-variant-numeric: tabular-nums; }
    .discount-input {
      width: 100px;
      padding: 6px 10px;
      border: 1px solid var(--line);
      border-radius: 5px;
      text-align: right;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: var(--stamp-red);
      background: var(--paper-soft);
    }

    .divider-dashed { border-top: 1px dashed var(--line); margin: 18px 0; }

    .total-display {
      background: var(--ink);
      border-radius: 6px;
      padding: 18px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
    }
    .total-label {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #9AA592;
    }
    .total-value {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 27px;
      color: var(--accent);
      letter-spacing: 0.01em;
      font-variant-numeric: tabular-nums;
    }

    .paid-label {
      display: block;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 8px;
    }
    .paid-input {
      width: 100%;
      padding: 14px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 20px;
      font-weight: 700;
      text-align: center;
      border: 1.5px solid var(--accent);
      border-radius: 6px;
      color: var(--ink);
      background: var(--paper-soft);
      margin-bottom: 16px;
    }

    .stamp-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 2px solid var(--stamp-red);
      color: var(--stamp-red);
      background: rgba(190,68,56,0.06);
      padding: 9px 14px;
      border-radius: 4px;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 12.5px;
      transform: rotate(-1.5deg);
      width: 100%;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .stamp-badge.change {
      border-color: var(--stamp-green);
      color: var(--stamp-green);
      background: rgba(44,110,78,0.07);
      transform: rotate(1.5deg);
    }
    .stamp-badge .stamp-amount { font-family: 'JetBrains Mono', monospace; font-size: 15px; }

    .pay-pill-group { display: flex; gap: 8px; margin-bottom: 22px; }
    .pay-pill {
      flex: 1;
      padding: 10px 8px;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: var(--paper-soft);
      color: var(--ink-soft);
      font-size: 12.5px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .pay-pill:hover { border-color: var(--accent-dark); }
    .pay-pill.active { background: var(--ink); color: var(--accent); border-color: var(--ink); }

    .checkout-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      background: var(--ink);
      color: var(--accent);
      border: none;
      padding: 17px;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 15px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .checkout-btn:hover:not(:disabled) { background: #14201A; transform: translateY(-1px); }
    .checkout-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  `;

  return (
    <AuthenticatedLayout
      header={
        <div className="pos-app" style={{ paddingBottom: '16px' }}>
          <style>{customStyles}</style>
          <div>
            <Link href={route('admin.sales.index')} className="till-back">
                <Icon name="arrow-left" style={{ fontSize: '13px' }}/> Back to Sales History
            </Link>
            <div className="till-eyebrow"><Barcode /> POS Terminal</div>
            <h1 className="till-title">{isEdit ? 'Edit Sale / Invoice' : 'New Sale'}</h1>
          </div>
        </div>
      }
    >
      <Head title={isEdit ? 'Edit POS' : 'POS'} />

      <div className="pos-app">
        <style>{customStyles}</style>
        <form onSubmit={submit}>
          <div className="register-layout">

              {/* Left Column: Register — search & cart */}
              <div className="register-panel">

                  <div className="till-eyebrow" style={{ marginBottom: '10px' }}>Scan or search</div>
                  <div style={{ position: 'relative' }} ref={searchRef}>
                      <div className="scan-wrap">
                          {searchTerm && <div className="scan-line" />}
                          <Icon name="search"  />
                          <input
                              type="text"
                              placeholder="Scan barcode or type product name / SKU..."
                              value={searchTerm}
                              onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }}
                              onFocus={() => setShowResults(true)}
                              autoFocus
                              className="scan-input"
                          />
                      </div>

                      {showResults && searchTerm && (
                          <div className="search-dropdown">
                              {filteredItems.map(item => (
                                  <div key={item.id} onClick={() => addToCart(item)} className="search-row">
                                      <div>
                                          <div className="search-row-name">
                                              {item.item_code && <span className="search-row-code">[{item.item_code}]</span>}
                                              {item.name}
                                          </div>
                                          <div className="search-row-meta">
                                              {item.size?.length > 0 && <span>Sizes: {item.size.join(', ')} &nbsp;·&nbsp; </span>}
                                              {item.color?.length > 0 && <span>Colors: {item.color.join(', ')} &nbsp;·&nbsp; </span>}
                                              <span className={`stock-pill ${item.quantity > 0 ? 'ok' : 'out'}`}>
                                                  Stock: {item.quantity}
                                              </span>
                                          </div>
                                      </div>
                                      <div className="search-row-price">
                                          <Icon name="tag" style={{ fontSize: '12px', marginRight: '4px', verticalAlign: 'middle' }} />
                                          ৳ {item.selling_price}
                                      </div>
                                  </div>
                              ))}
                              {filteredItems.length === 0 && (
                                  <div className="search-empty">
                                      কোনো প্রোডাক্ট পাওয়া যায়নি!
                                  </div>
                              )}
                          </div>
                      )}
                  </div>

                  {/* --- CART TABLE --- */}
                  <div className="cart-wrap">
                      <table className="receipt-table">
                          <thead>
                              <tr>
                                  <th style={{ width: '32%' }}>Product</th>
                                  <th style={{ width: '22%' }}>Variant</th>
                                  <th style={{ width: '15%', textAlign: 'center' }}>Qty</th>
                                  <th style={{ width: '15%' }}>Price</th>
                                  <th style={{ width: '12%', textAlign: 'right' }}>Total</th>
                                  <th style={{ width: '4%' }}></th>
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
                                              <div className="item-name">{p?.name}</div>
                                              <div className="item-stock">Stock: {p?.quantity} {p?.unit}</div>
                                          </td>
                                          <td>
                                              {hasSize && (
                                                  <select className="variant-select" value={c.size} onChange={(e) => handleCartChange(index, 'size', e.target.value)} required>
                                                      <option value="" disabled>Select Size</option>
                                                      {p.size.map((s, i) => <option key={i} value={s}>{s}</option>)}
                                                  </select>
                                              )}
                                              {hasColor && (
                                                  <select className="variant-select" value={c.color} onChange={(e) => handleCartChange(index, 'color', e.target.value)} required>
                                                      <option value="" disabled>Select Color</option>
                                                      {p.color.map((color, i) => <option key={i} value={color}>{color}</option>)}
                                                  </select>
                                              )}
                                              {(!hasSize && !hasColor) && <span className="no-variant">No variants</span>}
                                          </td>
                                          <td>
                                              <input
                                                  type="number"
                                                  min="1"
                                                  value={c.quantity}
                                                  onChange={(e) => handleCartChange(index, 'quantity', e.target.value)}
                                                  required
                                                  className="num-field qty-field"
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
                                                  className="num-field"
                                              />
                                          </td>
                                          <td className="line-total">৳ {(c.quantity * c.unit_price).toFixed(2)}</td>
                                          <td style={{ textAlign: 'center' }}>
                                              <button type="button" onClick={() => removeCartItem(index)} className="remove-btn" title="Remove Item">
                                                  <Icon name="trash" style={{ fontSize: '15px' }} />
                                              </button>
                                          </td>
                                      </tr>
                                  );
                              })}
                              {cart.length === 0 && (
                                  <tr>
                                      <td colSpan="6" style={{ padding: '20px 0', border: 'none' }}>
                                          <div className="cart-empty">
                                              <Icon name="shopping-cart" style={{ fontSize: '30px', color: '#A2A899' }} />
                                              <h4>Cart is empty</h4>
                                              <p>উপরের সার্চ বক্স থেকে প্রোডাক্ট স্ক্যান বা সার্চ করুন</p>
                                          </div>
                                      </td>
                                  </tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>

              {/* Right Column: Receipt slip — customer, totals, payment */}
              <div className="checkout-sticky" style={{ position: 'sticky', top: '24px' }}>
                  <div className="receipt-tear receipt-tear-top" />
                  <div className="receipt-slip">

                      <div className="receipt-header">
                          <div className="till-eyebrow" style={{ marginBottom: '14px' }}>
                              <Icon name="receipt" style={{ fontSize: '14px' }} /> Receipt <Barcode />
                          </div>
                          <input
                              type="text"
                              className="receipt-field"
                              placeholder="Customer Name (Walk-in)"
                              value={data.customer_name}
                              onChange={(e) => setData('customer_name', e.target.value)}
                          />
                          <input
                              type="text"
                              className="receipt-field"
                              placeholder="Phone Number"
                              value={data.customer_phone}
                              onChange={(e) => setData('customer_phone', e.target.value)}
                          />
                      </div>

                      <div className="receipt-body">

                          <div className="summary-row">
                              <span className="summary-label">Subtotal</span>
                              <span className="summary-value">৳ {Number(data.subtotal).toFixed(2)}</span>
                          </div>

                          <div className="summary-row">
                              <span className="summary-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <Icon name="percent" style={{ fontSize: '12px' }} /> Discount
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ color: '#A2A899', fontSize: '13px' }}>− ৳</span>
                                  <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      className="discount-input"
                                      value={data.discount}
                                      onChange={(e) => setData('discount', e.target.value)}
                                  />
                              </div>
                          </div>

                          <div className="divider-dashed" />

                          <div className="total-display">
                              <span className="total-label">Total Pay</span>
                              <span className="total-value">৳ {Number(data.total_amount).toFixed(2)}</span>
                          </div>

                          <label className="paid-label">Paid Amount</label>
                          <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="paid-input"
                              value={data.paid_amount}
                              onChange={(e) => setData('paid_amount', e.target.value)}
                              onFocus={(e) => e.target.select()}
                          />

                          {due > 0 && (
                              <div className="stamp-badge">
                                  <span>Due Amount</span>
                                  <span className="stamp-amount">৳ {due.toFixed(2)}</span>
                              </div>
                          )}
                          {due < 0 && (
                              <div className="stamp-badge change">
                                  <span>Change ফেরত</span>
                                  <span className="stamp-amount">৳ {Math.abs(due).toFixed(2)}</span>
                              </div>
                          )}

                          <label className="paid-label">Payment Method</label>
                          <div className="pay-pill-group">
                              {['Cash', 'bKash', 'Card'].map(method => (
                                  <button
                                      type="button"
                                      key={method}
                                      className={`pay-pill ${data.payment_method === method ? 'active' : ''}`}
                                      onClick={() => setData('payment_method', method)}
                                  >
                                      {method}
                                  </button>
                              ))}
                          </div>

                          <button type="submit" className="checkout-btn" disabled={processing}>
                              <Icon name="check-circle" style={{ fontSize: '20px' }} />
                              {processing ? 'Processing...' : (isEdit ? 'Update Invoice' : 'Confirm Sale')}
                          </button>
                      </div>
                  </div>
                  <div className="receipt-tear receipt-tear-bottom" />
              </div>

          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}