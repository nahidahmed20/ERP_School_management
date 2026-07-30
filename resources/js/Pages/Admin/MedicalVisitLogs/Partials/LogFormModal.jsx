import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function LogFormModal({ item, rooms, users, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    medical_room_id: item?.medical_room_id ?? '',
    user_id: item?.user_id ?? '',
    visit_time: item?.visit_time ? item.visit_time.slice(0, 16) : new Date().toISOString().slice(0, 16),
    symptoms: item?.symptoms ?? '',
    diagnosis: item?.diagnosis ?? '',
    treatment_given: item?.treatment_given ?? '',
    action_taken: item?.action_taken ?? 'Rest in Room',
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.medical.visit-logs.update', item.id), options);
    else post(route('admin.medical.visit-logs.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Visit Log' : 'Add New Visit Log'}</h3>
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

            <label>
              <span>Patient (Student/Staff) *</span>
              <select value={data.user_id} onChange={e => setData('user_id', e.target.value)} required>
                <option value="" disabled>Select Patient</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              {errors.user_id && <em>{errors.user_id}</em>}
            </label>

            <label>
              <span>Medical Room *</span>
              <select value={data.medical_room_id} onChange={e => setData('medical_room_id', e.target.value)} required>
                <option value="" disabled>Select Room</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.room_number}</option>)}
              </select>
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Visit Time *</span>
              <input type="datetime-local" value={data.visit_time} onChange={e => setData('visit_time', e.target.value)} required />
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Symptoms / Reason for Visit *</span>
              <input type="text" value={data.symptoms} onChange={e => setData('symptoms', e.target.value)} required />
            </label>

            <label>
              <span>Diagnosis (Optional)</span>
              <input type="text" value={data.diagnosis} onChange={e => setData('diagnosis', e.target.value)} />
            </label>

            <label>
              <span>Treatment / Medicine Given</span>
              <input type="text" value={data.treatment_given} onChange={e => setData('treatment_given', e.target.value)} />
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Action Taken *</span>
              <select value={data.action_taken} onChange={e => setData('action_taken', e.target.value)} required>
                <option value="Rest in Room">Rest in Room</option>
                <option value="Sent back to class">Sent back to class</option>
                <option value="Sent Home">Sent Home</option>
                <option value="Sent to Hospital">Sent to Hospital</option>
              </select>
            </label>

          </div>
          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}