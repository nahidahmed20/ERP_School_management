import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function VaccineFormModal({ item, users, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    user_id: item?.user_id ?? '',
    vaccine_name: item?.vaccine_name ?? '',
    dose_number: item?.dose_number ?? '',
    date_administered: item?.date_administered ? item.date_administered.split('T')[0] : new Date().toISOString().split('T')[0],
    next_due_date: item?.next_due_date ? item.next_due_date.split('T')[0] : '',
    remarks: item?.remarks ?? '',
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.medical.vaccinations.update', item.id), options);
    else post(route('admin.medical.vaccinations.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Vaccination Record' : 'Add Vaccination Record'}</h3>
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
              <span>Student / Staff *</span>
              <select value={data.user_id} onChange={e => setData('user_id', e.target.value)} required disabled={isEdit}>
                <option value="" disabled>Select Patient</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              {errors.user_id && <em>{errors.user_id}</em>}
            </label>

            <label>
              <span>Vaccine Name *</span>
              <input type="text" value={data.vaccine_name} onChange={e => setData('vaccine_name', e.target.value)} required placeholder="e.g. Covid-19, Polio" />
            </label>

            <label>
              <span>Dose Number</span>
              <input type="text" value={data.dose_number} onChange={e => setData('dose_number', e.target.value)} placeholder="e.g. 1st Dose, Booster" />
            </label>

            <label>
              <span>Date Administered *</span>
              <input type="date" value={data.date_administered} onChange={e => setData('date_administered', e.target.value)} required />
            </label>

            <label>
              <span>Next Due Date (Optional)</span>
              <input type="date" value={data.next_due_date} onChange={e => setData('next_due_date', e.target.value)} />
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Remarks (Optional)</span>
              <textarea rows="2" value={data.remarks} onChange={e => setData('remarks', e.target.value)}></textarea>
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