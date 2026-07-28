import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, students, onClose }) {
  const isEdit = !!item;
  
  const { data, setData, post, put, processing, errors } = useForm({
    student_id: item?.student_id || '',
    title: item?.title || '',
    type: item?.type || 'Complaint',
    incident_date: item?.incident_date || new Date().toISOString().split('T')[0],
    description: item?.description || '',
    action_taken: item?.action_taken || '',
    reported_by: item?.reported_by || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route('admin.students.discipline.update', item.id));
    } else {
      post(route('admin.students.discipline.store'));
    }
  };

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Record' : 'Add New Record'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mm-form">
          <div className="mm-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            
            <label>
              <span>Select Student *</span>
              <select value={data.student_id} onChange={(e) => setData('student_id', e.target.value)} disabled={isEdit} required>
                <option value="">-- স্টুডেন্ট সিলেক্ট করুন --</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.admission_no} - {s.first_name} {s.last_name || ''}</option>)}
              </select>
              {errors.student_id && <em>{errors.student_id}</em>}
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Record Type *</span>
                <select value={data.type} onChange={(e) => setData('type', e.target.value)} required>
                  <option value="Complaint">Complaint (অভিযোগ)</option>
                  <option value="Warning">Warning (সতর্কতা)</option>
                  <option value="Suspension">Suspension (বহিষ্কার)</option>
                  <option value="Reward">Reward (পুরস্কার)</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label>
                <span>Incident Date *</span>
                <input type="date" value={data.incident_date} onChange={(e) => setData('incident_date', e.target.value)} required />
              </label>
            </div>

            <label>
              <span>Title / Subject *</span>
              <input value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="e.g. Broken school property" required />
              {errors.title && <em>{errors.title}</em>}
            </label>

            <label>
              <span>Description details</span>
              <textarea rows="2" value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="ঘটনার বিস্তারিত বিবরণ..." />
            </label>

            <label>
              <span>Action Taken (যদি থাকে)</span>
              <input value={data.action_taken} onChange={(e) => setData('action_taken', e.target.value)} placeholder="e.g. Called parents" />
            </label>
            
            <label>
              <span>Reported By</span>
              <input value={data.reported_by} onChange={(e) => setData('reported_by', e.target.value)} placeholder="e.g. Mr. Rahim" />
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : 'Save Record'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}