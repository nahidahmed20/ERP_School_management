import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

const CheckMark = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function ExamScheduleFormModal({ editingConfig, exams, classes, classrooms, onClose }) {
  const isEdit = !!editingConfig;

  const initialPeriods = isEdit && editingConfig.periods.length > 0
    ? editingConfig.periods.map(p => ({
        subject_id: p.subject_id, classroom_id: p.classroom_id || '',
        exam_date: p.exam_date, start_time: p.start_time.substring(0, 5), end_time: p.end_time.substring(0, 5)
      }))
    : [{ subject_id: '', classroom_id: '', exam_date: '', start_time: '', end_time: '' }];

  const { data, setData, post, processing, errors, reset } = useForm({
    exam_id: editingConfig?.exam_id || '',
    class_id: editingConfig?.class_id || '',
    section_id: editingConfig?.section_id || '',
    periods: initialPeriods,
  });

  const selectedClass = classes.find(c => c.id == data.class_id);
  const availableSections = selectedClass?.sections || [];
  const availableSubjects = selectedClass?.subjects || [];

  const addPeriod = () => setData('periods', [...data.periods, { subject_id: '', classroom_id: '', exam_date: '', start_time: '', end_time: '' }]);
  const removePeriod = (index) => setData('periods', data.periods.filter((_, i) => i !== index));

  const handlePeriodChange = (index, field, value) => {
    const newPeriods = [...data.periods];
    newPeriods[index][field] = value;
    setData('periods', newPeriods);
  };

  function submit(e) {
    e.preventDefault();
    post(route('admin.exams.schedule.bulk-update'), { onSuccess: () => { reset(); onClose(); } });
  }

  return (
    <div className="exm-overlay" onClick={onClose}>
      <style>{`
        .exm-overlay {
          position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center;
          background: rgba(20, 39, 32, 0.55); backdrop-filter: blur(2px); padding: 20px;
        }
        .exm-scope {
          --exm-ink: #16213A; --exm-ink-soft: #56647B; --exm-forest: #21402F; --exm-forest-dark: #142720;
          --exm-brass: #AD7F35; --exm-brass-soft: #F1E4C8; --exm-mist: #EEF1EA; --exm-paper: #FFFFFF;
          --exm-brick: #A6402C; --exm-brick-soft: #F3DCD5; --exm-line: #DCE2D8; --exm-radius: 16px;
          --exm-font-display: 'Fraunces', Georgia, serif; --exm-font-body: 'Public Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          --exm-font-mono: 'JetBrains Mono', ui-monospace, monospace;
          font-family: var(--exm-font-body); color: var(--exm-ink); background: var(--exm-paper);
          width: 100%; max-width: 960px; max-height: 90vh; border-radius: var(--exm-radius);
          box-shadow: 0 30px 60px -12px rgba(20,39,32,0.35); display: flex; flex-direction: column; overflow: hidden;
        }
        .exm-scope *, .exm-scope *::before, .exm-scope *::after { box-sizing: border-box; }
        @media (prefers-reduced-motion: no-preference) { .exm-scope { animation: exm-pop .28s cubic-bezier(.2,.9,.3,1) both; } }
        @keyframes exm-pop { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: none; } }

        .exm-head { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; padding:24px 28px; border-bottom:1px solid var(--exm-line); flex-shrink:0; }
        .exm-eyebrow { font-family: var(--exm-font-mono); font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color: var(--exm-brass); font-weight:600; display:flex; align-items:center; gap:8px; margin-bottom:6px; }
        .exm-eyebrow::before { content:''; width:16px; height:1px; background: var(--exm-brass); display:inline-block; }
        .exm-title { font-family: var(--exm-font-display); font-size:22px; font-weight:600; color: var(--exm-forest-dark); margin:0; letter-spacing:-0.01em; }
        .exm-close { background: var(--exm-mist); border:1px solid var(--exm-line); border-radius:50%; width:34px; height:34px; cursor:pointer; display:flex; align-items:center; justify-content:center; color: var(--exm-ink-soft); transition: all .15s; flex-shrink:0; }
        .exm-close:hover { border-color: var(--exm-brass); color: var(--exm-forest-dark); }

        .exm-body { padding:24px 28px 8px; overflow-y:auto; flex:1; }

        .exm-settings-card { background: var(--exm-mist); border:1px solid var(--exm-line); border-radius:12px; padding:20px; margin-bottom:26px; }
        .exm-settings-head { display:flex; align-items:center; gap:10px; margin-bottom:18px; }
        .exm-icon-chip { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; background: var(--exm-forest); color:#fff; flex-shrink:0; }
        .exm-settings-label { font-family: var(--exm-font-display); font-size:15px; font-weight:600; color: var(--exm-forest-dark); }
        .exm-grid-3 { display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:18px; }

        .exm-field-label { display:block; font-size:12.5px; font-weight:600; color: var(--exm-ink-soft); margin-bottom:7px; letter-spacing:0.01em; }
        .exm-req { color: var(--exm-brick); margin-left:2px; }

        .exm-input { width:100%; padding:10px 13px; font-size:14px; font-family: var(--exm-font-body); color: var(--exm-ink); border:1.5px solid var(--exm-line); border-radius:8px; background:#fff; outline:none; cursor:pointer; transition: border-color .15s, box-shadow .15s; box-sizing:border-box; }
        .exm-input:focus { border-color: var(--exm-brass); box-shadow: 0 0 0 3px rgba(173,127,53,0.16); }
        .exm-input.mono { font-family: var(--exm-font-mono); cursor:auto; }
        .exm-input:disabled { background: #fff; opacity:.5; cursor:not-allowed; color: var(--exm-ink-soft); }
        .exm-error { font-size:11.5px; color: var(--exm-brick); margin-top:5px; display:block; }

        .exm-list-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
        .exm-list-title { font-family: var(--exm-font-display); font-size:16px; font-weight:600; color: var(--exm-forest-dark); margin:0; }
        .exm-add-btn { font-size:13px; font-weight:600; background: #fff; color: var(--exm-forest-dark); border:1.5px solid var(--exm-line); padding:8px 16px; border-radius:8px; cursor:pointer; display:flex; align-items:center; gap:7px; transition: all .15s; }
        .exm-add-btn:hover { border-color: var(--exm-brass); background: var(--exm-brass-soft); }

        .exm-empty-warning { padding:16px; text-align:center; color: var(--exm-brick); background: var(--exm-brick-soft); border:1px solid #E8C3B7; border-radius:10px; font-size:13.5px; font-weight:500; margin-bottom:16px; }

        .exm-period-row { display:grid; grid-template-columns: 1.7fr 1.2fr 1.3fr 1fr 1fr auto; gap:14px; align-items:end; background:#fff; padding:16px; border:1px solid var(--exm-line); border-radius:10px; margin-bottom:12px; position:relative; transition: border-color .15s, box-shadow .15s; }
        .exm-period-row:hover { border-color: var(--exm-brass); box-shadow: 0 2px 8px -2px rgba(20,39,32,0.08); }
        .exm-period-numeral { position:absolute; top:-9px; left:14px; background: var(--exm-forest); color:#fff; font-family: var(--exm-font-mono); font-size:10.5px; font-weight:600; padding:2px 8px; border-radius:20px; letter-spacing:0.04em; }
        @media (max-width: 820px) { .exm-period-row { grid-template-columns: 1fr 1fr; } }

        .exm-remove-btn { padding:10px; background: var(--exm-brick-soft); color: var(--exm-brick); border:none; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition: background .15s; height:42px; }
        .exm-remove-btn:hover { background:#E8C3B7; }

        .exm-foot { display:flex; justify-content:flex-end; align-items:center; gap:14px; padding:18px 28px; border-top:1px solid var(--exm-line); flex-shrink:0; }
        .exm-cancel { color: var(--exm-ink-soft); font-weight:600; font-size:14px; background:none; border:none; cursor:pointer; padding:10px 6px; }
        .exm-cancel:hover { color: var(--exm-ink); }
        .exm-submit { background: linear-gradient(135deg, var(--exm-forest), var(--exm-forest-dark)); color:#fff; padding:12px 24px; font-size:14.5px; font-weight:700; border:none; border-radius:9px; cursor:pointer; display:flex; align-items:center; gap:9px; box-shadow: 0 6px 16px -4px rgba(20,39,32,0.4); transition: transform .15s; }
        .exm-submit:hover:not(:disabled) { transform: translateY(-1px); }
        .exm-submit:disabled { opacity:.65; cursor:not-allowed; transform:none; }
        .exm-seal { width:18px; height:18px; border-radius:50%; background: var(--exm-brass); display:flex; align-items:center; justify-content:center; flex-shrink:0; color:#fff; }
      `}</style>

      <div className="exm-scope" onClick={(e) => e.stopPropagation()}>

        <div className="exm-head">
          <div>
            <span className="exm-eyebrow">Examination Register</span>
            <h3 className="exm-title">{isEdit ? 'Edit Exam Schedule' : 'Create Exam Schedule'}</h3>
          </div>
          <button type="button" className="exm-close" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="exm-body">

            {/* Global settings (Exam, Class, Section) */}
            <div className="exm-settings-card">
              <div className="exm-settings-head">
                <span className="exm-icon-chip"><Icon name="book" /></span>
                <span className="exm-settings-label">Exam Assignment</span>
              </div>
              <div className="exm-grid-3">

                <div>
                  <label className="exm-field-label">Select Exam <span className="exm-req">*</span></label>
                  <select
                    className="exm-input"
                    value={data.exam_id}
                    onChange={(e) => setData('exam_id', e.target.value)}
                    required
                    disabled={isEdit}
                  >
                    <option value="" disabled>Select</option>
                    {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                  </select>
                  {errors.exam_id && <em className="exm-error">{errors.exam_id}</em>}
                </div>

                <div>
                  <label className="exm-field-label">Class <span className="exm-req">*</span></label>
                  <select
                    className="exm-input"
                    value={data.class_id}
                    onChange={(e) => setData({ ...data, class_id: e.target.value, section_id: '' })}
                    required
                    disabled={isEdit}
                  >
                    <option value="" disabled>Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.class_id && <em className="exm-error">{errors.class_id}</em>}
                </div>

                <div>
                  <label className="exm-field-label">Section <span className="exm-req">*</span></label>
                  <select
                    className="exm-input"
                    value={data.section_id}
                    onChange={(e) => setData('section_id', e.target.value)}
                    required
                    disabled={!data.class_id || isEdit}
                  >
                    <option value="" disabled>Select Section</option>
                    {availableSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  {errors.section_id && <em className="exm-error">{errors.section_id}</em>}
                </div>

              </div>
            </div>

            {/* Dynamic subject/date list */}
            <div className="exm-list-head">
              <h4 className="exm-list-title">Exam Dates &amp; Subjects</h4>
              <button type="button" onClick={addPeriod} className="exm-add-btn">
                <Icon name="plus" style={{ width: '14px' }} /> Add Subject
              </button>
            </div>

            {data.periods.length === 0 && (
              <div className="exm-empty-warning">
                সব সাবজেক্ট ডিলিট করে দেওয়া হয়েছে। Save করলে এই পরীক্ষার শিডিউল ফাঁকা হয়ে যাবে।
              </div>
            )}

            {data.periods.map((period, index) => (
              <div key={index} className="exm-period-row">
                <span className="exm-period-numeral">{String(index + 1).padStart(2, '0')}</span>

                <div>
                  <label className="exm-field-label">Subject</label>
                  <select className="exm-input" value={period.subject_id} onChange={(e) => handlePeriodChange(index, 'subject_id', e.target.value)} required>
                    <option value="" disabled>Select</option>
                    {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="exm-field-label">Date</label>
                  <input className="exm-input mono" type="date" value={period.exam_date} onChange={(e) => handlePeriodChange(index, 'exam_date', e.target.value)} required />
                </div>

                <div>
                  <label className="exm-field-label">Room <span style={{ color: 'var(--exm-ink-soft)', fontSize: '10.5px', fontWeight: 'normal' }}>(Seating)</span></label>
                  <select className="exm-input" value={period.classroom_id} onChange={(e) => handlePeriodChange(index, 'classroom_id', e.target.value)}>
                    <option value="">No Room</option>
                    {classrooms.map(r => <option key={r.id} value={r.id}>{r.room_number}</option>)}
                  </select>
                </div>

                <div>
                  <label className="exm-field-label">Start Time</label>
                  <input className="exm-input mono" type="time" value={period.start_time} onChange={(e) => handlePeriodChange(index, 'start_time', e.target.value)} required />
                </div>

                <div>
                  <label className="exm-field-label">End Time</label>
                  <input className="exm-input mono" type="time" value={period.end_time} onChange={(e) => handlePeriodChange(index, 'end_time', e.target.value)} required />
                </div>

                <button type="button" onClick={() => removePeriod(index)} className="exm-remove-btn" title="Remove Subject">
                  <Icon name="trash" style={{ width: '16px' }} />
                </button>
              </div>
            ))}
          </div>

          <div className="exm-foot">
            <button type="button" className="exm-cancel" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="exm-submit" disabled={processing}>
              <span className="exm-seal"><CheckMark /></span>
              {processing ? 'Saving...' : (isEdit ? 'Update Schedule' : 'Save Schedule')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}