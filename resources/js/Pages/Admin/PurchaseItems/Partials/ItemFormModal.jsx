import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function ItemFormModal({ item, campuses, sizes, colors, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const generateSKU = () => {
    return `PRD-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  };

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    item_code: item?.item_code || generateSKU(),
    name: item?.name ?? '',
    category: item?.category ?? 'Stationery',
    size: item?.size ?? [],
    color: item?.color ?? [],
    unit: item?.unit ?? 'pcs',
    quantity: item?.quantity ?? 0,
    purchase_price: item?.purchase_price ?? '',
    selling_price: item?.selling_price ?? '',
    description: item?.description ?? '',
    is_active: item?.is_active ?? true,
  });

  const toggleArrayItem = (field, value) => {
    const currentArray = data[field] || [];
    if (currentArray.includes(value)) {
        setData(field, currentArray.filter(i => i !== value));
    } else {
        setData(field, [...currentArray, value]);
    }
  };

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.purchase.items.update', item.id), options);
    else post(route('admin.purchase.items.store'), options);
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>

      {/* Responsive Modal Box */}
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Item' : 'Add New Item'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure product details, stock, and variations.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div className="sm:col-span-2">
                <label className={labelClass}>Item Name <span className="text-rose-500">*</span></label>
                <input
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  required
                  placeholder="e.g. School T-Shirt"
                  className={inputClass}
                  autoFocus
                />
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className={labelClass}>Item Code / SKU <span className="text-rose-500">*</span></label>
                <input
                  value={data.item_code}
                  onChange={(e) => setData('item_code', e.target.value)}
                  required
                  className={`${inputClass} font-mono`}
                />
                {errors.item_code && <p className="text-rose-500 text-xs mt-1">{errors.item_code}</p>}
              </div>

              <div>
                <label className={labelClass}>Category <span className="text-rose-500">*</span></label>
                <select value={data.category} onChange={(e) => setData('category', e.target.value)} required className={`${inputClass} bg-white`}>
                  <option value="Uniforms">Uniforms</option>
                  <option value="Books">Books</option>
                  <option value="Stationery">Stationery</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              {/* Multiple Sizes Selection */}
              <div className="sm:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="block text-sm font-bold text-slate-800 mb-3">Available Sizes</span>
                <div className="flex flex-wrap gap-2.5">
                  {sizes?.length === 0 ? (
                    <span className="text-slate-500 text-xs italic">No sizes created yet. Go to Manage Sizes.</span>
                  ) : (
                    sizes?.map(s => {
                      const isChecked = data.size.includes(s.name);
                      return (
                        <label key={s.id} className="cursor-pointer">
                          <input
                            type="checkbox"
                            className="peer hidden"
                            checked={isChecked}
                            onChange={() => toggleArrayItem('size', s.name)}
                          />
                          <div className={`px-4 py-1.5 rounded-lg border text-sm font-bold transition-all shadow-sm select-none ${isChecked ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'}`}>
                            {s.name}
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Multiple Colors Selection */}
              <div className="sm:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="block text-sm font-bold text-slate-800 mb-3">Available Colors</span>
                <div className="flex flex-wrap gap-2.5">
                  {colors?.length === 0 ? (
                    <span className="text-slate-500 text-xs italic">No colors created yet. Go to Manage Colors.</span>
                  ) : (
                    colors?.map(c => {
                      const isChecked = data.color.includes(c.name);
                      return (
                        <label key={c.id} className="cursor-pointer">
                          <input
                            type="checkbox"
                            className="peer hidden"
                            checked={isChecked}
                            onChange={() => toggleArrayItem('color', c.name)}
                          />
                          <div className={`px-4 py-1.5 rounded-lg border text-sm font-bold transition-all shadow-sm select-none ${isChecked ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'}`}>
                            {c.name}
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <label className={labelClass}>Initial/Current Stock <span className="text-rose-500">*</span></label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={data.quantity}
                    onChange={(e) => setData('quantity', e.target.value)}
                    min="0"
                    required
                    className={`${inputClass} font-mono w-2/3`}
                  />
                  <select value={data.unit} onChange={(e) => setData('unit', e.target.value)} required className={`${inputClass} w-1/3 bg-white`}>
                    <option value="pcs">pcs</option>
                    <option value="set">Set</option>
                    <option value="box">Box</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Assign to Campus <span className="text-rose-500">*</span></label>
                <select
                  value={data.campus_id || ''}
                  onChange={(e) => setData('campus_id', e.target.value)}
                  disabled={!isSuperAdmin}
                  required
                  className={`${inputClass} ${!isSuperAdmin ? 'bg-slate-100 opacity-70' : 'bg-white'}`}
                >
                  <option value="" disabled>Select Campus</option>
                  {campuses?.map(campus => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
                </select>
              </div>

              <div>
                <label className={labelClass}>Purchase Price (Buying Cost)</label>
                <input
                  type="number"
                  step="0.01"
                  value={data.purchase_price}
                  onChange={(e) => setData('purchase_price', e.target.value)}
                  min="0"
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div>
                <label className={labelClass}>Selling Price (POS Sale Price) <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  value={data.selling_price}
                  onChange={(e) => setData('selling_price', e.target.value)}
                  min="0"
                  required
                  className={`${inputClass} font-mono font-bold text-emerald-600 bg-emerald-50/30 border-emerald-200`}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Description / Remarks</label>
                <textarea
                  rows="3"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer group w-max">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={data.is_active}
                      onChange={(e) => setData('is_active', e.target.checked)}
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-0 checked:bg-indigo-600 checked:border-indigo-600 cursor-pointer transition-colors"
                    />
                    <svg className="absolute w-3.5 h-3.5 top-[3px] left-[3px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Item is Active (Available for sale)</span>
                </label>
              </div>

            </div>
          </div>

          {/* Footer - Stacked on Mobile, Row on Desktop */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
              <Icon name="save" className="w-4 h-4" />
              {processing ? 'Saving...' : (isEdit ? 'Update Item' : 'Save Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
