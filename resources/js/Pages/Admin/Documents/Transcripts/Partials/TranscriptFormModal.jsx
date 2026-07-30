import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function TranscriptFormModal({ item, campuses, activeCampusId, onClose }) {
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    title: item?.title ?? '',
    grading_system: item?.grading_system ?? 'GPA 5.0 (A+ to F)',
    header_text: item?.header_text ?? 'Official Record of Student Progress',
    footer_text: item?.footer_text ?? 'This transcript is invalid without the official seal and signature.',
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (item) put(route('admin.documents.transcripts.update', item.id), options);
    else post(route('admin.documents.transcripts.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={e => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{item ? 'Edit Transcript Template' : 'Create Transcript Template'}</h3>
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
              <input value={data.title} onChange={e => setData('title', e.target.value)} required placeholder="e.g. Final Year Marksheet" autoFocus />
              {errors.title && <em>{errors.title}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Grading System *</span>
              <input value={data.grading_system} onChange={e => setData('grading_system', e.target.value)} required placeholder="e.g. GPA 5.0, CGPA 4.0, or Percentage" />
              {errors.grading_system && <em>{errors.grading_system}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Header Text (Subtitle)</span>
              <input value={data.header_text} onChange={e => setData('header_text', e.target.value)} placeholder="Appears right below the main title" />
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Footer / Disclaimer Text</span>
              <textarea rows="3" value={data.footer_text} onChange={e => setData('footer_text', e.target.value)} placeholder="Terms or validation text at the bottom"></textarea>
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
