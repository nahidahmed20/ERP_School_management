import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function TemplateFormModal({ item, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    title: item?.title ?? '',
    template_type: item?.template_type ?? 'Merit',
    content_body: item?.content_body ?? 'For successfully completing the academic semester with outstanding performance.',
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.documents.certificatetemplates.update', item.id), options);
    else post(route('admin.documents.certificatetemplates.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Certificate Template' : 'Create Certificate Template'}</h3>
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
              <span>Template Title *</span>
              <input value={data.title} onChange={e => setData('title', e.target.value)} required placeholder="e.g. Annual Sports Champion" />
              {errors.title && <em>{errors.title}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Template Type *</span>
              <select value={data.template_type} onChange={e => setData('template_type', e.target.value)} required>
                <option value="Merit">Merit / Academic Excellence</option>
                <option value="Course Completion">Course Completion</option>
                <option value="Sports">Sports & Extracurricular</option>
                <option value="Participation">General Participation</option>
              </select>
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Certificate Body Description *</span>
              <textarea rows="4" value={data.content_body} onChange={e => setData('content_body', e.target.value)} required placeholder="Write the main description text..."></textarea>
            </label>

            <label className="mm-checkbox" style={{ gridColumn: '1 / -1' }}>
              <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} /> Active Template
            </label>

          </div>
          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : 'Save Template'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}