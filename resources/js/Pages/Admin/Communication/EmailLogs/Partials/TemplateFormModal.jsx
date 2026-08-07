import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function TemplateFormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, reset, errors } = useForm({
    name: item?.name ?? '',
    subject: item?.subject ?? '',
    body: item?.body ?? '',
    variables: item?.variables ?? '{student_name}, {date}, {amount}',
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.email-templates.update', item.id), options);
    else post(route('admin.email-templates.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Template' : 'Create Email Template'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">
            
            <label style={{ gridColumn: '1 / -1' }}><span>Template Name *</span>
              <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required placeholder="e.g. Fee Reminder Template" />
              {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}><span>Email Subject Line *</span>
              <input type="text" value={data.subject} onChange={e => setData('subject', e.target.value)} required placeholder="e.g. Urgent: Fee Due for {student_name}" />
            </label>

            <label style={{ gridColumn: '1 / -1' }}><span>Available Variables (Comma separated)</span>
              <input type="text" value={data.variables} onChange={e => setData('variables', e.target.value)} placeholder="{name}, {date}" />
              <span style={{ fontSize: '11px', color: '#64748b' }}>Define what dynamic tags can be used in this template.</span>
            </label>

            <label style={{ gridColumn: '1 / -1' }}><span>Email Body (HTML allowed) *</span>
              <textarea 
                rows="8" 
                value={data.body} 
                onChange={e => setData('body', e.target.value)} 
                required 
                placeholder="Dear {student_name},&#10;&#10;Your fee of {amount} is due..."
                style={{ fontFamily: 'monospace' }}
              ></textarea>
            </label>

            <label className="mm-checkbox" style={{ gridColumn: '1 / -1' }}>
              <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} /> Active Template
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing} style={{ background: '#4f46e5' }}>
              <Icon name="save" /> {processing ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}