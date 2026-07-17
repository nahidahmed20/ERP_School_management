import { useForm, usePage, Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';

export default function Edit({ staff, departments, designations, roles, currentRole }) {
  const { flash } = usePage().props;

  // 🛠️ ডিবাগিং টুল: ব্রাউজারের Inspect -> Console-এ গিয়ে দেখতে পারবেন ব্যাকএন্ড কী ডাটা পাঠাচ্ছে
  console.log("Spatie Role from Backend:", currentRole);
  console.log("Available Roles List:", roles);

  // ব্যাকএন্ড থেকে আসা রোলটি অবজেক্ট নাকি স্ট্রিং তা নিরাপদে ডিটেক্ট করার ফাংশন
  const resolveRoleName = (role) => {
    if (!role) return '';
    return typeof role === 'object' ? (role.name || '') : role;
  };

  const { data, setData, post, processing, errors } = useForm({
    _method: 'PUT',
    department_id: staff.department_id || '',
    designation_id: staff.designation_id || '',
    role_name: resolveRoleName(currentRole), // প্রথম লোডেই রোল সেট হবে
    joining_date: staff.joining_date || '',
    basic_salary: staff.basic_salary || '',

    first_name: staff.first_name || '',
    last_name: staff.last_name || '',
    father_name: staff.father_name || '',
    mother_name: staff.mother_name || '',
    date_of_birth: staff.date_of_birth || '',
    gender: staff.gender || '',
    blood_group: staff.blood_group || '',
    marital_status: staff.marital_status || '',

    phone: staff.phone || '',
    emergency_phone: staff.emergency_phone || '',
    email: staff.email || '',
    present_address: staff.present_address || '',
    permanent_address: staff.permanent_address || '',

    qualification: staff.qualification || '',
    experience: staff.experience || '',

    is_active: staff.is_active === 1 || staff.is_active === true,
    photo: null
  });

  const initialPhoto = staff.photo ? `/storage/${staff.photo}` : null;
  const [photoPreview, setPhotoPreview] = useState(initialPhoto);

  // স্টেট পরিবর্তন এবং নোটিফিকেশন হ্যান্ডলার
  useEffect(() => {
    // ১. ফ্ল্যাশ মেসেজ
    if (flash?.error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
    }
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 4000, timerProgressBar: true });
    }

    // ২. রোল ডাইনামিকলি সিঙ্ক করার জন্য
    if (currentRole) {
      setData('role_name', resolveRoleName(currentRole));
    }
  }, [flash, currentRole]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData('photo', file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const submit = (e) => {
    e.preventDefault();
    post(route('admin.staff.update', staff.id), { forceFormData: true });
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
            <span className="eyebrow" style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Edit Profile</span>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0 0' }}>{staff.staff_id_no} - {staff.first_name}</h1>
          </div>
          <Link href={route('admin.staff.index')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Icon name="list" /> Staff Directory
          </Link>
        </div>
      }
    >
      <Head title={`Edit Staff - ${staff.first_name}`} />

      <div style={{ maxWidth: '1550px', margin: '0 auto', paddingBottom: '40px' }}>
        <form onSubmit={submit}>

          {/* 1. Employment Details */}
          <div style={customStyles.card}>
            <h3 style={customStyles.sectionTitle}>
              <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '8px', borderRadius: '8px', display: 'flex' }}><Icon name="briefcase" /></div>
              1. Employment Details
            </h3>

            {staff.user_id && (
              <div style={{ marginBottom: '24px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <div style={{ ...customStyles.formGroup, maxWidth: '300px' }}>
                  <label style={customStyles.label}>System Role (Permission) <span style={{color: '#ef4444'}}>*</span></label>
                  <select style={customStyles.input} value={data.role_name} onChange={e => setData('role_name', e.target.value)} required>
                    <option value="">-- Select System Role --</option>
                    {roles?.map(role => (
                      <option key={role.id} value={role.name}>
                        {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.role_name && <span style={customStyles.error}>{errors.role_name}</span>}
                </div>
              </div>
            )}

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
                <input style={customStyles.input} type="number" step="0.01" min="0" value={data.basic_salary} onChange={e => setData('basic_salary', e.target.value)} required />
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#fff', border: '2px dashed #94a3b8', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
                {photoPreview ? <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icon name="camera" style={{ color: '#94a3b8', fontSize: '28px' }} />}
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} title="Update Photo" />
              </div>
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Update Staff Photo</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Click placeholder to upload new image. Max: 2MB.</p>
                {errors.photo && <span style={customStyles.error}>{errors.photo}</span>}
              </div>
            </div>

            <div style={customStyles.grid}>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>First Name <span style={{color: '#ef4444'}}>*</span></label>
                <input style={customStyles.input} type="text" value={data.first_name} onChange={e => setData('first_name', e.target.value)} required />
                {errors.first_name && <span style={customStyles.error}>{errors.first_name}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Last Name</label>
                <input style={customStyles.input} type="text" value={data.last_name} onChange={e => setData('last_name', e.target.value)} />
                {errors.last_name && <span style={customStyles.error}>{errors.last_name}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Father's Name</label>
                <input style={customStyles.input} type="text" value={data.father_name} onChange={e => setData('father_name', e.target.value)} />
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Mother's Name</label>
                <input style={customStyles.input} type="text" value={data.mother_name} onChange={e => setData('mother_name', e.target.value)} />
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Date of Birth <span style={{color: '#ef4444'}}>*</span></label>
                <input style={customStyles.input} type="date" value={data.date_of_birth} onChange={e => setData('date_of_birth', e.target.value)} required />
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Gender <span style={{color: '#ef4444'}}>*</span></label>
                <select style={customStyles.input} value={data.gender} onChange={e => setData('gender', e.target.value)} required>
                  <option value="">-- Select --</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </select>
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

          {/* 3. Contact & Qualifications */}
          <div style={customStyles.card}>
            <h3 style={customStyles.sectionTitle}>
              <div style={{ background: '#dcfce7', color: '#16a34a', padding: '8px', borderRadius: '8px', display: 'flex' }}><Icon name="phone" /></div>
              3. Contact & Qualifications
            </h3>
            <div style={customStyles.grid}>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Phone Number <span style={{color: '#ef4444'}}>*</span></label>
                <input style={customStyles.input} type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} required />
                {errors.phone && <span style={customStyles.error}>{errors.phone}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Emergency Contact</label>
                <input style={customStyles.input} type="text" value={data.emergency_phone} onChange={e => setData('emergency_phone', e.target.value)} />
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Email Address</label>
                <input style={customStyles.input} type="email" value={data.email} onChange={e => setData('email', e.target.value)} />
                {errors.email && <span style={customStyles.error}>{errors.email}</span>}
              </div>

              <div style={{ ...customStyles.formGroup, gridColumn: '1 / -1' }}>
                <label style={customStyles.label}>Educational Qualifications</label>
                <input style={customStyles.input} type="text" value={data.qualification} onChange={e => setData('qualification', e.target.value)} />
              </div>
              <div style={{ ...customStyles.formGroup, gridColumn: '1 / -1' }}>
                <label style={customStyles.label}>Work Experience</label>
                <input style={customStyles.input} type="text" value={data.experience} onChange={e => setData('experience', e.target.value)} />
              </div>

              <div style={{ ...customStyles.formGroup, gridColumn: '1 / -1' }}>
                <label style={customStyles.label}>Present Address <span style={{color: '#ef4444'}}>*</span></label>
                <textarea style={{...customStyles.input, minHeight: '60px'}} value={data.present_address} onChange={e => setData('present_address', e.target.value)} required />
              </div>
              <div style={{ ...customStyles.formGroup, gridColumn: '1 / -1' }}>
                <label style={customStyles.label}>Permanent Address <span style={{color: '#ef4444'}}>*</span></label>
                <textarea style={{...customStyles.input, minHeight: '60px'}} value={data.permanent_address} onChange={e => setData('permanent_address', e.target.value)} required />
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <label style={customStyles.checkboxWrap}>
                <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#4f46e5' }} />
                Account is Active (Current Employee)
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px' }}>
            <Link href={route('admin.staff.index')} style={{ color: '#64748b', fontWeight: '600', textDecoration: 'none' }}>Cancel</Link>
            <button type="submit" style={{ background: '#4f46e5', color: '#fff', padding: '14px 32px', fontSize: '16px', fontWeight: '700', border: 'none', borderRadius: '8px', cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.7 : 1 }} disabled={processing}>
              {processing ? 'Saving Changes...' : 'Update Record'}
            </button>
          </div>

        </form>
      </div>
    </AuthenticatedLayout>
  );
}
