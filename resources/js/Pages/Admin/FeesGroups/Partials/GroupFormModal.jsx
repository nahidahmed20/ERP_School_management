import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function GroupFormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: item?.name ?? '',
    description: item?.description ?? '',
    is_active: item ? !!item.is_active : true, 
  });

  function submit(e) {
    e.preventDefault();
    const options = {
      onSuccess: () => { reset(); onClose(); },
    };
    if (isEdit) {
      put(route('admin.fees-groups.update', item.id), options);
    } else {
      post(route('admin.fees-groups.store'), options);
    }
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div 
        className="mm-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ padding: 0, overflow: 'hidden', maxWidth: '600px', width: '100%' }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Fee Group' : 'Add New Fee Group'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure group name and fee details.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-slate-100">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            
            <div className="grid grid-cols-1 gap-5">
              
              <div>
                <label className={labelClass}>Group Name <span className="text-rose-500">*</span></label>
                <input
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  autoFocus
                  required
                  placeholder="e.g. Admission Fees, Monthly Tuition"
                  className={inputClass}
                />
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  rows="3"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="Short details about this fee group..."
                  className={`${inputClass} resize-none`}
                />
                {errors.description && <p className="text-rose-500 text-xs mt-1">{errors.description}</p>}
              </div>

              <div className="pt-2 border-t border-slate-100">
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
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Group is Active</span>
                </label>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
              <Icon name="save" className="w-4 h-4" />
              {processing ? 'Saving...' : (isEdit ? 'Update Group' : 'Save Group')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}