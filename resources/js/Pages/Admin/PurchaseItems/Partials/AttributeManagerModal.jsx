import { useForm, router } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function AttributeManagerModal({ sizes, colors, onClose }) {
  const sizeForm = useForm({ name: '' });
  const colorForm = useForm({ name: '' });

  const addSize = (e) => {
    e.preventDefault();
    sizeForm.post(route('admin.purchase.items.sizes.store'), {
      onSuccess: () => sizeForm.reset('name'),
    });
  };

  const addColor = (e) => {
    e.preventDefault();
    colorForm.post(route('admin.purchase.items.colors.store'), {
      onSuccess: () => colorForm.reset('name'),
    });
  };

  const deleteSize = (id) => router.delete(route('admin.purchase.items.sizes.destroy', id));
  const deleteColor = (id) => router.delete(route('admin.purchase.items.colors.destroy', id));

  const inputClass = "block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";

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
            <h3 className="text-xl font-bold text-slate-900">Manage Sizes & Colors</h3>
            <p className="text-sm text-slate-500 mt-1">Configure available variations for items.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 overflow-y-auto flex-1 custom-scrollbar">

          {/* Sizes Section */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col h-[350px] sm:h-[400px]">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Sizes</h4>
            <form onSubmit={addSize} className="flex gap-2 mb-4 shrink-0">
              <input
                value={sizeForm.data.name}
                onChange={(e) => sizeForm.setData('name', e.target.value)}
                placeholder="e.g. XL, 32"
                required
                className={inputClass}
              />
              <button
                type="submit"
                disabled={sizeForm.processing}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-sm transition-colors disabled:opacity-70"
              >
                Add
              </button>
            </form>
            <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
              {sizes.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4">No sizes added yet.</p>
              ) : (
                sizes.map(s => (
                  <div key={s.id} className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <span className="font-semibold text-slate-700 text-sm">{s.name}</span>
                    <button onClick={() => deleteSize(s.id)} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors" title="Delete">
                      <Icon name="trash" className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Colors Section */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col h-[350px] sm:h-[400px]">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Colors</h4>
            <form onSubmit={addColor} className="flex gap-2 mb-4 shrink-0">
              <input
                value={colorForm.data.name}
                onChange={(e) => colorForm.setData('name', e.target.value)}
                placeholder="e.g. Red, Blue"
                required
                className={inputClass}
              />
              <button
                type="submit"
                disabled={colorForm.processing}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-sm transition-colors disabled:opacity-70"
              >
                Add
              </button>
            </form>
            <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
              {colors.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4">No colors added yet.</p>
              ) : (
                colors.map(c => (
                  <div key={c.id} className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <span className="font-semibold text-slate-700 text-sm">{c.name}</span>
                    <button onClick={() => deleteColor(c.id)} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors" title="Delete">
                      <Icon name="trash" className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end shrink-0 rounded-b-2xl">
          <button type="button" className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
