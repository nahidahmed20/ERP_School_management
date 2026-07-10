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

    isEdit
      ? put(route('admin.permissions.update', item.id), options)
      : post(route('admin.permissions.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Permission' : 'Add Permission'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">
            <label>
              <span>Permission Name (unique)</span>
              <input
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="e.g. create users"
                autoFocus
              />
              {errors.name && <em>{errors.name}</em>}
            </label>
          </div>

          <div className="mm-modal-foot">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>
              {isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
