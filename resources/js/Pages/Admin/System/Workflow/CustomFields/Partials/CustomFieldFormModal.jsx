import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function CustomFieldFormModal({ item, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin';

  const { data, setData, post, put, processing, reset, errors } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    target_model: item?.target_model ?? 'Student',
    field_label: item?.field_label ?? '',
    field_type: item?.field_type ?? 'text',
    options: item?.options ?? '',
    is_required: item?.is_required ?? false,
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.workflow-customfields.update', item.id), options);
    else post(route('admin.workflow-customfields.store'), options);
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>

      {/* Responsive Modal Box */}
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Custom Field' : 'Add Custom Field'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure field properties and assignments.</p>
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
                <label className={labelClass}>Campus (Optional)</label>
                <select
                  value={data.campus_id || ''}
                  onChange={(e) => setData('campus_id', e.target.value)}
                  disabled={!isSuperAdmin}
                  className={`${inputClass} ${!isSuperAdmin ? 'bg-slate-100 opacity-70' : 'bg-white'}`}
                >
                  <option value="">Global / All</option>
                  {campuses?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.campus_id && <p className="text-rose-500 text-xs mt-1">{errors.campus_id}</p>}
              </div>

              <div>
                <label className={labelClass}>Assign Field To <span className="text-rose-500">*</span></label>
                <select value={data.target_model} onChange={e => setData('target_model', e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="Student">Student Profile</option>
                  <option value="Teacher">Teacher Profile</option>
                  <option value="Staff">Staff Profile</option>
                  <option value="Parent">Parent Profile</option>
                </select>
                {errors.target_model && <p className="text-rose-500 text-xs mt-1">{errors.target_model}</p>}
              </div>

              <div>
                <label className={labelClass}>Field Label (Name) <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={data.field_label}
                  onChange={e => setData('field_label', e.target.value)}
                  required
                  placeholder="e.g. Blood Group"
                  className={inputClass}
                  autoFocus
                />
                {errors.field_label && <p className="text-rose-500 text-xs mt-1">{errors.field_label}</p>}
              </div>

              <div>
                <label className={labelClass}>Field Type <span className="text-rose-500">*</span></label>
                <select value={data.field_type} onChange={e => setData('field_type', e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="text">Text (Short Answer)</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="select">Dropdown Select</option>
                  <option value="checkbox">Checkbox</option>
                </select>
                {errors.field_type && <p className="text-rose-500 text-xs mt-1">{errors.field_type}</p>}
              </div>

              <div className="flex items-center sm:pt-6">
                <label className="flex items-center gap-3 cursor-pointer group w-max">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={data.is_required}
                      onChange={e => setData('is_required', e.target.checked)}
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-0 checked:bg-rose-500 checked:border-rose-500 cursor-pointer transition-colors"
                    />
                    <svg className="absolute w-3.5 h-3.5 top-[3px] left-[3px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Make this field mandatory (*)</span>
                </label>
              </div>

              {/* Conditional Rendering for Options */}
              {(data.field_type === 'select' || data.field_type === 'checkbox') && (
                <div className="sm:col-span-2 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 shadow-inner animate-in fade-in duration-300">
                  <label className={labelClass}>Options (Comma separated) <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={data.options}
                    onChange={e => setData('options', e.target.value)}
                    required
                    placeholder="e.g. A+, B+, AB+, O+"
                    className={inputClass}
                  />
                  <span className="text-xs text-indigo-500 font-semibold block mt-1.5 flex items-center gap-1.5">
                    <Icon name="info" className="w-3.5 h-3.5" /> Separate each option with a comma.
                  </span>
                  {errors.options && <p className="text-rose-500 text-xs mt-1">{errors.options}</p>}
                </div>
              )}

              {/* Active Toggle */}
              <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer group w-max">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={data.is_active}
                      onChange={e => setData('is_active', e.target.checked)}
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-0 checked:bg-emerald-600 checked:border-emerald-600 cursor-pointer transition-colors"
                    />
                    <svg className="absolute w-3.5 h-3.5 top-[3px] left-[3px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Active Field</span>
                </label>
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
              {processing ? 'Saving...' : (isEdit ? 'Update Field' : 'Save Field')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
