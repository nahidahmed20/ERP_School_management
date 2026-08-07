import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function AppraisalFormModal({ item, staffList, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, reset, errors } = useForm({
    staff_id: item?.staff_id ?? '',
    appraisal_date: item?.appraisal_date ? item.appraisal_date.split('T')[0] : new Date().toISOString().split('T')[0],
    period: item?.period ?? 'Year 2026',
    rating: item?.rating ?? 5.0,
    remarks: item?.remarks ?? '',
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.staff-appraisals.update', item.id), options);
    else post(route('admin.staff-appraisals.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={e => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Performance Review' : 'New Staff Appraisal'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">
            
            <label style={{ gridColumn: '1 / -1' }}><span>Select Staff Member *</span>
              <select value={data.staff_id} onChange={e => setData('staff_id', e.target.value)} required disabled={isEdit}>
                <option value="">Choose...</option>
                {staffList.map(s => (
                  <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.staff_id_no})</option>
                ))}
              </select>
              {errors.staff_id && <span className="text-red-500 text-xs">{errors.staff_id}</span>}
            </label>

            <label><span>Appraisal Date *</span>
              <input type="date" value={data.appraisal_date} onChange={e => setData('appraisal_date', e.target.value)} required />
              {errors.appraisal_date && <span className="text-red-500 text-xs">{errors.appraisal_date}</span>}
            </label>

            <label><span>Evaluation Period *</span>
              <input type="text" value={data.period} onChange={e => setData('period', e.target.value)} required placeholder="e.g. Q1 2026 or Year 2025-2026" />
              {errors.period && <span className="text-red-500 text-xs">{errors.period}</span>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Performance Rating (1.0 to 5.0) *</span>
              <input 
                type="range" 
                min="1" max="5" step="0.5" 
                value={data.rating} 
                onChange={e => setData('rating', parseFloat(e.target.value))} 
                style={{ width: '100%', accentColor: '#4f46e5' }} 
              />
              <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
                {data.rating} / 5.0
              </div>
            </label>

            <label style={{ gridColumn: '1 / -1' }}><span>Evaluator Remarks / Comments</span>
              <textarea rows="4" value={data.remarks} onChange={e => setData('remarks', e.target.value)} placeholder="Provide detailed feedback on performance..."></textarea>
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>
              <Icon name="star" /> {processing ? 'Saving...' : 'Save Appraisal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}