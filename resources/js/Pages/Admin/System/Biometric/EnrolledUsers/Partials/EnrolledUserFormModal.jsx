import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function EnrolledUserFormModal({ item, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin';

  const { data, setData, post, put, processing, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    user_type: item?.user_type ?? 'Student',
    user_id: item?.user_id ?? '',
    user_name: item?.user_name ?? '',
    biometric_id: item?.biometric_id ?? '',
    rfid_card_no: item?.rfid_card_no ?? '',
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.biometric-enrolledusers.update', item.id), options);
    else post(route('admin.biometric-enrolledusers.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={e => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Enrollment' : 'Enroll User to Machine'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">

            <label style={{ gridColumn: '1 / -1' }}><span>Campus Assignment</span>
              <select value={data.campus_id || ''} onChange={(e) => setData('campus_id', e.target.value)} disabled={!isSuperAdmin}>
                <option value="">Global / System</option>
                {campuses?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>

            <label><span>User Type *</span>
              <select value={data.user_type} onChange={e => setData('user_type', e.target.value)}>
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
                <option value="Staff">Staff</option>
              </select>
            </label>

            <label><span>System User ID *</span>
              <input type="number" value={data.user_id} onChange={e => setData('user_id', e.target.value)} required placeholder="e.g. 2501" />
            </label>

            <label style={{ gridColumn: '1 / -1' }}><span>Full Name *</span>
              <input type="text" value={data.user_name} onChange={e => setData('user_name', e.target.value)} required placeholder="e.g. John Doe" />
            </label>

            <label><span>Machine / Biometric ID *</span>
              <input type="text" value={data.biometric_id} onChange={e => setData('biometric_id', e.target.value)} required placeholder="e.g. 105" />
            </label>

            <label><span>RFID Card No. (Optional)</span>
              <input type="text" value={data.rfid_card_no} onChange={e => setData('rfid_card_no', e.target.value)} placeholder="e.g. 0001234567" />
            </label>

            <label className="mm-checkbox" style={{ gridColumn: '1 / -1' }}>
              <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} /> Active Syncing
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>
              <Icon name="save" /> {processing ? 'Saving...' : (isEdit ? 'Update Enrollment' : 'Enroll User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
