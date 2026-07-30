import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function RecordFormModal({ item, users, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    user_id: item?.user_id ?? '',
    blood_group: item?.blood_group ?? '',
    height: item?.height ?? '',
    weight: item?.weight ?? '',
    allergies: item?.allergies ?? '',
    chronic_conditions: item?.chronic_conditions ?? '',
    emergency_contact: item?.emergency_contact ?? '',
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.medical.health-records.update', item.id), options);
    else post(route('admin.medical.health-records.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Health Record' : 'Add Health Record'}</h3>
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
              <span>Select Patient *</span>
              <select value={data.user_id} onChange={e => setData('user_id', e.target.value)} required disabled={isEdit}>
                <option value="" disabled>Select User</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              {errors.user_id && <em>{errors.user_id}</em>}
            </label>

            <label>
              <span>Blood Group</span>
              <select value={data.blood_group} onChange={e => setData('blood_group', e.target.value)}>
                <option value="">Select Group</option>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                <option value="O+">O+</option><option value="O-">O-</option>
              </select>
            </label>

            <label>
              <span>Emergency Contact Phone</span>
              <input value={data.emergency_contact} onChange={e => setData('emergency_contact', e.target.value)} />
            </label>

            <label>
              <span>Height (e.g. 5.5 ft)</span>
              <input value={data.height} onChange={e => setData('height', e.target.value)} />
            </label>

            <label>
              <span>Weight (e.g. 50 kg)</span>
              <input value={data.weight} onChange={e => setData('weight', e.target.value)} />
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Known Allergies</span>
              <textarea rows="2" value={data.allergies} onChange={e => setData('allergies', e.target.value)} placeholder="E.g. Peanuts, Dust"></textarea>
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Chronic Conditions (If any)</span>
              <textarea rows="2" value={data.chronic_conditions} onChange={e => setData('chronic_conditions', e.target.value)} placeholder="E.g. Asthma, Diabetes"></textarea>
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