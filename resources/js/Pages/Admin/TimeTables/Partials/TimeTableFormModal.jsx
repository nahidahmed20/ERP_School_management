import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function TimeTableFormModal({ editingConfig, classes, classrooms, campuses, activeCampusId, onClose }) {
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');
  const isEdit = editingConfig?.isEdit;

  const initialPeriods = isEdit && editingConfig.periods.length > 0
    ? editingConfig.periods.map(p => ({
        subject_id: p.subject_id,
        classroom_id: p.classroom_id || '',
        start_time: p.start_time.substring(0, 5),
        end_time: p.end_time.substring(0, 5)
      }))
    : [{ subject_id: '', classroom_id: '', start_time: '', end_time: '' }];

  const { data, setData, post, processing, errors, reset } = useForm({
    campus_id: activeCampusId,
    class_id: editingConfig?.class_id || '',
    section_id: editingConfig?.section_id || '',
    day_of_week: editingConfig?.day_of_week || 'Sunday',
    periods: initialPeriods,
  });

  const selectedClass = classes.find(c => c.id == data.class_id);
  const availableSections = selectedClass?.sections || [];
  const availableSubjects = selectedClass?.subjects || [];

  const addPeriod = () => setData('periods', [...data.periods, { subject_id: '', classroom_id: '', start_time: '', end_time: '' }]);
  const removePeriod = (index) => setData('periods', data.periods.filter((_, i) => i !== index));

  const handlePeriodChange = (index, field, value) => {
    const newPeriods = [...data.periods];
    newPeriods[index][field] = value;
    setData('periods', newPeriods);
  };

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };

    // নতুন Bulk Update রাউটে ডাটা পাঠানো হচ্ছে
    if (isEdit) {
      post(route('admin.time-tables.bulk-update'), options);
    } else {
      post(route('admin.time-tables.store'), options);
    }
  }

  // --- উন্নত ডিজাইনের জন্য ইনলাইন স্টাইল অবজেক্ট ---
  const styles = {
    card: { background: '#f8fafc', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px', letterSpacing: '0.3px' },
    select: { width: '100%', padding: '10px 14px', fontSize: '14px', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer', outline: 'none', transition: 'border-color 0.2s ease', boxSizing: 'border-box' },
    selectDisabled: { backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#94a3b8', borderColor: '#e2e8f0' },
    error: { fontSize: '12px', color: '#ef4444', marginTop: '6px', display: 'block' }
  };

  return (
    <div className="mm-modal-overlay" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px', width: '100%', margin: '0 auto' }}>
        <div className="mm-modal-head" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
            {isEdit ? `Edit Routine: ${data.day_of_week}` : 'Bulk Add Routine'}
          </h3>
          <button type="button" className="icon-btn" onClick={onClose} style={{ cursor: 'pointer', border: 'none', background: 'transparent' }}>
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={submit} className="mm-form">
          {/* গ্লোবাল সেটিংস (Class, Section, Day) */}
          <div style={styles.card}>
            <div style={styles.grid}>

              <div>
                <label style={styles.label}>Class <span style={{ color: '#ef4444' }}>*</span></label>
                <select
                  style={{ ...styles.select, ...(isEdit ? styles.selectDisabled : {}) }}
                  value={data.class_id}
                  onChange={(e) => setData({ ...data, class_id: e.target.value, section_id: '' })}
                  required
                  disabled={isEdit}
                >
                  <option value="" disabled>Select Class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.class_id && <em style={styles.error}>{errors.class_id}</em>}
              </div>

              <div>
                <label style={styles.label}>Section <span style={{ color: '#ef4444' }}>*</span></label>
                <select
                  style={{ ...styles.select, ...((!data.class_id || isEdit) ? styles.selectDisabled : {}) }}
                  value={data.section_id}
                  onChange={(e) => setData('section_id', e.target.value)}
                  required
                  disabled={!data.class_id || isEdit}
                >
                  <option value="" disabled>Select Section</option>
                  {availableSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {errors.section_id && <em style={styles.error}>{errors.section_id}</em>}
              </div>

              <div>
                <label style={styles.label}>Day of the Week <span style={{ color: '#ef4444' }}>*</span></label>
                <select
                  style={{ ...styles.select, ...(isEdit ? styles.selectDisabled : {}) }}
                  value={data.day_of_week}
                  onChange={(e) => setData('day_of_week', e.target.value)}
                  required
                  disabled={isEdit}
                >
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* ডাইনামিক পিরিয়ড লিস্ট */}
          <div style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#334155' }}>Class Periods</h4>
              <button type="button" onClick={addPeriod} style={{ fontSize: '13px', fontWeight: '500', background: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.2s' }}>
                <Icon name="plus" style={{ width: '14px' }} /> Add Period
              </button>
            </div>

            {/* সব পিরিয়ড ডিলিট ওয়ার্নিং মেসেজ */}
            {data.periods.length === 0 && (
              <div style={{ padding: '16px', textAlign: 'center', color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '14px', fontWeight: '500', marginBottom: '15px' }}>
                সব পিরিয়ড ডিলিট করে দেওয়া হয়েছে। Save করলে এই দিনের রুটিন ফাঁকা হয়ে যাবে।
              </div>
            )}

            {/* পিরিয়ড কার্ডস */}
            {data.periods.map((period, index) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1.5fr auto', gap: '15px', alignItems: 'end', background: '#fff', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>

                <div>
                  <label style={styles.label}>Subject</label>
                  <select style={{ ...styles.select, padding: '8px 12px', fontSize: '13px' }} value={period.subject_id} onChange={(e) => handlePeriodChange(index, 'subject_id', e.target.value)} required>
                    <option value="" disabled>Select</option>
                    {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label style={styles.label}>Room <span style={{color: '#94a3b8', fontSize: '11px', fontWeight: 'normal'}}>(Optional)</span></label>
                  <select style={{ ...styles.select, padding: '8px 12px', fontSize: '13px' }} value={period.classroom_id} onChange={(e) => handlePeriodChange(index, 'classroom_id', e.target.value)}>
                    <option value="">No Room</option>
                    {classrooms.map(r => <option key={r.id} value={r.id}>{r.room_number}</option>)}
                  </select>
                </div>

                <div>
                  <label style={styles.label}>Start Time</label>
                  <input style={{ ...styles.select, padding: '8px 12px', fontSize: '13px' }} type="time" value={period.start_time} onChange={(e) => handlePeriodChange(index, 'start_time', e.target.value)} required />
                </div>

                <div>
                  <label style={styles.label}>End Time</label>
                  <input style={{ ...styles.select, padding: '8px 12px', fontSize: '13px' }} type="time" value={period.end_time} onChange={(e) => handlePeriodChange(index, 'end_time', e.target.value)} required />
                </div>

                <button type="button" onClick={() => removePeriod(index)} style={{ padding: '9px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Remove Period">
                  <Icon name="trash" style={{ width: '16px' }} />
                </button>
              </div>
            ))}
          </div>

          <div className="mm-modal-foot" style={{ marginTop: '25px', paddingTop: '15px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing} style={{ padding: '8px 16px', borderRadius: '6px' }}>Cancel</button>
            <button type="submit" className="btn" disabled={processing} style={{ padding: '8px 20px', borderRadius: '6px', background: '#4f46e5', color: '#fff', border: 'none', cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.7 : 1 }}>
              {processing ? 'Saving...' : (isEdit ? 'Update Day Routine' : 'Save Routine')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
