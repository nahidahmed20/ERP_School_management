import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function UploadFormModal({ folders, onClose }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    file: null,
    folder_id: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('admin.files'), {
      forceFormData: true,
      onSuccess: () => { reset(); onClose(); },
    });
  };

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-sm" onClick={(e) => e.stopPropagation()}>

        {/* UserFormModal এর মতো হেডার */}
        <div className="mm-modal-head">
          <h3>Upload File</h3>
          <button className="icon-btn" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        {/* mm-form এবং mm-form-grid স্ট্রাকচার */}
        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">

            <label style={{ gridColumn: '1 / -1' }}>
              <span>File</span>
              <input
                type="file"
                onChange={(e) => setData('file', e.target.files[0])}
              />
              {errors.file && <em>{errors.file}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Folder</span>
              <select
                value={data.folder_id}
                onChange={(e) => setData('folder_id', e.target.value)}
              >
                <option value="">No Folder (Root)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              {errors.folder_id && <em>{errors.folder_id}</em>}
            </label>

          </div>

          <div className="mm-modal-foot">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={processing}>
              {processing ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
