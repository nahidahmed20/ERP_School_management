import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function CertificateFormModal({ templates, users, campuses, activeCampusId, onClose }) {
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, processing, errors, reset } = useForm({
    campus_id: activeCampusId,
    certificate_template_id: '',
    user_id: '',
    issue_date: new Date().toISOString().split('T')[0],
  });

  function submit(e) {
    e.preventDefault();
    post(route('admin.documents.certificates.store'), {
      onSuccess: () => { reset(); onClose(); }
    });
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Issue New Certificate</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">
            
            <label style={{ gridColumn: '1 / -1' }}>
              <span>Assign to Campus *</span>
              <select value={data.campus_id || ''} onChange={(e) => setData('campus_id', e.target.value)} disabled={!isSuperAdmin} required>
                <option value="" disabled>Select Campus</option>
                {campuses?.map(campus => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
              </select>
              {errors.campus_id && <em>{errors.campus_id}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Select Template *</span>
              <select value={data.certificate_template_id} onChange={e => setData('certificate_template_id', e.target.value)} required>
                <option value="" disabled>Select Template</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Select Student *</span>
              <select value={data.user_id} onChange={e => setData('user_id', e.target.value)} required>
                <option value="" disabled>Select Student</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Issue Date *</span>
              <input type="date" value={data.issue_date} onChange={e => setData('issue_date', e.target.value)} required />
            </label>

          </div>
          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Issuing...' : 'Issue Certificate'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}