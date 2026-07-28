import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function AdmissionFormModal({ classes, onClose }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    class_id: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'male',
    previous_school: '',
    guardian_name: '',
    phone: '',
    email: '',
    address: '',
    application_date: new Date().toISOString().split('T')[0],
  });

  function submit(e) {
    e.preventDefault();
    post(route('admin.students.admissions.store'), {
      onSuccess: () => {
        reset();
        onClose();
      }
    });
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>New Admission Application</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">
            
            <h4 style={{ gridColumn: '1 / -1', borderBottom: '1px solid #eee', paddingBottom: '8px', color: '#475569' }}>Academic Info</h4>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Apply For Class *</span>
              <select value={data.class_id} onChange={(e) => setData('class_id', e.target.value)} required>
                <option value="">-- সিলেক্ট ক্লাস --</option>
                {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.class_id && <em>{errors.class_id}</em>}
            </label>

            <h4 style={{ gridColumn: '1 / -1', borderBottom: '1px solid #eee', paddingBottom: '8px', color: '#475569', marginTop: '10px' }}>Student Info</h4>

            <label>
              <span>First Name *</span>
              <input value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} required />
              {errors.first_name && <em>{errors.first_name}</em>}
            </label>

            <label>
              <span>Last Name</span>
              <input value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} />
            </label>

            <label>
              <span>Date of Birth *</span>
              <input type="date" value={data.date_of_birth} onChange={(e) => setData('date_of_birth', e.target.value)} required />
              {errors.date_of_birth && <em>{errors.date_of_birth}</em>}
            </label>

            <label>
              <span>Gender *</span>
              <select value={data.gender} onChange={(e) => setData('gender', e.target.value)} required>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Previous School (Optional)</span>
              <input value={data.previous_school} onChange={(e) => setData('previous_school', e.target.value)} placeholder="স্টুডেন্ট আগে কোন স্কুলে পড়তো?" />
            </label>

            <h4 style={{ gridColumn: '1 / -1', borderBottom: '1px solid #eee', paddingBottom: '8px', color: '#475569', marginTop: '10px' }}>Guardian Info</h4>

            <label>
              <span>Guardian Name *</span>
              <input value={data.guardian_name} onChange={(e) => setData('guardian_name', e.target.value)} required />
              {errors.guardian_name && <em>{errors.guardian_name}</em>}
            </label>

            <label>
              <span>Phone Number *</span>
              <input value={data.phone} onChange={(e) => setData('phone', e.target.value)} required placeholder="01XXXXXXXXX" />
              {errors.phone && <em>{errors.phone}</em>}
            </label>

            <label>
              <span>Email (Optional)</span>
              <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
            </label>

            <label>
              <span>Application Date *</span>
              <input type="date" value={data.application_date} onChange={(e) => setData('application_date', e.target.value)} required />
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Address</span>
              <textarea rows="2" value={data.address} onChange={(e) => setData('address', e.target.value)} placeholder="বর্তমান ঠিকানা..." />
            </label>

          </div>

          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : 'Submit Application'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}