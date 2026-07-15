import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function ExamFormModal({ item, activeCampusId, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    name: item?.name || '',
    start_date: item?.start_date ? item.start_date.substring(0, 10) : '',
    end_date: item?.end_date ? item.end_date.substring(0, 10) : '',
    description: item?.description || '',
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };

    if (isEdit) {
      put(route('admin.exams.update', item.id), options);
    } else {
      post(route('admin.exams.store'), options);
    }
  }

  const styles = {
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px', letterSpacing: '0.3px' },
    input: { width: '100%', padding: '10px 14px', fontSize: '14px', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff', outline: 'none', transition: 'border-color 0.2s ease', boxSizing: 'border-box', fontFamily: 'inherit' },
    error: { fontSize: '12px', color: '#ef4444', marginTop: '6px', display: 'block' }
  };

  return (
    <div className="mm-modal-overlay" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px', width: '100%', margin: '0 auto' }}>
        <div className="mm-modal-head" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
            {isEdit ? 'Edit Exam' : 'Add Exam'}
          </h3>
          <button type="button" className="icon-btn" onClick={onClose} style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}>
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={submit} className="mm-form">
          <div style={{ marginBottom: '20px' }}>
            <label style={styles.label}>Exam Name <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              type="text"
              style={styles.input}
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              placeholder="যেমন: Term 1 Examination 2026"
              required
            />
            {errors.name && <em style={styles.error}>{errors.name}</em>}
          </div>

          <div style={{ ...styles.grid, marginBottom: '20px' }}>
            <div>
              <label style={styles.label}>Start Date <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'normal' }}>(Optional)</span></label>
              <input
                type="date"
                style={styles.input}
                value={data.start_date}
                onChange={(e) => setData('start_date', e.target.value)}
              />
              {errors.start_date && <em style={styles.error}>{errors.start_date}</em>}
            </div>

            <div>
              <label style={styles.label}>End Date <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'normal' }}>(Optional)</span></label>
              <input
                type="date"
                style={styles.input}
                value={data.end_date}
                onChange={(e) => setData('end_date', e.target.value)}
              />
              {errors.end_date && <em style={styles.error}>{errors.end_date}</em>}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={styles.label}>Description <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'normal' }}>(Optional)</span></label>
            <textarea
              style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              placeholder="পরীক্ষা সম্পর্কে অতিরিক্ত তথ্য..."
            />
            {errors.description && <em style={styles.error}>{errors.description}</em>}
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#334155', fontWeight: 500, cursor: 'pointer', marginBottom: '10px' }}>
            <input
              type="checkbox"
              checked={data.is_active}
              onChange={(e) => setData('is_active', e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#4f46e5' }}
            />
            Active — এই পরীক্ষাটি Exam Schedule ফর্মে সিলেক্ট করার জন্য দেখানো হবে
          </label>

          <div className="mm-modal-foot" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing} style={{ padding: '8px 16px', borderRadius: '6px' }}>Cancel</button>
            <button type="submit" className="btn" disabled={processing} style={{ padding: '8px 20px', borderRadius: '6px', background: '#4f46e5', color: '#fff', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.7 : 1 }}>
              {processing ? 'Saving...' : (isEdit ? 'Update Exam' : 'Save Exam')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
