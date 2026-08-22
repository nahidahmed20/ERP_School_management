import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function UserFormModal({ item, roles, campuses, activeCampusId, onClose }) {
  const isEditing = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    name: isEditing ? item.name : '',
    email: isEditing ? item.email : '',
    password: '', 
    roles: isEditing ? item.roles.map((r) => r.name) : [],
    campus_id: isEditing ? item.campus_id : activeCampusId, 
  });

  const submit = (e) => {
    e.preventDefault();
    clearErrors();
    const options = {
      onSuccess: () => { reset(); onClose(); },
    };

    if (isEditing) {
      put(route('admin.users.update', item.id), options);
    } else {
      post(route('admin.users.store'), options);
    }
  };

  const toggleRole = (roleName) => {
    if (data.roles.includes(roleName)) {
      setData('roles', data.roles.filter((r) => r !== roleName));
    } else {
      setData('roles', [...data.roles, roleName]);
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
              {isEditing ? 'Edit User Account' : 'Create New User'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {isEditing ? 'Update user details, campus, and roles.' : 'Add a new user and assign them to a campus with specific roles.'}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="e.g. John Doe"
                autoFocus
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
              {errors.name && <p className="text-rose-500 text-xs font-medium mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                placeholder="e.g. john@example.com"
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
              {errors.email && <p className="text-rose-500 text-xs font-medium mt-1">{errors.email}</p>}
            </div>

            {/* Campus Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Assign to Campus <span className="text-rose-500">*</span>
              </label>
              <select
                value={data.campus_id || ''}
                onChange={(e) => setData('campus_id', e.target.value)}
                disabled={!isSuperAdmin}
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="" disabled>Select Campus</option>
                {campuses.map(campus => (
                  <option key={campus.id} value={campus.id}>{campus.name}</option>
                ))}
              </select>
              {errors.campus_id && <p className="text-rose-500 text-xs font-medium mt-1">{errors.campus_id}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex justify-between items-center">
                <span>Password {!isEditing && <span className="text-rose-500">*</span>}</span>
                {isEditing && <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">(Leave blank to keep current)</span>}
              </label>
              <input
                type="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                placeholder={isEditing ? '••••••••' : 'Enter password'}
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
              {errors.password && <p className="text-rose-500 text-xs font-medium mt-1">{errors.password}</p>}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Roles Section */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Assign Roles</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              {roles.map((role) => {
                if (role.name === 'Super Admin' && !isEditing) return null;

                const isChecked = data.roles.includes(role.name);

                return (
                  <label 
                    key={role.id} 
                    className={`flex items-center gap-3 cursor-pointer group p-3 rounded-lg border transition-all ${
                      isChecked 
                        ? 'bg-indigo-50/50 border-indigo-200' 
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow'
                    }`}
                  >
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleRole(role.name)}
                        className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-0 checked:bg-indigo-600 checked:border-indigo-600 cursor-pointer transition-colors"
                      />
                      <svg className="absolute w-3.5 h-3.5 top-[3px] left-[3px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className={`text-sm font-medium transition-colors ${
                      isChecked ? 'text-indigo-900' : 'text-slate-700 group-hover:text-slate-900'
                    }`}>
                      {role.name}
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.roles && <p className="text-rose-500 text-xs font-medium mt-1.5">{errors.roles}</p>}
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
            {processing ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}
          </button>
        </div>
      </div>
    </div>
  );
}