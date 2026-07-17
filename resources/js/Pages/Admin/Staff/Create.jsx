import { useForm, usePage, Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';

export default function Create({ departments, designations, roles }) {
  const { flash } = usePage().props;

  const { data, setData, post, processing, errors } = useForm({
    department_id: '',
    designation_id: '',
    role_name: '', 
    joining_date: new Date().toISOString().split('T')[0],
    basic_salary: '',

    first_name: '',
    last_name: '',
    father_name: '',
    mother_name: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    marital_status: '',

    phone: '',
    emergency_phone: '',
    email: '',
    present_address: '',
    permanent_address: '',

    qualification: '',
    experience: '',

    create_user_account: true,
    photo: null
  });

  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000 });
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 4000 });
  }, [flash]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData('photo', file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const submit = (e) => {
    e.preventDefault();
    post(route('admin.staff.store'), { forceFormData: true });
  };

  const customStyles = {
    card: { background: '#fff', borderRadius: '16px', padding: '32px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' },
    sectionTitle: { fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '14px', fontWeight: '600', color: '#475569' },
    input: { width: '100%', padding: '10px 14px', fontSize: '15px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#fff', color: '#334155', outline: 'none', transition: 'border-color 0.2s', minHeight: '42px' },
    checkboxWrap: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '600', color: '#334155', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' },
    error: { color: '#ef4444', fontSize: '12px', marginTop: '4px' }
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0px'}}>
          <div>
            <span className="eyebrow" style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>HR & Administration</span>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0 0' }}>Register New Staff</h1>
          </div>
          <Link href={route('admin.staff.index')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Icon name="list" /> Staff Directory
          </Link>
        </div>
      }
    >
      <Head title="Add New Staff" />

      <div style={{ maxWidth: '1550px', margin: '0 auto', paddingBottom: '40px' }}>
        <form onSubmit={submit}>

          {/* 1. Employment Details */}
          <div style={customStyles.card}>
            <h3 style={customStyles.sectionTitle}>
              <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '8px', borderRadius: '8px', display: 'flex' }}><Icon name="briefcase" /></div>
              1. Employment Details
            </h3>

            {/* Checkbox and Role Dropdown side by side */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
              <label style={{ ...customStyles.checkboxWrap, height: 'fit-content' }}>
                <input type="checkbox" checked={data.create_user_account} onChange={e => setData('create_user_account', e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#4f46e5' }} />
                Create Login Portal Account for this Staff
              </label>

              {data.create_user_account && (
                <div style={{ ...customStyles.formGroup, minWidth: '250px' }}>
                  <select style={customStyles.input} value={data.role_name} onChange={e => setData('role_name', e.target.value)} required={data.create_user_account}>
                    <option value="">-- Select System Role --</option>
                    {roles?.map(role => <option key={role.id} value={role.name}>{role.name}</option>)}
                  </select>
                  {errors.role_name && <span style={customStyles.error}>{errors.role_name}</span>}
                </div>
              )}
            </div>

            <div style={customStyles.grid}>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Department <span style={{color: '#ef4444'}}>*</span></label>
                <select style={customStyles.input} value={data.department_id} onChange={e => setData('department_id', e.target.value)} required>
                  <option value="">-- Select Department --</option>
                  {departments?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {errors.department_id && <span style={customStyles.error}>{errors.department_id}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Designation <span style={{color: '#ef4444'}}>*</span></label>
                <select style={customStyles.input} value={data.designation_id} onChange={e => setData('designation_id', e.target.value)} required>
                  <option value="">-- Select Designation --</option>
                  {designations?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {errors.designation_id && <span style={customStyles.error}>{errors.designation_id}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Joining Date <span style={{color: '#ef4444'}}>*</span></label>
                <input style={customStyles.input} type="date" value={data.joining_date} onChange={e => setData('joining_date', e.target.value)} required />
                {errors.joining_date && <span style={customStyles.error}>{errors.joining_date}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Basic Salary (Monthly) <span style={{color: '#ef4444'}}>*</span></label>
                <input style={customStyles.input} type="number" step="0.01" min="0" placeholder="e.g. 25000" value={data.basic_salary} onChange={e => setData('basic_salary', e.target.value)} required />
                {errors.basic_salary && <span style={customStyles.error}>{errors.basic_salary}</span>}
              </div>
            </div>
          </div>

          {/* 2. Personal Information */}
          <div style={customStyles.card}>
            <h3 style={customStyles.sectionTitle}>
              <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '8px', borderRadius: '8px', display: 'flex' }}><Icon name="user" /></div>
              2. Personal Information
            </h3>

            {/* Photo Upload */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#fff', border: '2px dashed #94a3b8', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
                {photoPreview ? <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icon name="camera" style={{ color: '#94a3b8', fontSize: '28px' }} />}
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Staff Photo</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Click placeholder to upload. Recommended: 300x300px. Max: 2MB.</p>
                {errors.photo && <span style={customStyles.error}>{errors.photo}</span>}
              </div>
            </div>

            <div style={customStyles.grid}>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>First Name <span style={{color: '#ef4444'}}>*</span></label>
                <input style={customStyles.input} placeholder="e.g. John" type="text" value={data.first_name} onChange={e => setData('first_name', e.target.value)} required />
                {errors.first_name && <span style={customStyles.error}>{errors.first_name}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Last Name</label>
                <input style={customStyles.input} placeholder="e.g. Doe" type="text" value={data.last_name} onChange={e => setData('last_name', e.target.value)} />
                {errors.last_name && <span style={customStyles.error}>{errors.last_name}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Father's Name</label>
                <input style={customStyles.input} type="text" value={data.father_name} onChange={e => setData('father_name', e.target.value)} />
                {errors.father_name && <span style={customStyles.error}>{errors.father_name}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Mother's Name</label>
                <input style={customStyles.input} type="text" value={data.mother_name} onChange={e => setData('mother_name', e.target.value)} />
                {errors.mother_name && <span style={customStyles.error}>{errors.mother_name}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Date of Birth <span style={{color: '#ef4444'}}>*</span></label>
                <input style={customStyles.input} type="date" value={data.date_of_birth} onChange={e => setData('date_of_birth', e.target.value)} required />
                {errors.date_of_birth && <span style={customStyles.error}>{errors.date_of_birth}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Gender <span style={{color: '#ef4444'}}>*</span></label>
                <select style={customStyles.input} value={data.gender} onChange={e => setData('gender', e.target.value)} required>
                  <option value="">-- Select --</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </select>
                {errors.gender && <span style={customStyles.error}>{errors.gender}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Blood Group</label>
                <select style={customStyles.input} value={data.blood_group} onChange={e => setData('blood_group', e.target.value)}>
                  <option value="">-- Select --</option><option value="A+">A+</option><option value="O+">O+</option><option value="B+">B+</option><option value="AB+">AB+</option><option value="A-">A-</option><option value="O-">O-</option><option value="B-">B-</option><option value="AB-">AB-</option>
                </select>
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Marital Status</label>
                <select style={customStyles.input} value={data.marital_status} onChange={e => setData('marital_status', e.target.value)}>
                  <option value="">-- Select --</option><option value="Single">Single</option><option value="Married">Married</option><option value="Divorced">Divorced</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Contact & Academic Details */}
          <div style={customStyles.card}>
            <h3 style={customStyles.sectionTitle}>
              <div style={{ background: '#dcfce7', color: '#16a34a', padding: '8px', borderRadius: '8px', display: 'flex' }}><Icon name="phone" /></div>
              3. Contact & Qualifications
            </h3>
            <div style={customStyles.grid}>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Phone Number <span style={{color: '#ef4444'}}>*</span></label>
                <input style={customStyles.input} type="text" placeholder="01XXXXXXXXX" value={data.phone} onChange={e => setData('phone', e.target.value)} required />
                {errors.phone && <span style={customStyles.error}>{errors.phone}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Emergency Contact</label>
                <input style={customStyles.input} type="text" placeholder="01XXXXXXXXX" value={data.emergency_phone} onChange={e => setData('emergency_phone', e.target.value)} />
                {errors.emergency_phone && <span style={customStyles.error}>{errors.emergency_phone}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Email Address</label>
                <input style={customStyles.input} type="email" placeholder="example@gmail.com" value={data.email} onChange={e => setData('email', e.target.value)} />
                {errors.email && <span style={customStyles.error}>{errors.email}</span>}
              </div>

              <div style={{ ...customStyles.formGroup, gridColumn: '1 / -1' }}>
                <label style={customStyles.label}>Educational Qualifications</label>
                <input style={customStyles.input} type="text" placeholder="e.g. B.Sc in Computer Science, B.Ed" value={data.qualification} onChange={e => setData('qualification', e.target.value)} />
              </div>
              <div style={{ ...customStyles.formGroup, gridColumn: '1 / -1' }}>
                <label style={customStyles.label}>Work Experience</label>
                <input style={customStyles.input} type="text" placeholder="e.g. 5 Years as Math Teacher" value={data.experience} onChange={e => setData('experience', e.target.value)} />
              </div>

              <div style={{ ...customStyles.formGroup, gridColumn: '1 / -1' }}>
                <label style={customStyles.label}>Present Address <span style={{color: '#ef4444'}}>*</span></label>
                <textarea style={{...customStyles.input, minHeight: '60px'}} value={data.present_address} onChange={e => setData('present_address', e.target.value)} required />
                {errors.present_address && <span style={customStyles.error}>{errors.present_address}</span>}
              </div>
              <div style={{ ...customStyles.formGroup, gridColumn: '1 / -1' }}>
                <label style={customStyles.label}>Permanent Address <span style={{color: '#ef4444'}}>*</span></label>
                <textarea style={{...customStyles.input, minHeight: '60px'}} value={data.permanent_address} onChange={e => setData('permanent_address', e.target.value)} required />
                {errors.permanent_address && <span style={customStyles.error}>{errors.permanent_address}</span>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px' }}>
            <Link href={route('admin.staff.index')} style={{ color: '#64748b', fontWeight: '600', textDecoration: 'none' }}>Cancel</Link>
            <button type="submit" style={{ background: '#4f46e5', color: '#fff', padding: '14px 32px', fontSize: '16px', fontWeight: '700', border: 'none', borderRadius: '8px', cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.7 : 1 }} disabled={processing}>
              {processing ? 'Saving...' : 'Save Staff Record'}
            </button>
          </div>

        </form>
      </div>
    </AuthenticatedLayout>
  );
}
