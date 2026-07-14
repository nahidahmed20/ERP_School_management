import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function ClassFormModal({ item, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    name: item?.name ?? '',
    numeric_name: item?.numeric_name ?? '',
    description: item?.description ?? '',
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = {
      onSuccess: () => { reset(); onClose(); },
    };
    if (isEdit) {
      put(route('admin.classes.update', item.id), options);
    } else {
      post(route('admin.classes.store'), options);
    }
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Class' : 'Add Class'}</h3>
          <button className="icon-btn" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Assign to Campus</span>
              <select
                value={data.campus_id || ''}
                onChange={(e) => setData('campus_id', e.target.value)}
                disabled={!isSuperAdmin}
              >
                <option value="" disabled>Select Campus</option>
                {campuses?.map(campus => (
                  <option key={campus.id} value={campus.id}>{campus.name}</option>
                ))}
              </select>
              {errors.campus_id && <em>{errors.campus_id}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Class Name</span>
              <input
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                autoFocus
                placeholder="e.g. Class 6, Nursery, Ten"
              />
              {errors.name && <em>{errors.name}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Numeric Name (Optional)</span>
              <input
                type="number"
                value={data.numeric_name}
                onChange={(e) => setData('numeric_name', e.target.value)}
                placeholder="e.g. 6 (Used for sorting)"
              />
              {errors.numeric_name && <em>{errors.numeric_name}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Description</span>
              <textarea
                rows="3"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
              />
            </label>

            <label className="mm-checkbox" style={{ gridColumn: '1 / -1' }}>
              <input
                type="checkbox"
                checked={data.is_active}
                onChange={(e) => setData('is_active', e.target.checked)}
              />
              Active
            </label>

          </div>

          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={processing}>
              {processing ? 'Saving...' : (isEdit ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
