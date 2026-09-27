import { useForm, usePage } from '@inertiajs/react';
import WorkingCampusField from '@/Components/WorkingCampusField';
import Icon from '@/Components/Icons';

export default function OrderFormModal({ outlets, users, foods, campuses, activeCampusId, onClose }) {
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, processing, errors, reset } = useForm({
    campus_id: auth?.active_campus_id ?? activeCampusId ?? '',
    user_id: '',
    cafeteria_outlet_id: '',
    status: 'Served', 
    payment_status: 'Paid',
    items: [], 
  });

  const totalAmount = data.items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const availableFoods = data.cafeteria_outlet_id 
    ? foods.filter(f => String(f.cafeteria_outlet_id) === String(data.cafeteria_outlet_id))
    : [];

  const addItemRow = () => setData('items', [...data.items, { food_item_id: '', name: '', price: 0, qty: 1 }]);

  const updateItem = (index, field, value) => {
    const newItems = [...data.items];
    if (field === 'food_item_id') {
      const selectedFood = foods.find(f => String(f.id) === String(value));
      newItems[index] = { food_item_id: selectedFood.id, name: selectedFood.name, price: selectedFood.price, qty: newItems[index].qty || 1 };
    } else {
      newItems[index][field] = value;
    }
    setData('items', newItems);
  };

  const removeItem = (index) => setData('items', data.items.filter((_, i) => i !== index));

  function submit(e) {
    e.preventDefault();
    if (data.items.length === 0) return alert('Please add at least one food item!');
    post(route('admin.cafeteria.orders.store'), { onSuccess: () => { reset(); onClose(); } });
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between bg-slate-50/50 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold">Create Manual Order</h3>
            <p className="text-sm text-slate-500">Create a new order and calculate total automatically.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full border bg-white flex items-center justify-center text-slate-400 hover:text-slate-600"><Icon name="close" className="w-4 h-4" /></button>
        </div>

        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
            
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Customer <span className="text-rose-500">*</span></label>
                <select value={data.user_id} onChange={e => setData('user_id', e.target.value)} required className={`${inputClass} bg-white`}>
                  <option value="" disabled>Select User</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                {errors.user_id && <p className="text-rose-500 text-xs mt-1">{errors.user_id}</p>}
              </div>

              <div>
                <label className={labelClass}>Outlet <span className="text-rose-500">*</span></label>
                <select value={data.cafeteria_outlet_id} onChange={e => { setData('cafeteria_outlet_id', e.target.value); setData('items', []); }} required className={`${inputClass} bg-white`}>
                  <option value="" disabled>Select Outlet First</option>
                  {outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
                {errors.cafeteria_outlet_id && <p className="text-rose-500 text-xs mt-1">{errors.cafeteria_outlet_id}</p>}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-slate-800">Order Items</h4>
                <button type="button" onClick={addItemRow} disabled={!data.cafeteria_outlet_id} className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-200 disabled:opacity-50 transition-colors">
                  + Add Food
                </button>
              </div>

              <div className="space-y-3">
                {data.items.length === 0 ? (
                  <p className="text-sm text-center text-slate-400 py-4">No items added. Select an outlet and click Add Food.</p>
                ) : (
                  data.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex-1">
                        <select value={item.food_item_id} onChange={e => updateItem(index, 'food_item_id', e.target.value)} required className="w-full text-sm border-none bg-transparent focus:ring-0">
                          <option value="" disabled>Select Food Item</option>
                          {availableFoods.map(f => <option key={f.id} value={f.id}>{f.name} - ৳{f.price}</option>)}
                        </select>
                      </div>
                      <div className="w-24">
                        <input type="number" min="1" value={item.qty} onChange={e => updateItem(index, 'qty', parseInt(e.target.value) || 1)} className="w-full text-center text-sm border-slate-200 rounded-lg" required />
                      </div>
                      <div className="w-24 text-right font-bold text-slate-800 font-mono">
                        ৳{item.price * item.qty}
                      </div>
                      <button type="button" onClick={() => removeItem(index)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Icon name="trash" className="w-4 h-4" /></button>
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center px-2">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-sm">Grand Total</span>
                <span className="text-2xl font-black text-emerald-600 font-mono">৳ {totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Order Status</label>
                <select value={data.status} onChange={e => setData('status', e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="Pending">Pending</option>
                  <option value="Served">Served / Completed</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Payment Status</label>
                <select value={data.payment_status} onChange={e => setData('payment_status', e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
            </div>

          </div>

          <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="px-5 py-2.5 rounded-xl border bg-white font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
            
            {/* 🟢 THE MAGIC HAPPENS HERE: Save vs Saving... Animation */}
            <button type="submit" disabled={processing || data.items.length === 0} className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold flex items-center gap-2 disabled:opacity-70 transition-all shadow-md">
              {processing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Order...
                </>
              ) : (
                <>
                  <Icon name="save" className="w-4 h-4" /> Save Order
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}