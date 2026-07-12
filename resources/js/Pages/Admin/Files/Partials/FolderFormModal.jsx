import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FolderFormModal({ folders, onClose }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    parent_id: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('admin.files.folder.store'), {
      onSuccess: () => { reset(); onClose(); },
    });
  };

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-sm" onClick={(e) => e.stopPropagation()}>

        <div className="mm-modal-head">
          <h3>Create New Folder</h3>
          <button className="icon-btn" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Folder Name</span>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="e.g. Documents"
                autoFocus
              />
              {errors.name && <em>{errors.name}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Parent Folder</span>
              <select
                value={data.parent_id}
                onChange={(e) => setData('parent_id', e.target.value)}
              >
                <option value="">Root</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              {errors.parent_id && <em>{errors.parent_id}</em>}
            </label>

          </div>

          <div className="mm-modal-foot">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={processing}>
              {processing ? 'Creating...' : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
