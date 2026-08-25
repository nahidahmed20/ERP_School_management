import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function PermissionFormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: item?.name ?? '',
  });

  function submit(e) {
    e.preventDefault();
    const options = {
      onSuccess: () => { reset(); onClose(); },
    };

    if (isEdit) {
      put(route('admin.permissions.update', item.id), options);
    } else {
      post(route('admin.permissions.store'), options);
    }
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    // Responsive Overlay
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Responsive Modal Box */}
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all flex flex-col ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {isEdit ? 'Edit Permission' : 'Create Permission'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {isEdit ? 'Update the selected permission name.' : 'Define a new permission for the system.'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0"
          >
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 bg-white space-y-4">
            <div>
              <label className={labelClass}>
                Permission Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="e.g. create users, edit posts"
                autoFocus
                className={inputClass}
              />
              {errors.name && <p className="text-rose-500 text-xs font-medium mt-1.5">{errors.name}</p>}
              
              <div className="flex items-start gap-1.5 mt-3 bg-blue-50/80 border border-blue-200 p-3 rounded-xl shadow-sm">
                <Icon name="info" className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-blue-700 leading-relaxed">
                  Name must be unique. Convention: lowercase, space separated.
                </p>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={processing}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-all shadow-sm"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={processing}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
            >
              {processing && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {processing ? 'Saving...' : (isEdit ? 'Update Permission' : 'Create Permission')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}