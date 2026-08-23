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

    if (field === 'quantity') {
        const maxQty = currentItem.product.quantity;
        if (Number(value) > maxQty && !isEdit) {
            Swal.fire({ icon: 'warning', title: 'Stock Limit Reached', text: `স্টকে সর্বোচ্চ ${maxQty} টি আছে।` });
            value = maxQty;
        }
    }

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

  const barcodeWidths = [2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2];
  const Barcode = ({ tone = 'dark' }) => (
    <span className={`inline-flex items-end gap-0.5 h-3.5 ${tone === 'light' ? 'opacity-80' : ''}`} aria-hidden="true">
      {barcodeWidths.map((w, i) => <span key={i} style={{ width: `${w}px` }} className={`block h-full ${tone === 'light' ? 'bg-white' : 'bg-slate-900'}`} />)}
    </span>
  );

  const due = Number(data.total_amount) - Number(data.paid_amount);

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <Link href={route('admin.sales.index')} className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-semibold mb-2 transition-colors w-max">
            <Icon name="arrow-left" className="w-3.5 h-3.5"/> Back to Sales History
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-indigo-600 uppercase">
            <Barcode /> POS Terminal
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{isEdit ? 'Edit Sale / Invoice' : 'New Sale'}</h1>
        </div>
      }
    >
      <Head title={isEdit ? 'Edit POS' : 'POS'} />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        <form onSubmit={submit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left Column: Register — Search & Cart */}
            <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">Scan or Search</span>

                {/* Scanner search input */}
                <div className="relative" ref={searchRef}>
                  <div className="relative flex items-center bg-slate-900 rounded-xl p-4 shadow-inner">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-amber-400">
                      <Icon name="search" className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Scan barcode or type product name / SKU..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }}
                      onFocus={() => setShowResults(true)}
                      autoFocus
                      className="block w-full pl-11 pr-4 bg-transparent border-none outline-none text-white font-mono text-base placeholder-slate-400"
                    />
                  </div>

                  {showResults && searchTerm && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl max-h-80 overflow-y-auto z-50 shadow-xl divide-y divide-slate-100">
                      {filteredItems.map(item => (
                        <div key={item.id} onClick={() => addToCart(item)} className="p-3.5 hover:bg-slate-50 cursor-pointer flex justify-between items-center gap-4 transition-colors">
                          <div>
                            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                              {item.item_code && <span className="font-mono text-xs px-1.5 py-0.5 bg-slate-100 text-indigo-600 rounded">[{item.item_code}]</span>}
                              {item.name}
                            </div>
                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 font-medium">
                              {item.size?.length > 0 && <span>Sizes: {item.size.join(', ')}</span>}
                              {item.color?.length > 0 && <span>Colors: {item.color.join(', ')}</span>}
                              <span className={item.quantity > 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>Stock: {item.quantity}</span>
                            </div>
                          </div>
                          <div className="text-sm font-black text-slate-900 font-mono shrink-0">৳ {item.selling_price}</div>
                        </div>
                      ))}
                      {filteredItems.length === 0 && (
                        <div className="p-6 text-center text-rose-500 font-semibold text-sm">কোনো প্রোডাক্ট পাওয়া যায়নি!</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Cart / Line Items Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-4 py-3.5">Product</th>
                      <th className="px-4 py-3.5 w-44">Variant</th>
                      <th className="px-4 py-3.5 w-24 text-center">Qty</th>
                      <th className="px-4 py-3.5 w-32">Price</th>
                      <th className="px-4 py-3.5 w-28 text-right">Total</th>
                      <th className="px-4 py-3.5 w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {cart.map((c, index) => {
                      const p = c.product;
                      const hasSize = p?.size && p.size.length > 0;
                      const hasColor = p?.color && p.color.length > 0;

                      return (
                        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3.5">
                            <span className="font-bold text-slate-900 block">{p?.name}</span>
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded mt-1 inline-block">Stock: {p?.quantity} {p?.unit}</span>
                          </td>
                          <td className="px-4 py-3.5 space-y-2">
                            {hasSize && (
                              <select className="block w-full py-1.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none" value={c.size} onChange={(e) => handleCartChange(index, 'size', e.target.value)} required>
                                <option value="" disabled>Select Size</option>
                                {p.size.map((s, i) => <option key={i} value={s}>{s}</option>)}
                              </select>
                            )}
                            {hasColor && (
                              <select className="block w-full py-1.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none" value={c.color} onChange={(e) => handleCartChange(index, 'color', e.target.value)} required>
                                <option value="" disabled>Select Color</option>
                                {p.color.map((color, i) => <option key={i} value={color}>{color}</option>)}
                              </select>
                            )}
                            {!hasSize && !hasColor && <span className="text-xs text-slate-400 italic">No variants</span>}
                          </td>
                          <td className="px-4 py-3.5">
                            <input
                              type="number"
                              min="1"
                              value={c.quantity}
                              onChange={(e) => handleCartChange(index, 'quantity', e.target.value)}
                              required
                              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono font-bold text-slate-800 outline-none"
                            />
                          </td>
                          <td className="px-4 py-3.5">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={c.unit_price}
                              onChange={(e) => handleCartChange(index, 'unit_price', e.target.value)}
                              required
                              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 outline-none"
                            />
                          </td>
                          <td className="px-4 py-3.5 text-right font-black text-slate-900 font-mono">
                            ৳ {(c.quantity * c.unit_price).toFixed(2)}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <button type="button" onClick={() => removeCartItem(index)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Remove">
                              <Icon name="trash" className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {cart.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-16 text-center text-slate-400 italic bg-slate-50/50">
                          <Icon name="shopping-cart" className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="font-semibold text-slate-600">Cart is empty</p>
                          <p className="text-xs mt-1">উপরের সার্চ বক্স থেকে প্রোডাক্ট স্ক্যান বা সার্চ করুন</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>

            {/* Right Column: Receipt slip — Customer, Totals, Payment */}
            <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5 sticky top-6">

              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <Icon name="receipt" className="w-4 h-4 text-indigo-600" /> Receipt
                </div>
                <Barcode />
              </div>

              {/* Customer Inputs */}
              <div className="space-y-3">
                <input
                  type="text"
                  className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Customer Name (Walk-in)"
                  value={data.customer_name}
                  onChange={(e) => setData('customer_name', e.target.value)}
                />
                <input
                  type="text"
                  className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Phone Number"
                  value={data.customer_phone}
                  onChange={(e) => setData('customer_phone', e.target.value)}
                />
              </div>

              <div className="border-t border-dashed border-slate-200 pt-4 space-y-3 text-sm">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold text-slate-900">৳ {Number(data.subtotal).toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-1.5"><Icon name="percent" className="w-3.5 h-3.5" /> Discount</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs">− ৳</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-right font-mono font-bold text-rose-600 outline-none"
                      value={data.discount}
                      onChange={(e) => setData('discount', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-200 pt-4">
                <div className="bg-slate-900 text-white rounded-xl p-4 flex justify-between items-center shadow-md">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pay</span>
                  <span className="text-2xl font-black text-amber-400 font-mono">৳ {Number(data.total_amount).toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Paid Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="block w-full py-3 px-4 bg-slate-50 border-2 border-amber-400 rounded-xl font-mono text-xl font-black text-center text-slate-900 outline-none"
                  value={data.paid_amount}
                  onChange={(e) => setData('paid_amount', e.target.value)}
                  onFocus={(e) => e.target.select()}
                />
              </div>

              {due > 0 && (
                <div className="bg-rose-50 border-2 border-rose-300 text-rose-700 px-4 py-2.5 rounded-xl flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                  <span>Due Amount</span>
                  <span className="font-mono text-base">৳ {due.toFixed(2)}</span>
                </div>
              )}
              {due < 0 && (
                <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-700 px-4 py-2.5 rounded-xl flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                  <span>Change ফেরত</span>
                  <span className="font-mono text-base">৳ {Math.abs(due).toFixed(2)}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Cash', 'bKash', 'Card'].map(method => (
                    <button
                      type="button"
                      key={method}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all shadow-sm ${data.payment_method === method ? 'bg-slate-900 text-amber-400 border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                      onClick={() => setData('payment_method', method)}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold uppercase tracking-wide text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60" disabled={processing}>
                  <Icon name="check-circle" className="w-5 h-5 text-amber-400" />
                  {processing ? 'Processing...' : (isEdit ? 'Update Invoice' : 'Confirm Sale')}
                </button>
              </div>

            </div>

          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}
