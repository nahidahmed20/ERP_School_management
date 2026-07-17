import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function LeaveTypeFormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: item?.name ?? '',
    days_allowed: item?.days_allowed ?? 0,
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = {
      onSuccess: () => { reset(); onClose(); },
    };
    if (isEdit) {
      put(route('admin.leave-types.update', item.id), options);
    } else {
      post(route('admin.leave-types.store'), options);
    }
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Leave Type' : 'Add Leave Type'}</h3>
          <button className="icon-btn" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Leave Type Name <span style={{color: 'red'}}>*</span></span>
              <input
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                autoFocus
                required
                placeholder="e.g. Sick Leave, Casual Leave"
              />
              {errors.name && <em>{errors.name}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Days Allowed (Per Year) <span style={{color: 'red'}}>*</span></span>
              <input
                type="number"
                min="0"
                required
                value={data.days_allowed}
                onChange={(e) => setData('days_allowed', e.target.value)}
                placeholder="e.g. 15"
              />
              {errors.days_allowed && <em>{errors.days_allowed}</em>}
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
