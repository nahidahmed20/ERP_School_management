import { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

export default function POS({ inventory_items, accounts, sale }) {
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

  const { data, setData, post, put, processing, errors } = useForm({
    customer_name: sale?.customer_name ?? 'Walk-in Customer',
    customer_phone: sale?.customer_phone ?? '',
    subtotal: sale?.subtotal ? Number(sale.subtotal) : 0,
    discount: sale?.discount ? Number(sale.discount) : 0,
    total_amount: sale?.total_amount ? Number(sale.total_amount) : 0,
    paid_amount: sale?.paid_amount ? Number(sale.paid_amount) : 0,
    payment_method: sale?.payment_method ?? 'Cash',
    account_id: sale?.account_id ?? (accounts?.[0]?.id || ''),
    cart: [],
  });

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
            return;
        }
    }

    if (product.quantity < 1 && !isEdit) {
        return Swal.fire({ icon: 'error', title: 'Stock Out', text: 'এই প্রোডাক্টটি স্টকে নেই!' });
    }

    setCart([{ purchase_item_id: product.id, product: product, size: '', color: '', quantity: 1, unit_price: product.selling_price || 0 }, ...cart]);
    setSearchTerm('');
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
    if (cart.length === 0) return Swal.fire('Error', 'কার্টে কোনো আইটেম নেই!', 'error');
    if (!data.account_id) return Swal.fire('Warning', 'দয়া করে টাকা জমার অ্যাকাউন্ট সিলেক্ট করুন।', 'warning');

    const invalidRow = cart.find(c => (c.product?.size?.length > 0 && !c.size) || (c.product?.color?.length > 0 && !c.color));
    if (invalidRow) return Swal.fire('Warning', 'দয়া করে প্রোডাক্টের Size এবং Color সিলেক্ট করুন।', 'warning');

    if (isEdit) put(route('admin.sales.update', sale.id));
    else post(route('admin.sales.store'));
  }

  const due = Number(data.total_amount) - Number(data.paid_amount);

  return (
    <AuthenticatedLayout
      header={
        <div className="flex justify-between items-center">
          <div>
            <Link href={route('admin.sales.index')} className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-semibold mb-1 transition-colors">
              <Icon name="arrow-left" className="w-3.5 h-3.5"/> Back to Sales History
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{isEdit ? 'Edit Sale / Invoice' : 'POS Terminal'}</h1>
          </div>
        </div>
      }
    >
      <Head title={isEdit ? 'Edit POS' : 'POS'} />

      <div className="w-full h-full p-4 lg:p-6 bg-slate-50">
        <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">

          {/* Left Column: Product Catalog & Search */}
          <div className="lg:col-span-8 flex flex-col gap-4 h-[calc(100vh-150px)]">
            <div className="relative shrink-0 shadow-sm rounded-2xl overflow-hidden bg-white border border-slate-200">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Icon name="search" className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search products by name or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                className="block w-full pl-11 pr-4 py-4 bg-transparent border-none outline-none text-slate-900 text-lg placeholder-slate-400 focus:ring-0"
              />
            </div>

            <div className="flex-1 overflow-y-auto bg-transparent rounded-xl pr-2 custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-10">
                {filteredItems.length > 0 ? (
                  filteredItems.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => addToCart(item)}
                      className={`relative bg-white border rounded-2xl p-4 flex flex-col items-start text-left transition-all active:scale-95 shadow-sm hover:shadow-md ${item.quantity > 0 ? 'border-slate-200 hover:border-indigo-400' : 'border-rose-100 opacity-70'}`}
                    >
                      <div className="flex justify-between w-full items-start mb-2">
                        <span className="font-mono text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{item.item_code}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.quantity > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {item.quantity} In Stock
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-800 text-sm leading-snug mb-3">{item.name}</h3>
                      <div className="mt-auto w-full flex justify-between items-center border-t border-slate-100 pt-3">
                        <span className="font-black text-slate-900">৳ {item.selling_price}</span>
                        <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600">
                           <Icon name="plus" className="w-4 h-4" />
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center text-slate-400">
                    <Icon name="archive" className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium text-lg">কোনো প্রোডাক্ট পাওয়া যায়নি!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Cart & Checkout (Fixed Sidebar) */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-150px)] sticky top-4 overflow-y-auto">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl space-y-3 shrink-0">
              <input
                type="text"
                className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                placeholder="Customer Name (Walk-in)"
                value={data.customer_name}
                onChange={(e) => setData('customer_name', e.target.value)}
              />
              <input
                type="text"
                className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                placeholder="Customer Phone"
                value={data.customer_phone}
                onChange={(e) => setData('customer_phone', e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30 min-h-[250px]">
              {cart.length > 0 ? (
                <div className="space-y-3">
                  {cart.map((c, index) => {
                    const p = c.product;
                    const hasSize = p?.size && p.size.length > 0;
                    const hasColor = p?.color && p.color.length > 0;
                    
                    return (
                      <div key={index} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col gap-3 relative group">
                        <div className="flex justify-between items-start gap-2 pr-6">
                          <div className="font-semibold text-sm text-slate-900 leading-tight">{p?.name}</div>
                        </div>
                        <button type="button" onClick={() => removeCartItem(index)} className="absolute top-3 right-3 text-slate-300 hover:text-rose-500 transition-colors">
                            <Icon name="trash" className="w-4 h-4" />
                        </button>

                        {(hasSize || hasColor) && (
                          <div className="flex gap-2">
                            {hasSize && (
                              <select className="block w-1/2 py-1 px-2 border-slate-200 rounded-md text-xs bg-slate-50 text-slate-700 outline-none focus:border-indigo-500" value={c.size} onChange={(e) => handleCartChange(index, 'size', e.target.value)} required>
                                <option value="" disabled>Size</option>
                                {p.size.map((s, i) => <option key={i} value={s}>{s}</option>)}
                              </select>
                            )}
                            {hasColor && (
                              <select className="block w-1/2 py-1 px-2 border-slate-200 rounded-md text-xs bg-slate-50 text-slate-700 outline-none focus:border-indigo-500" value={c.color} onChange={(e) => handleCartChange(index, 'color', e.target.value)} required>
                                <option value="" disabled>Color</option>
                                {p.color.map((color, i) => <option key={i} value={color}>{color}</option>)}
                              </select>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-1 gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-400">Qty:</span>
                            <input type="number" min="1" value={c.quantity} onChange={(e) => handleCartChange(index, 'quantity', e.target.value)} required className="w-16 py-1 px-2 bg-slate-50 border border-slate-200 rounded-md text-center text-sm font-bold text-slate-800 outline-none" />
                          </div>
                          <div className="flex flex-col items-end">
                             <input type="number" step="0.01" min="0" value={c.unit_price} onChange={(e) => handleCartChange(index, 'unit_price', e.target.value)} required className="w-20 py-0.5 px-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 text-right text-xs text-slate-500 outline-none transition-colors" />
                             <span className="font-black text-slate-900 text-sm">৳ {(c.quantity * c.unit_price).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 py-8">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                    <Icon name="shopping-cart" className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-xs font-medium">Cart is empty</p>
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-slate-200 bg-white rounded-b-2xl p-4 space-y-3">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold text-slate-900">৳ {Number(data.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Discount</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 text-xs">− ৳</span>
                    <input type="number" step="0.01" min="0" className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-right font-mono font-bold text-rose-600 outline-none" value={data.discount} onChange={(e) => setData('discount', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 text-white rounded-xl p-2.5 flex justify-between items-center shadow-md">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pay</span>
                <span className="text-lg font-black text-amber-400 font-mono">৳ {Number(data.total_amount).toFixed(2)}</span>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-1">
                  {['Cash', 'bKash', 'Card'].map(method => (
                    <button type="button" key={method} className={`py-1 px-2 rounded-lg border text-[11px] font-bold transition-all shadow-sm ${data.payment_method === method ? 'bg-slate-900 text-amber-400 border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`} onClick={() => setData('payment_method', method)}>
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deposit Account Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Deposit To Account</label>
                <select 
                  value={data.account_id} 
                  onChange={(e) => setData('account_id', e.target.value)}
                  className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                  required
                >
                  <option value="" disabled>Select Account</option>
                  {accounts && accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.code} - {acc.name} ({acc.type})
                    </option>
                  ))}
                </select>
                {errors.account_id && <div className="text-rose-500 text-[10px] mt-0.5">{errors.account_id}</div>}
              </div>

              {/* Quick Pay Buttons */}
              <div className="flex gap-1.5">
                <button type="button" onClick={() => setData('paid_amount', data.total_amount)} className="flex-1 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold rounded-lg transition-colors">
                  Full Paid
                </button>
                <button type="button" onClick={() => setData('paid_amount', 500)} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg">
                  ৳500
                </button>
                <button type="button" onClick={() => setData('paid_amount', 1000)} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg">
                  ৳1000
                </button>
              </div>

              <div>
                <input type="number" step="0.01" min="0" placeholder="Paid Amount..." className="block w-full py-2 px-3 bg-amber-50/50 border border-amber-300 rounded-lg font-mono text-base font-black text-center text-slate-900 outline-none focus:ring-2 focus:ring-amber-400" value={data.paid_amount || ''} onChange={(e) => setData('paid_amount', e.target.value)} onFocus={(e) => e.target.select()} />
              </div>

              {due !== 0 && (
                <div className={`px-3 py-1.5 rounded-lg flex justify-between items-center text-[11px] font-bold uppercase tracking-wider border ${due > 0 ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                  <span>{due > 0 ? 'Due Amount' : 'Change Return'}</span>
                  <span className="font-mono text-xs">৳ {Math.abs(due).toFixed(2)}</span>
                </div>
              )}

              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wide text-xs rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60" disabled={processing}>
                <Icon name="check-circle" className="w-4 h-4" />
                {processing ? 'Processing...' : (isEdit ? 'Update Invoice' : 'Confirm Sale')}
              </button>
            </div>
          </div>

        </form>
      </div>
    </AuthenticatedLayout>
  );
}