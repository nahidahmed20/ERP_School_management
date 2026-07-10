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
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
        <div className="mm-modal-head">
          <h3>{isEditing ? 'Edit Role' : 'Create New Role'}</h3>
          <button className="icon-btn" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid" style={{ paddingBottom: '10px' }}>
            <label style={{ gridColumn: '1 / -1' }}>
              <span>Role Name</span>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="e.g. Editor, Teacher"
                autoFocus
              />
              {errors.name && <em>{errors.name}</em>}
            </label>
          </div>

          <div style={{ padding: '0 20px 20px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: '600', fontSize: '14px', color: '#374151' }}>Assign Permissions</span>
              <button
                type="button"
                onClick={toggleAllPermissions}
                style={{ fontSize: '13px', color: '#2563eb', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                {data.permissions.length === permissions.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Custom Grid for Checkboxes */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '12px',
              maxHeight: '300px',
              overflowY: 'auto',
              border: '1px solid #e5e7eb',
              padding: '16px',
              borderRadius: '6px',
              backgroundColor: '#f9fafb'
            }}>
              {permissions.map((permission) => (
                <label key={permission.id} className="mm-checkbox" style={{ margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={data.permissions.includes(permission.name)}
                    onChange={() => togglePermission(permission.name)}
                  />
                  <span style={{ paddingLeft: '8px' }}>{permission.name}</span>
                </label>
              ))}
            </div>
            {errors.permissions && <em style={{ color: 'red', fontSize: '12px', marginTop: '5px', display: 'block' }}>{errors.permissions}</em>}
          </div>

          <div className="mm-modal-foot">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={processing}>
              {processing ? 'Saving...' : (isEditing ? 'Update Role' : 'Create Role')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
