import { useForm, usePage } from '@inertiajs/react';
import WorkingCampusField from '@/Components/WorkingCampusField';
import Icon from '@/Components/Icons';

export default function FoodItemFormModal({ item, outlets, rawMaterials, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? auth?.active_campus_id ?? activeCampusId ?? '',
    cafeteria_outlet_id: item?.cafeteria_outlet_id ?? '',
    cafeteria_raw_material_id: item?.cafeteria_raw_material_id ?? '', 
    name: item?.name ?? '',
    category: item?.category ?? 'Snacks',
    price: item?.price ?? '',
    stock_quantity: item?.stock_quantity ?? 0,
    reorder_level: item?.reorder_level ?? 5,
    stock_unit: item?.stock_unit ?? 'pcs',
    is_available: item?.is_available ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.cafeteria.menu-items.update', item.id), options);
    else post(route('admin.cafeteria.menu-items.store'), options);
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Food Item' : 'Add Food Item'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure menu item details, price, and kitchen stock.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 border border-slate-200 shadow-sm"><Icon name="close" className="w-4 h-4" /></button>
        </div>

        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className={labelClass}>Assign to Campus <span className="text-rose-500">*</span></label>
                <WorkingCampusField value={data.campus_id} campuses={campuses} className={`${inputClass} ${!isSuperAdmin ? 'bg-slate-100 opacity-70' : 'bg-white'}`} />
                {errors.campus_id && <p className="text-rose-500 text-xs mt-1">{errors.campus_id}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Outlet / Canteen <span className="text-rose-500">*</span></label>
                <select value={data.cafeteria_outlet_id} onChange={e => setData('cafeteria_outlet_id', e.target.value)} required className={`${inputClass} bg-white`}>
                  <option value="" disabled>Select Outlet</option>
                  {outlets?.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
                {errors.cafeteria_outlet_id && <p className="text-rose-500 text-xs mt-1">{errors.cafeteria_outlet_id}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Food Name <span className="text-rose-500">*</span></label>
                <input value={data.name} onChange={e => setData('name', e.target.value)} required placeholder="e.g. Chicken Burger" className={inputClass} autoFocus />
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* 🟢 Category Fix */}
              <div>
                <label className={labelClass}>Category <span className="text-rose-500">*</span></label>
                <select value={data.category} onChange={e => setData('category', e.target.value)} required className={`${inputClass} bg-white`}>
                  <option value="" disabled>Select a category</option>
                  <option value="Breakfast">Breakfast (সকালের নাস্তা)</option>
                  <option value="Snacks">Snacks (হালকা নাস্তা)</option>
                  <option value="Lunch">Lunch (দুপুরের খাবার)</option>
                  <option value="Fast Food">Fast Food (ফাস্ট ফুড)</option>
                  <option value="Bakery">Bakery & Pastry (বেকারি)</option>
                  <option value="Drinks">Drinks & Beverages (পানীয়)</option>
                  <option value="Dessert">Dessert & Sweets (মিষ্টি জাতীয়)</option>
                  <option value="Healthy">Healthy / Vegan (স্বাস্থ্যকর)</option>
                  <option value="Combo">Combo Meal (কম্বো মিল)</option>
                  <option value="Ice Cream">Ice Cream (আইসক্রিম)</option>
                  <option value="Others">Others (অন্যান্য)</option>
                </select>
                {errors.category && <p className="text-rose-500 text-xs mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className={labelClass}>Selling Price (৳) <span className="text-rose-500">*</span></label>
                <input type="number" step="0.01" min="0" value={data.price} onChange={e => setData('price', e.target.value)} required placeholder="0.00" className={`${inputClass} font-mono font-bold text-emerald-600`} />
                {errors.price && <p className="text-rose-500 text-xs mt-1">{errors.price}</p>}
              </div>

              <div className="sm:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div>
                  <label className={labelClass}>Link to Kitchen Raw Material (Optional)</label>
                  <select value={data.cafeteria_raw_material_id} onChange={e => setData('cafeteria_raw_material_id', e.target.value)} className={`${inputClass} bg-white`}>
                    <option value="">No linked material (Direct Sale Item)</option>
                    {rawMaterials?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">If linked, raw stock will be automatically deducted when this item is sold.</p>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Qty</label>
                    <input type="number" min="0" value={data.stock_quantity} onChange={e => setData('stock_quantity', e.target.value)} required className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Reorder Alert</label>
                    <input type="number" min="0" value={data.reorder_level} onChange={e => setData('reorder_level', e.target.value)} required className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
                    <input value={data.stock_unit} onChange={e => setData('stock_unit', e.target.value)} placeholder="pcs, plate, cup" required className={inputClass} />
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer group w-max">
                  <div className="relative flex items-center">
                    <input type="checkbox" checked={data.is_available} onChange={e => setData('is_available', e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded checked:bg-indigo-600 checked:border-indigo-600 cursor-pointer transition-colors" />
                    <svg className="absolute w-3.5 h-3.5 top-[3px] left-[3px] text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Available for Sale</span>
                </label>
              </div>

            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">Cancel</button>
            <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md">
              <Icon name="save" className="w-4 h-4" /> {processing ? 'Saving...' : 'Save Food Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}