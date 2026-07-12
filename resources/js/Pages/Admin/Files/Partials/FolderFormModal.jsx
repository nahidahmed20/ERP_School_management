import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FolderFormModal({ folders, onClose }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    parent_id: '',
  });

  function submit(e) {
    e.preventDefault();
    post(route('admin.files.folder.store'), {
      onSuccess: () => { reset(); onClose(); },
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>New Folder</h2>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <form onSubmit={submit} className="modal-form">
          <div className="form-row">
            <label>Folder Name</label>
            <input value={data.name} onChange={(e) => setData('name', e.target.value)} />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-row">
            <label>Parent Folder</label>
            <select value={data.parent_id} onChange={(e) => setData('parent_id', e.target.value)}>
              <option value="">Root</option>
              {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}
