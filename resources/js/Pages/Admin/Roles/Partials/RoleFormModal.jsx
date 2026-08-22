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
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl overflow-hidden transform transition-all flex flex-col ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {isEditing ? 'Edit Role' : 'Create New Role'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {isEditing ? 'Update the role name and adjust permissions.' : 'Define a new role and its permissions.'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-slate-100"
          >
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          
          {/* Role Name Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Role Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              placeholder="e.g. Editor, Teacher, Accountant"
              autoFocus
              className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
            {errors.name && <p className="text-rose-500 text-xs font-medium mt-1">{errors.name}</p>}
          </div>

          {/* Permissions Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-slate-700">Assign Permissions</label>
              <button
                type="button"
                onClick={toggleAllPermissions}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                {data.permissions.length === permissions.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Beautiful Checkbox Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              {permissions.map((permission) => (
                <label 
                  key={permission.id} 
                  className={`flex items-center gap-3 cursor-pointer group p-3 rounded-lg border transition-all ${
                    data.permissions.includes(permission.name) 
                      ? 'bg-indigo-50/50 border-indigo-200' 
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow'
                  }`}
                >
                  <div className="relative flex items-center">
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
                  <span className={`text-sm font-medium transition-colors ${
                    data.permissions.includes(permission.name) ? 'text-indigo-900' : 'text-slate-700 group-hover:text-slate-900'
                  }`}>
                    {permission.name}
                  </span>
                </label>
              ))}
            </div>
            {errors.permissions && <p className="text-rose-500 text-xs font-medium mt-1.5">{errors.permissions}</p>}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={processing}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-all shadow-sm"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            onClick={submit}
            disabled={processing}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
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