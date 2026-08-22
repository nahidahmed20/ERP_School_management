import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function MenuItemFormModal({ item, groups, parents, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    menu_group_id: item?.menu_group_id ?? (groups[0]?.id ?? ''),
    parent_id: item?.parent_id ?? '',
    key: item?.key ?? '',
    label: item?.label ?? '',
    icon: item?.icon ?? '',
    route_name: item?.route_name ?? '',
    badge_count: item?.badge_count ?? '',
    order: item?.order ?? 0,
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = {
      onSuccess: () => { reset(); onClose(); },
    };
    isEdit
      ? put(route('admin.menu.update', item.id), options)
      : post(route('admin.menu.store'), options);
  }

  const filteredParents = parents.filter((p) => p.menu_group_id == data.menu_group_id);

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden transform transition-all flex flex-col ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {isEdit ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">Configure routing, icons, and placement.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-slate-100">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Group */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Group</label>
                <select 
                  value={data.menu_group_id} 
                  onChange={(e) => setData('menu_group_id', e.target.value)}
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                >
                  {groups.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
                </select>
                {errors.menu_group_id && <p className="text-rose-500 text-xs mt-1">{errors.menu_group_id}</p>}
              </div>

              {/* Parent */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Parent (submenu হলে বাছাই করুন)</label>
                <select 
                  value={data.parent_id} 
                  onChange={(e) => setData('parent_id', e.target.value)}
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                >
                  <option value="">— None (Top-level item) —</option>
                  {filteredParents.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>

              {/* Label */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Label <span className="text-rose-500">*</span></label>
                <input 
                  value={data.label} 
                  onChange={(e) => setData('label', e.target.value)} 
                  placeholder="e.g. Student List" 
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                {errors.label && <p className="text-rose-500 text-xs mt-1">{errors.label}</p>}
              </div>

              {/* Key */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Key (unique) <span className="text-rose-500">*</span></label>
                <input 
                  value={data.key} 
                  onChange={(e) => setData('key', e.target.value)} 
                  placeholder="e.g. students.list" 
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono"
                />
                {errors.key && <p className="text-rose-500 text-xs mt-1">{errors.key}</p>}
              </div>

              {/* Route Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Route Name</label>
                <input 
                  value={data.route_name} 
                  onChange={(e) => setData('route_name', e.target.value)} 
                  placeholder="e.g. students.index" 
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Icon (শুধু parent এর জন্য)</label>
                <input 
                  value={data.icon} 
                  onChange={(e) => setData('icon', e.target.value)} 
                  placeholder="e.g. users, settings" 
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              {/* Order & Badge */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Order</label>
                  <input 
                    type="number" 
                    min="0" 
                    value={data.order} 
                    onChange={(e) => setData('order', e.target.value)} 
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Badge Count</label>
                  <input 
                    type="number" 
                    min="0" 
                    value={data.badge_count} 
                    onChange={(e) => setData('badge_count', e.target.value)} 
                    placeholder="e.g. 5"
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center pt-8">
                <label className="flex items-center gap-3 cursor-pointer group">
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
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Item is Active</span>
                </label>
              </div>

            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} disabled={processing} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95">
              {processing ? 'Saving...' : (isEdit ? 'Update Menu' : 'Create Menu')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}