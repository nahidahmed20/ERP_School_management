import { useForm, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

export default function OrderFormModal({ item, vendors, purchase_requests, inventory_items, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const [cart, setCart] = useState(item?.items || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    vendor_id: item?.vendor_id ?? '',
    purchase_request_id: item?.purchase_request_id ?? '',
    order_number: item?.order_number ?? `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
    order_date: item?.order_date ?? new Date().toISOString().split('T')[0],
    delivery_date: item?.delivery_date ?? '',
    total_amount: item?.total_amount ? Number(item.total_amount) : 0,
    status: item?.status ?? 'Pending',
    shipping_address: item?.shipping_address ?? 'Campus Main Store',
    notes: item?.notes ?? '',
    cart: [],
  });

  useEffect(() => {
    const total = cart.reduce((sum, current) => sum + (Number(current.quantity) * Number(current.unit_price)), 0);
    const payloadCart = cart.map(c => ({
        purchase_item_id: c.purchase_item_id || c.purchase_item?.id,
        size: c.size || '',
        color: c.color || '',
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

  const filteredItems = inventory_items.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.item_code && i.item_code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addToCart = (product) => {
    const newItem = {
        purchase_item_id: product.id,
        purchase_item: product,
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
    if(cart.length === 0) return Swal.fire('Error', 'কার্টে অন্তত একটি আইটেম যোগ করুন!', 'error');

    const options = {
      onSuccess: () => { reset(); onClose(); }
    };

    if (isEdit) put(route('admin.purchase.orders.update', item.id), options);
    else post(route('admin.purchase.orders.store'), options);
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>

      {/* Responsive Modal Box */}
      <div
        className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Purchase Order' : 'Create Purchase Order'}</h3>
            <p className="text-sm text-slate-500 mt-1">Manage PO details and order items.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">

            {/* Top Basic Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className={labelClass}>PO Number *</label>
                <input className={`${inputClass} font-mono bg-slate-100`} value={data.order_number} readOnly />
              </div>

              <div>
                <label className={labelClass}>Select Vendor *</label>
                <select className={`${inputClass} bg-white`} value={data.vendor_id} onChange={(e) => setData('vendor_id', e.target.value)} required>
                  <option value="" disabled>Select Vendor...</option>
                  {vendors?.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
                {errors.vendor_id && <p className="text-rose-500 text-xs mt-1">{errors.vendor_id}</p>}
              </div>

              <div>
                <label className={labelClass}>Order Date *</label>
                <input type="date" className={`${inputClass} font-mono`} value={data.order_date} onChange={(e) => setData('order_date', e.target.value)} required />
              </div>
            </div>

            <hr className="border-slate-100 my-2" />

            {/* Cart Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Order Items</h4>

                {/* Search Product to add */}
                <div className="relative w-full sm:w-80" ref={searchRef}>
                  <input
                    type="text"
                    placeholder="Search product to add..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }}
                    onFocus={() => setShowResults(true)}
                    className="block w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  {showResults && searchTerm && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl max-h-60 overflow-y-auto z-50 shadow-xl divide-y divide-slate-100">
                      {filteredItems.map(item => (
                        <div key={item.id} onClick={() => addToCart(item)} className="p-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-slate-800 block">{item.name}</span>
                            <span className="text-[10px] font-mono text-indigo-600">[{item.item_code}]</span>
                          </div>
                          <span className="font-bold text-emerald-600 font-mono">৳{item.purchase_price}</span>
                        </div>
                      ))}
                      {filteredItems.length === 0 && <div className="p-4 text-center text-rose-500 text-xs">No items found</div>}
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-4 py-3">Product Detail</th>
                      <th className="px-4 py-3 w-36">Size</th>
                      <th className="px-4 py-3 w-36">Color</th>
                      <th className="px-4 py-3 w-24 text-center">Qty</th>
                      <th className="px-4 py-3 w-32">Unit Price</th>
                      <th className="px-4 py-3 w-28 text-right">Subtotal</th>
                      <th className="px-4 py-3 w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cart.map((c, index) => {
                      const p = c.purchase_item || c.product;
                      return (
                        <tr key={index} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3">
                            <span className="font-bold text-slate-900 block text-xs sm:text-sm">{p?.name}</span>
                            <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{p?.item_code}</span>
                          </td>
                          <td className="px-4 py-3">
                            <input type="text" value={c.size} onChange={(e) => handleCartChange(index, 'size', e.target.value)} placeholder="Size" className="w-full py-1 px-2 text-xs border border-slate-200 rounded-lg bg-slate-50" />
                          </td>
                          <td className="px-4 py-3">
                            <input type="text" value={c.color} onChange={(e) => handleCartChange(index, 'color', e.target.value)} placeholder="Color" className="w-full py-1 px-2 text-xs border border-slate-200 rounded-lg bg-slate-50" />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input type="number" min="1" value={c.quantity} onChange={(e) => handleCartChange(index, 'quantity', e.target.value)} required className="w-16 py-1 px-2 text-xs border border-slate-200 rounded-lg bg-slate-50 font-mono text-center font-bold" />
                          </td>
                          <td className="px-4 py-3">
                            <input type="number" step="0.01" min="0" value={c.unit_price} onChange={(e) => handleCartChange(index, 'unit_price', e.target.value)} required className="w-full py-1 px-2 text-xs border border-slate-200 rounded-lg bg-slate-50 font-mono font-bold text-slate-800" />
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900 font-mono text-xs sm:text-sm">
                            ৳ {(c.quantity * c.unit_price).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button type="button" onClick={() => removeCartItem(index)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                              <Icon name="trash" className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {cart.length === 0 && (
                      <tr><td colSpan="7" className="text-center py-8 text-slate-400 italic text-xs">No items added to cart. Use search above.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Grand Total */}
              <div className="flex justify-end">
                <div className="bg-slate-900 text-white rounded-xl px-5 py-3 flex items-center gap-6 shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Grand Total</span>
                  <span className="text-xl font-black text-amber-400 font-mono">৳ {Number(data.total_amount || 0).toFixed(2)}</span>
                </div>
              </div>

            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
              <Icon name="save" className="w-4 h-4" />
              {processing ? 'Processing...' : 'Save Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
