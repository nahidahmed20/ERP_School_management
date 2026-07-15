import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function EventFormModal({ item, classrooms, activeCampusId, onClose }) {
  const isEdit = !!item;

  // ডাটাবেসের ISO datetime কে <input type="datetime-local"> এর ফরম্যাটে রূপান্তর
  function toDatetimeLocal(dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    title: item?.title || '',
    type: item?.type || 'Event',
    start_datetime: toDatetimeLocal(item?.start_datetime),
    end_datetime: toDatetimeLocal(item?.end_datetime),
    classroom_id: item?.classroom_id || '',
    description: item?.description || '',
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };

    if (isEdit) {
      put(route('admin.communication.calendar.update', item.id), options);
    } else {
      post(route('admin.communication.calendar.store'), options);
    }
  }

  // --- একই ডিজাইন সিস্টেম, TimeTableFormModal / ExamScheduleFormModal থেকে ---
  const styles = {
    card: { background: '#f8fafc', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px', letterSpacing: '0.3px' },
    select: { width: '100%', padding: '10px 14px', fontSize: '14px', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer', outline: 'none', transition: 'border-color 0.2s ease', boxSizing: 'border-box' },
    input: { width: '100%', padding: '10px 14px', fontSize: '14px', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff', outline: 'none', transition: 'border-color 0.2s ease', boxSizing: 'border-box', fontFamily: 'inherit' },
    error: { fontSize: '12px', color: '#ef4444', marginTop: '6px', display: 'block' }
  };

  const typeOptions = [
    { value: 'Event', color: '#16a34a' },
    { value: 'Meeting', color: '#2563eb' },
    { value: 'Holiday', color: '#dc2626' },
    { value: 'Other', color: '#64748b' },
  ];

  return (
    <div className="mm-modal-overlay" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', width: '100%', margin: '0 auto' }}>
        <div className="mm-modal-head" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
            {isEdit ? 'Edit Event / Meeting' : 'Add Event / Meeting'}
          </h3>
          <button type="button" className="icon-btn" onClick={onClose} style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}>
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={submit} className="mm-form">
          {/* মূল তথ্য */}
          <div style={styles.card}>
            <div style={{ marginBottom: '20px' }}>
              <label style={styles.label}>Title <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="text"
                style={styles.input}
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                placeholder="যেমন: Parent-Teacher Meeting"
                required
              />
              {errors.title && <em style={styles.error}>{errors.title}</em>}
            </div>

            <div style={styles.grid}>
              <div>
                <label style={styles.label}>Type <span style={{ color: '#ef4444' }}>*</span></label>
                <select
                  style={styles.select}
                  value={data.type}
                  onChange={(e) => setData('type', e.target.value)}
                  required
                >
                  {typeOptions.map(t => <option key={t.value} value={t.value}>{t.value}</option>)}
                </select>
                {errors.type && <em style={styles.error}>{errors.type}</em>}
              </div>

              <div>
                <label style={styles.label}>Room <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'normal' }}>(Optional)</span></label>
                <select
                  style={styles.select}
                  value={data.classroom_id}
                  onChange={(e) => setData('classroom_id', e.target.value)}
                >
                  <option value="">Not Assigned</option>
                  {classrooms.map(r => <option key={r.id} value={r.id}>{r.room_number}</option>)}
                </select>
                {errors.classroom_id && <em style={styles.error}>{errors.classroom_id}</em>}
              </div>
            </div>
          </div>

          {/* সময়সূচী */}
          <div style={styles.card}>
            <div style={styles.grid}>
              <div>
                <label style={styles.label}>Starts At <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="datetime-local"
                  style={styles.input}
                  value={data.start_datetime}
                  onChange={(e) => setData('start_datetime', e.target.value)}
                  required
                />
                {errors.start_datetime && <em style={styles.error}>{errors.start_datetime}</em>}
              </div>

              <div>
                <label style={styles.label}>Ends At <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="datetime-local"
                  style={styles.input}
                  value={data.end_datetime}
                  onChange={(e) => setData('end_datetime', e.target.value)}
                  required
                />
                {errors.end_datetime && <em style={styles.error}>{errors.end_datetime}</em>}
              </div>
            </div>
          </div>

          {/* বিস্তারিত */}
          <div style={{ marginBottom: '20px' }}>
            <label style={styles.label}>Description <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'normal' }}>(Optional)</span></label>
            <textarea
              style={{ ...styles.input, minHeight: '90px', resize: 'vertical' }}
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              placeholder="ইভেন্ট সম্পর্কে অতিরিক্ত তথ্য..."
            />
            {errors.description && <em style={styles.error}>{errors.description}</em>}
          </div>

          {/* একটিভ স্ট্যাটাস */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#334155', fontWeight: 500, cursor: 'pointer', marginBottom: '10px' }}>
            <input
              type="checkbox"
              checked={data.is_active}
              onChange={(e) => setData('is_active', e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#4f46e5' }}
            />
            Active — এই ইভেন্টটি সবার কাছে দৃশ্যমান থাকবে
          </label>

          <div className="mm-modal-foot" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing} style={{ padding: '8px 16px', borderRadius: '6px' }}>Cancel</button>
            <button type="submit" className="btn" disabled={processing} style={{ padding: '8px 20px', borderRadius: '6px', background: '#4f46e5', color: '#fff', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.7 : 1 }}>
              {processing ? 'Saving...' : (isEdit ? 'Update Event' : 'Save Event')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}