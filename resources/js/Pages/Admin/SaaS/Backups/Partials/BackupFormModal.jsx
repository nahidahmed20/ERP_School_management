import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function BackupFormModal({ onClose }) {
  const { data, setData, post, processing, reset } = useForm({
    type: 'Database',
  });

  function submit(e) {
    e.preventDefault();
    post(route('admin.saas.backups.store'), {
      onSuccess: () => { reset(); onClose(); }
    });
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={e => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Generate New Backup</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={submit} className="mm-form">

          <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '13px', color: '#1e3a8a', border: '1px solid #bfdbfe', display: 'flex', gap: '10px' }}>
            <Icon name="info" style={{ width: '20px', height: '20px', flexShrink: 0 }} />
            <div>
              <strong>Note:</strong> Generating a backup might take a few minutes depending on the data size. The process will run in the background.
            </div>
          </div>

          <div className="mm-form-grid">
            <label style={{ gridColumn: '1 / -1' }}><span>Select Backup Type *</span>
              <select value={data.type} onChange={e => setData('type', e.target.value)}>
                <option value="Database">Database Only (Recommended, Fast)</option>
                <option value="Files">Application Files Only</option>
                <option value="Full Backup">Full Backup (Database + Files)</option>
              </select>
              {data.type === 'Full Backup' && (
                <span style={{ fontSize: '12px', color: '#dc2626', display: 'block', marginTop: '5px' }}>
                  Warning: Full backups can take up significant disk space and processing time.
                </span>
              )}
            </label>
          </div>

          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing} style={{ background: '#0f172a' }}>
              <Icon name="database" /> {processing ? 'Starting Process...' : 'Generate Backup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
