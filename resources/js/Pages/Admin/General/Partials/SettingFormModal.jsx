import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

const TYPES = ['text', 'textarea', 'number', 'boolean', 'image', 'select', 'json'];

export default function SettingFormModal({ item, groups, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    group: item?.group ?? (groups[0] ?? 'general'),
    key: item?.key ?? '',
    value: item?.value ?? '',
    type: item?.type ?? 'text',
    label: item?.label ?? '',
    description: item?.description ?? '',
    order: item?.order ?? 0,
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = {
      onSuccess: () => { reset(); onClose(); },
    };
    if (isEdit) {
      put(route('admin.general.update', item.id), options);
    } else {
      post(route('admin.general.store'), options); 
    }
  }

  // Determine if value field needs full width
  const isFullWidthValue = data.type === 'textarea' || data.type === 'json';

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-opacity animate-in fade-in duration-200" onClick={onClose}>
      
      {/* Responsive Modal Box */}
      <div 
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl overflow-hidden transform transition-all flex flex-col ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {isEdit ? 'Edit System Setting' : 'Add New Setting'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">Configure global key-value parameters.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Campus Selection */}
              <div className="sm:col-span-2">
                <label className={labelClass}>Assign to Campus</label>
                <select 
                  value={data.campus_id || ''} 
                  onChange={(e) => setData('campus_id', e.target.value)}
                  disabled={!isSuperAdmin}
                  className={`${inputClass} ${!isSuperAdmin ? 'opacity-70 bg-slate-100 cursor-not-allowed' : 'bg-white'}`}
                >
                  <option value="" disabled>Select Campus</option>
                  {campuses?.map(campus => (
                    <option key={campus.id} value={campus.id}>{campus.name}</option>
                  ))}
                </select>
                {errors.campus_id && <p className="text-rose-500 text-xs mt-1">{errors.campus_id}</p>}
              </div>

              {/* Group */}
              <div>
                <label className={labelClass}>Setting Group</label>
                <input 
                  list="setting-groups" 
                  value={data.group} 
                  onChange={(e) => setData('group', e.target.value)} 
                  placeholder="e.g. general, mail, payment"
                  className={inputClass}
                />
                <datalist id="setting-groups">
                  {groups.map((g) => <option key={g} value={g} />)}
                </datalist>
                {errors.group && <p className="text-rose-500 text-xs mt-1">{errors.group}</p>}
              </div>

              {/* Type */}
              <div>
                <label className={labelClass}>Data Type</label>
                <select 
                  value={data.type} 
                  onChange={(e) => setData('type', e.target.value)}
                  className={`${inputClass} bg-white capitalize`}
                >
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Key */}
              <div>
                <label className={labelClass}>Key (Unique Identifier) <span className="text-rose-500">*</span></label>
                <input 
                  value={data.key} 
                  onChange={(e) => setData('key', e.target.value)} 
                  disabled={isEdit} 
                  placeholder="e.g. site_name"
                  className={`${inputClass} font-mono font-bold tracking-wide ${isEdit ? 'opacity-60 bg-slate-100 cursor-not-allowed' : ''}`}
                />
                {errors.key && <p className="text-rose-500 text-xs mt-1">{errors.key}</p>}
              </div>

              {/* Label */}
              <div>
                <label className={labelClass}>Display Label</label>
                <input 
                  value={data.label} 
                  onChange={(e) => setData('label', e.target.value)} 
                  placeholder="e.g. Website Name"
                  className={inputClass}
                />
                {errors.label && <p className="text-rose-500 text-xs mt-1">{errors.label}</p>}
              </div>

              {/* Dynamic Value Input */}
              <div className={isFullWidthValue ? 'sm:col-span-2' : ''}>
                <label className={labelClass}>Value</label>
                {data.type === 'boolean' ? (
                  <select 
                    value={data.value} 
                    onChange={(e) => setData('value', e.target.value)}
                    className={`${inputClass} bg-white`}
                  >
                    <option value="1">True / Enabled</option>
                    <option value="0">False / Disabled</option>
                  </select>
                ) : isFullWidthValue ? (
                  <textarea 
                    rows="4" 
                    value={data.value} 
                    onChange={(e) => setData('value', e.target.value)} 
                    placeholder={data.type === 'json' ? '{"key": "value"}' : 'Enter text...'}
                    className={`${inputClass} resize-y ${data.type === 'json' ? 'font-mono text-[13px] leading-relaxed' : ''}`}
                  />
                ) : (
                  <input 
                    type={data.type === 'number' ? 'number' : 'text'}
                    value={data.value} 
                    onChange={(e) => setData('value', e.target.value)} 
                    placeholder="Enter value..."
                    className={inputClass}
                  />
                )}
                {errors.value && <p className="text-rose-500 text-xs mt-1">{errors.value}</p>}
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea 
                  rows="2" 
                  value={data.description} 
                  onChange={(e) => setData('description', e.target.value)} 
                  placeholder="Optional description for this setting..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Order & Active Status */}
              <div className="sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pt-4 border-t border-slate-100">
                
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">Display Order</label>
                  <input 
                    type="number" 
                    value={data.order} 
                    onChange={(e) => setData('order', e.target.value)} 
                    className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-center font-mono"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={data.is_active}
                      onChange={(e) => setData('is_active', e.target.checked)}
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-0 checked:bg-emerald-500 checked:border-emerald-500 cursor-pointer transition-colors"
                    />
                    <svg className="absolute w-3.5 h-3.5 top-[3px] left-[3px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Setting is Active</span>
                </label>
              </div>

            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95">
              <Icon name="save" className="w-4 h-4" />
              {processing ? 'Saving...' : (isEdit ? 'Update Setting' : 'Save Setting')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}