import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function RoleFormModal({ item, permissions, onClose }) {
  const isEditing = !!item;

  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    name: isEditing ? item.name : '',
    permissions: isEditing ? item.permissions.map((p) => p.name) : [],
  });

  const submit = (e) => {
    e.preventDefault();
    clearErrors();
    const options = {
      onSuccess: () => { reset(); onClose(); },
    };

    if (isEditing) {
      put(route('admin.roles.update', item.id), options);
    } else {
      post(route('admin.roles.store'), options);
    }
  };

  const togglePermission = (permissionName) => {
    if (data.permissions.includes(permissionName)) {
      setData('permissions', data.permissions.filter((p) => p !== permissionName));
    } else {
      setData('permissions', [...data.permissions, permissionName]);
    }
  };

  const toggleAllPermissions = () => {
    if (data.permissions.length === permissions.length) {
      setData('permissions', []);
    } else {
      setData('permissions', permissions.map((p) => p.name));
    }
  };

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm transition-opacity animate-in fade-in duration-200 sm:items-center sm:p-6" onClick={onClose}>
      
      {/* Responsive Modal Box */}
      <div 
        className="flex max-h-[100dvh] w-full max-w-4xl flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-slate-900/5 transition-all animate-in zoom-in-95 duration-200 sm:max-h-[90vh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-4 sm:items-center sm:rounded-t-2xl sm:px-6 sm:py-5">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
              {isEditing ? 'Edit Role' : 'Create New Role'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {isEditing ? 'Update the role name and adjust permissions.' : 'Define a new role and its permissions.'}
            </p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors hover:bg-slate-200 hover:text-slate-600">
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto bg-white p-4 sm:space-y-6 sm:p-6">
          
          {/* Role Name Input */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-5">
            <label className="mb-2 block text-sm font-bold text-slate-800">
              Role Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              placeholder="e.g. Editor, Teacher, Accountant"
              autoFocus
              className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm placeholder-slate-400 shadow-inner outline-none transition-all focus:ring-2 focus:ring-indigo-500 sm:w-1/2"
            />
            {errors.name && <p className="text-rose-500 text-xs font-medium mt-1.5">{errors.name}</p>}
          </div>

          {/* Permissions Section */}
          <div>
            <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h4 className="text-lg font-bold text-slate-900">Assign Permissions</h4>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Select modules and actions this role can perform.</p>
              </div>
              <button
                type="button"
                onClick={toggleAllPermissions}
                className={`flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold shadow-sm transition-all sm:w-auto ${
                  data.permissions.length === permissions.length 
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100' 
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                }`}
              >
                <Icon name={data.permissions.length === permissions.length ? "x-circle" : "check-circle"} className="w-3.5 h-3.5" />
                {data.permissions.length === permissions.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Beautiful Checkbox Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {permissions.map((permission) => (
                <label 
                  key={permission.id} 
                  className={`flex items-start gap-3 cursor-pointer group p-3.5 rounded-xl border transition-all ${
                    data.permissions.includes(permission.name) 
                      ? 'bg-indigo-50 border-indigo-300 shadow-sm ring-1 ring-indigo-100' 
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  <div className="relative flex items-center mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      checked={data.permissions.includes(permission.name)}
                      onChange={() => togglePermission(permission.name)}
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-0 checked:bg-indigo-600 checked:border-indigo-600 cursor-pointer transition-colors"
                    />
                    <svg className="absolute w-3.5 h-3.5 top-[3px] left-[3px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className={`min-w-0 break-words text-sm font-semibold leading-tight transition-colors ${
                    data.permissions.includes(permission.name) ? 'text-indigo-900' : 'text-slate-700 group-hover:text-slate-900'
                  }`}>
                    {permission.name}
                  </span>
                </label>
              ))}
            </div>
            {errors.permissions && <p className="text-rose-500 text-xs font-bold mt-2 bg-rose-50 p-2 rounded-lg border border-rose-100">{errors.permissions}</p>}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:rounded-b-2xl sm:px-6">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={processing}
            className="w-full rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-800 sm:w-auto"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            onClick={submit}
            disabled={processing}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all active:scale-95 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {processing && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {processing ? 'Saving...' : (isEditing ? 'Update Role' : 'Create Role')}
          </button>
        </div>
      </div>
    </div>
  );
}
