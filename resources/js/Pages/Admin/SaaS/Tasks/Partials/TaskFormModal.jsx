import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function TaskFormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, reset, errors } = useForm({
    name: item?.name ?? '',
    command: item?.command ?? '',
    frequency: item?.frequency ?? '0 0 * * *', // Default: Daily at midnight
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.saas.tasks.update', item.id), options);
    else post(route('admin.saas.tasks.store'), options);
  }

  // Quick select helper for cron expressions
  const handleQuickFreq = (e) => {
    setData('frequency', e.target.value);
  };

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={e => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Scheduled Task' : 'Add New Task'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">

            <label style={{ gridColumn: '1 / -1' }}><span>Task Description / Name *</span>
              <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required placeholder="e.g. Send Daily Absent SMS" />
              {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}><span>Artisan Command *</span>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ padding: '9px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRight: 'none', borderRadius: '6px 0 0 6px', color: '#64748b', fontSize: '14px' }}>php artisan</span>
                <input
                  type="text"
                  value={data.command}
                  onChange={e => setData('command', e.target.value)}
                  required
                  placeholder="e.g. sms:send-absent"
                  style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                />
              </div>
              {errors.command && <span className="text-red-500 text-xs">{errors.command}</span>}
            </label>

            <label><span>Quick Frequency</span>
              <select onChange={handleQuickFreq} defaultValue="">
                <option value="" disabled>Select a preset...</option>
                <option value="* * * * *">Every Minute (* * * * *)</option>
                <option value="0 * * * *">Hourly (0 * * * *)</option>
                <option value="0 0 * * *">Daily at Midnight (0 0 * * *)</option>
                <option value="0 0 * * 0">Weekly on Sunday (0 0 * * 0)</option>
                <option value="0 0 1 * *">Monthly on 1st (0 0 1 * *)</option>
              </select>
            </label>

            <label><span>Cron Expression *</span>
              <input type="text" value={data.frequency} onChange={e => setData('frequency', e.target.value)} required placeholder="* * * * *" />
              <span style={{ fontSize: '11px', color: '#64748b' }}>Minute, Hour, Day, Month, Weekday</span>
            </label>

            <label className="mm-checkbox" style={{ gridColumn: '1 / -1' }}>
              <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} /> Enable this task to run on schedule
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>
              <Icon name="clock" /> {processing ? 'Saving...' : (isEdit ? 'Update Task' : 'Save Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
