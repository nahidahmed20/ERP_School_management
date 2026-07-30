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
      onSuccess: () => {
        reset();
        onClose();
      }
    });
  }

  // সিলেক্ট করা টেমপ্লেটের তথ্য বের করার জন্য
  const selectedTemplate = templates.find(t => t.id == data.certificate_template_id);

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Issue New Certificate</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">

            {/* Campus Selection (Super Admin Only) */}
            <label style={{ gridColumn: '1 / -1' }}>
              <span>Assign to Campus *</span>
              <select
                value={data.campus_id || ''}
                onChange={(e) => setData('campus_id', e.target.value)}
                disabled={!isSuperAdmin}
                required
              >
                <option value="" disabled>Select Campus</option>
                {campuses?.map(campus => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
              </select>
              {errors.campus_id && <em>{errors.campus_id}</em>}
            </label>

            {/* Certificate Template Selection */}
            <label style={{ gridColumn: '1 / -1' }}>
              <span>Select Certificate Template *</span>
              <select
                value={data.certificate_template_id}
                onChange={e => setData('certificate_template_id', e.target.value)}
                required
              >
                <option value="" disabled>Select Template Type</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.template_type})
                  </option>
                ))}
              </select>
              {errors.certificate_template_id && <em>{errors.certificate_template_id}</em>}
            </label>

            {/* Student / User Selection */}
            <label style={{ gridColumn: '1 / -1' }}>
              <span>Select Student *</span>
              <select
                value={data.user_id}
                onChange={e => setData('user_id', e.target.value)}
                required
              >
                <option value="" disabled>Search or Select Student</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
              {errors.user_id && <em>{errors.user_id}</em>}
            </label>

            {/* Issue Date */}
            <label style={{ gridColumn: '1 / -1' }}>
              <span>Issue Date *</span>
              <input
                type="date"
                value={data.issue_date}
                onChange={e => setData('issue_date', e.target.value)}
                required
              />
              {errors.issue_date && <em>{errors.issue_date}</em>}
            </label>

            {/* Live Notice / Info Box */}
            {selectedTemplate && (
              <div style={{
                gridColumn: '1 / -1',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '12px 15px',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#475569'
              }}>
                <strong>Selected Template Note:</strong> {selectedTemplate.content_body.substring(0, 100)}...
              </div>
            )}

          </div>

          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>
              {processing ? 'Generating...' : 'Generate & Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
