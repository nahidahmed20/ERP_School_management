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
    // নতুন ইউজার হলে ডিফল্টভাবে অ্যাক্টিভ ক্যাম্পাস, এডিট হলে তার বর্তমান ক্যাম্পাস
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
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
        <div className="mm-modal-head">
          <h3>{isEditing ? 'Edit User' : 'Create New User'}</h3>
          <button className="icon-btn" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">
            <label>
              <span>Full Name</span>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="e.g. John Doe"
                autoFocus
              />
              {errors.name && <em>{errors.name}</em>}
            </label>

            <label>
              <span>Email Address</span>
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                placeholder="e.g. john@example.com"
              />
              {errors.email && <em>{errors.email}</em>}
            </label>

            {/* --- Campus Selection --- */}
            <label>
              <span>Assign to Campus</span>
              <select 
                value={data.campus_id || ''} 
                onChange={(e) => setData('campus_id', e.target.value)}
                disabled={!isSuperAdmin} // লোকাল এডমিন ক্যাম্পাস চেঞ্জ করতে পারবে না
              >
                <option value="" disabled>Select Campus</option>
                {campuses.map(campus => (
                  <option key={campus.id} value={campus.id}>{campus.name}</option>
                ))}
              </select>
              {errors.campus_id && <em>{errors.campus_id}</em>}
            </label>

            <label>
              <span>Password {isEditing && <small style={{ color: '#6b7280', fontWeight: 'normal' }}>(Leave blank to keep current password)</small>}</span>
              <input
                type="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                placeholder={isEditing ? '••••••••' : 'Enter password'}
              />
              {errors.password && <em>{errors.password}</em>}
            </label>
          </div>

          <div style={{ padding: '0 20px 20px 20px' }}>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontWeight: '600', fontSize: '14px', color: '#374151' }}>Assign Roles</span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '12px',
              border: '1px solid #e5e7eb',
              padding: '16px',
              borderRadius: '6px',
              backgroundColor: '#f9fafb'
            }}>
              {roles.map((role) => {
                if(role.name === 'Super Admin' && !isEditing) return null;

                return (
                  <label key={role.id} className="mm-checkbox" style={{ margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={data.roles.includes(role.name)}
                      onChange={() => toggleRole(role.name)}
                    />
                    <span style={{ paddingLeft: '8px' }}>{role.name}</span>
                  </label>
                )
              })}
            </div>
            {errors.roles && <em style={{ color: 'red', fontSize: '12px', marginTop: '5px', display: 'block' }}>{errors.roles}</em>}
          </div>

          <div className="mm-modal-foot">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={processing}>
              {processing ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}