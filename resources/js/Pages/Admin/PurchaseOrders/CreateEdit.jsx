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

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col gap-1">
          <Link href={route('admin.purchase.orders.index')} className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-semibold mb-2 transition-colors w-max">
            <Icon name="arrow-left" className="w-3.5 h-3.5"/> Back to Orders
          </Link>
          <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Purchase & Assets</span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{isEdit ? 'Edit Purchase Order' : 'Create New Purchase Order'}</h1>
        </div>
      }
    >
      <Head title={isEdit ? 'Edit PO' : 'Create PO'} />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        <form onSubmit={submit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left Column: Order Items & Search */}
            <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">Order Items</span>

                {/* Product Search Box */}
                <div className="relative" ref={searchRef}>
                  <div className="relative flex items-center">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Icon name="search" className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search product by name or SKU to add..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }}
                      onFocus={() => setShowResults(true)}
                      className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono"
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
                          <div className="text-sm font-black text-indigo-600 font-mono shrink-0">৳ {item.purchase_price}</div>
                        </div>
                      ))}
                      {filteredItems.length === 0 && (
                        <div className="p-6 text-center text-rose-500 font-semibold text-sm">কোনো প্রোডাক্ট পাওয়া যায়নি!</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table / List */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-4 py-3.5">Product Detail</th>
                      <th className="px-4 py-3.5 w-44">Variants</th>
                      <th className="px-4 py-3.5 w-24 text-center">Qty</th>
                      <th className="px-4 py-3.5 w-32">Unit Price</th>
                      <th className="px-4 py-3.5 w-28 text-right">Subtotal</th>
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
                            <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded mt-1 inline-block">{p?.item_code}</span>
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
                            {!hasSize && !hasColor && <span className="text-xs text-slate-400 italic">No Variants</span>}
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
                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">
                          No items added yet. Search and select products from above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Grand Total Summary */}
              <div className="flex justify-end pt-2">
                <div className="bg-slate-900 text-white rounded-2xl px-6 py-4 flex items-center gap-8 shadow-md">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Grand Total</span>
                  <span className="text-2xl font-black text-amber-400 font-mono">৳ {Number(data.total_amount || 0).toFixed(2)}</span>
                </div>
              </div>

            </div>

            {/* Right Column: Order Details */}
            <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">

              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <Icon name="file" className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Order Details</h3>
              </div>

              <div>
                <label className={labelClass}>Campus <span className="text-rose-500">*</span></label>
                <select className={inputClass} value={data.campus_id || ''} onChange={(e) => setData('campus_id', e.target.value)} disabled={!isSuperAdmin} required>
                  {campuses?.map(campus => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
                </select>
                {errors.campus_id && <p className="text-rose-500 text-xs mt-1">{errors.campus_id}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">PO Number <span className="text-rose-500">*</span></label>
                  {isEdit && order?.status && (
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${order.status === 'Received' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {order.status}
                    </span>
                  )}
                </div>
                <input className={`${inputClass} font-mono`} value={data.order_number} onChange={(e) => setData('order_number', e.target.value)} required />
                {errors.order_number && <p className="text-rose-500 text-xs mt-1">{errors.order_number}</p>}
              </div>

              <div>
                <label className={labelClass}>Select Vendor <span className="text-rose-500">*</span></label>
                <select className={`${inputClass} bg-white`} value={data.vendor_id} onChange={(e) => setData('vendor_id', e.target.value)} required>
                  <option value="" disabled>-- Choose Vendor --</option>
                  {vendors?.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
                {errors.vendor_id && <p className="text-rose-500 text-xs mt-1">{errors.vendor_id}</p>}
              </div>

              <div>
                <label className={labelClass}>Order Date <span className="text-rose-500">*</span></label>
                <input type="date" className={`${inputClass} font-mono`} value={data.order_date} onChange={(e) => setData('order_date', e.target.value)} required />
              </div>

              <div>
                <label className={labelClass}>Shipping Address</label>
                <textarea className={`${inputClass} resize-none`} rows="2" value={data.shipping_address} onChange={(e) => setData('shipping_address', e.target.value)} />
              </div>

              <div>
                <label className={labelClass}>Terms & Notes</label>
                <textarea className={`${inputClass} resize-none`} rows="2" placeholder="Add any special instructions..." value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold uppercase tracking-wide text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60" disabled={processing}>
                  <Icon name={isEdit ? "edit" : "check"} className="w-5 h-5 text-amber-400" />
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
