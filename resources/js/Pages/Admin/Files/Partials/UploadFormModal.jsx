import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function UploadFormModal({ folders, onClose }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    file: null,
    folder_id: '',
  });

  function submit(e) {
    e.preventDefault();
    post(route('admin.files'), {
      forceFormData: true,
      onSuccess: () => { reset(); onClose(); },
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Upload File</h2>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <form onSubmit={submit} className="modal-form">
          <div className="form-row">
            <label>File</label>
            <input type="file" onChange={(e) => setData('file', e.target.files[0])} />
            {errors.file && <span className="field-error">{errors.file}</span>}
          </div>

          <div className="form-row">
            <label>Folder</label>
            <select value={data.folder_id} onChange={(e) => setData('folder_id', e.target.value)}>
              <option value="">No Folder</option>
              {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>Upload</button>
          </div>
        </form>
      </div>
    </div>
  );
}
