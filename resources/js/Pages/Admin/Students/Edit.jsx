import { useForm, usePage, Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';

export default function Edit({ student, classes, campuses, categories, houses }) {
  const { flash } = usePage().props;

  const { data, setData, post, processing, errors } = useForm({
    _method: 'PUT',
    campus_id: student.campus_id || '',
    category_id: student.category_id || '',
    house_id: student.house_id || '',
    class_id: student.current_enrollment?.class_id || '',
    section_id: student.current_enrollment?.section_id || '',
    roll_no: student.current_enrollment?.roll_no || '',

    first_name: student.first_name || '',
    last_name: student.last_name || '',
    date_of_birth: student.date_of_birth || '',
    birth_certificate_no: student.birth_certificate_no || '',
    national_id: student.national_id || '',
    gender: student.gender || '',
    blood_group: student.blood_group || '',
    religion: student.religion || '',
    mother_tongue: student.mother_tongue || 'Bangla',
    nationality: student.nationality || 'Bangladeshi',
    phone: student.phone || '',
    email: student.email || '',
    medical_history: student.medical_history || '',
    previous_school_details: student.previous_school_details || '',
    present_address: student.present_address || '',
    permanent_address: student.permanent_address || '',

    father_name: student.guardian?.father_name || '',
    father_phone: student.guardian?.father_phone || '',
    mother_name: student.guardian?.mother_name || '',
    mother_phone: student.guardian?.mother_phone || '',
    guardian_email: student.guardian?.guardian_email || '',

    photo: null
  });

  const initialPhoto = student.photo ? `/storage/${student.photo}` : null;
  const [photoPreview, setPhotoPreview] = useState(initialPhoto);

  const selectedClass = classes?.find(c => c.id == data.class_id);
  const availableSections = selectedClass?.sections || [];

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
    post(route('admin.students.update', student.id), { forceFormData: true });
  };

  const customStyles = {
    card: { background: '#fff', borderRadius: '16px', padding: '32px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' },
    sectionTitle: { fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '14px', fontWeight: '600', color: '#475569' },
    input: { width: '100%', padding: '10px 14px', fontSize: '15px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#fff', color: '#334155', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', minHeight: '42px' },
    error: { color: '#ef4444', fontSize: '12px', marginTop: '4px' }
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' ,marginBottom: '0px'}}>
          <div>
            <span className="eyebrow" style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Edit Profile</span>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0 0' }}>{student.admission_no} - {student.first_name}</h1>
          </div>
          <Link href={route('admin.students.index')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Icon name="list" /> View Directory
          </Link>
        </div>
      }
    >
      <Head title={`Edit Student - ${student.first_name}`} />

      <div style={{ maxWidth: '1550px', margin: '0 auto', paddingBottom: '40px' }}>

        <form onSubmit={submit}>

          <div style={customStyles.card}>
            <h3 style={customStyles.sectionTitle}>
              <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '8px', borderRadius: '8px', display: 'flex' }}><Icon name="book" /></div>
              1. Academic Details
            </h3>

            <div style={customStyles.grid}>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Campus <span style={{color: '#ef4444'}}>*</span></label>
                <select style={customStyles.input} value={data.campus_id} onChange={e => setData('campus_id', e.target.value)} required>
                  <option value="">-- Select Campus --</option>
                  {campuses?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.campus_id && <span style={customStyles.error}>{errors.campus_id}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Student Category</label>
                <select style={customStyles.input} value={data.category_id} onChange={e => setData('category_id', e.target.value)}>
                  <option value="">General / Regular</option>
                  {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.category_id && <span style={customStyles.error}>{errors.category_id}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>House (Optional)</label>
                <select style={customStyles.input} value={data.house_id} onChange={e => setData('house_id', e.target.value)}>
                  <option value="">-- Select House --</option>
                  {houses?.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
                {errors.house_id && <span style={customStyles.error}>{errors.house_id}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Class <span style={{color: '#ef4444'}}>*</span></label>
                <select style={customStyles.input} value={data.class_id} onChange={e => setData('class_id', e.target.value)} required>
                  <option value="">-- Select Class --</option>
                  {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.class_id && <span style={customStyles.error}>{errors.class_id}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Section <span style={{color: '#ef4444'}}>*</span></label>
                <select style={customStyles.input} value={data.section_id} onChange={e => setData('section_id', e.target.value)} required disabled={!data.class_id}>
                  <option value="">-- Select Section --</option>
                  {availableSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {errors.section_id && <span style={customStyles.error}>{errors.section_id}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Roll Number</label>
                <input style={customStyles.input} type="text" placeholder="e.g. 101" value={data.roll_no} onChange={e => setData('roll_no', e.target.value)} />
                {errors.roll_no && <span style={customStyles.error}>{errors.roll_no}</span>}
              </div>
            </div>
          </div>

          {/* 2. Personal Information */}
          <div style={customStyles.card}>
            <h3 style={customStyles.sectionTitle}>
              <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '8px', borderRadius: '8px', display: 'flex' }}><Icon name="user" /></div>
              2. Student Personal Information
            </h3>

            {/* Photo Upload Area */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <div style={{
                width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#fff',
                border: '2px dashed #94a3b8', display: 'flex', justifyContent: 'center', alignItems: 'center',
                overflow: 'hidden', position: 'relative', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
              }}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Icon name="camera" style={{ color: '#94a3b8', fontSize: '28px' }} />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                  title="Click to update profile photo"
                />
              </div>
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Student Profile Photo</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                  Click on the placeholder to update the image.<br/>
                  Recommended size: 300x300px. Max size: 2MB.
                </p>
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
                <label style={customStyles.label}>Date of Birth <span style={{color: '#ef4444'}}>*</span></label>
                <input style={customStyles.input} type="date" value={data.date_of_birth} onChange={e => setData('date_of_birth', e.target.value)} required />
                {errors.date_of_birth && <span style={customStyles.error}>{errors.date_of_birth}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Birth Certificate No.</label>
                <input style={customStyles.input} type="text" value={data.birth_certificate_no} onChange={e => setData('birth_certificate_no', e.target.value)} />
                {errors.birth_certificate_no && <span style={customStyles.error}>{errors.birth_certificate_no}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>National ID (If any)</label>
                <input style={customStyles.input} type="text" value={data.national_id} onChange={e => setData('national_id', e.target.value)} />
                {errors.national_id && <span style={customStyles.error}>{errors.national_id}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Gender <span style={{color: '#ef4444'}}>*</span></label>
                <select style={customStyles.input} value={data.gender} onChange={e => setData('gender', e.target.value)} required>
                  <option value="">-- Select Gender --</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <span style={customStyles.error}>{errors.gender}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Blood Group</label>
                <select style={customStyles.input} value={data.blood_group} onChange={e => setData('blood_group', e.target.value)}>
                  <option value="">-- Select Blood Group --</option>
                  <option value="A+">A+</option><option value="O+">O+</option><option value="B+">B+</option><option value="AB+">AB+</option>
                  <option value="A-">A-</option><option value="O-">O-</option><option value="B-">B-</option><option value="AB-">AB-</option>
                </select>
                {errors.blood_group && <span style={customStyles.error}>{errors.blood_group}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Religion</label>
                <input style={customStyles.input} type="text" value={data.religion} onChange={e => setData('religion', e.target.value)} />
                {errors.religion && <span style={customStyles.error}>{errors.religion}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Mother Tongue</label>
                <input style={customStyles.input} type="text" value={data.mother_tongue} onChange={e => setData('mother_tongue', e.target.value)} />
                {errors.mother_tongue && <span style={customStyles.error}>{errors.mother_tongue}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Nationality <span style={{color: '#ef4444'}}>*</span></label>
                <input style={customStyles.input} type="text" value={data.nationality} onChange={e => setData('nationality', e.target.value)} required />
                {errors.nationality && <span style={customStyles.error}>{errors.nationality}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Student's Phone</label>
                <input style={customStyles.input} type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                {errors.phone && <span style={customStyles.error}>{errors.phone}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Student's Email</label>
                <input style={customStyles.input} type="email" value={data.email} onChange={e => setData('email', e.target.value)} />
                {errors.email && <span style={customStyles.error}>{errors.email}</span>}
              </div>

              <div style={{ ...customStyles.formGroup, gridColumn: '1 / -1' }}>
                <label style={customStyles.label}>Previous School Details (Transfer Info)</label>
                <textarea style={{...customStyles.input, resize: 'vertical', minHeight: '60px'}} value={data.previous_school_details} onChange={e => setData('previous_school_details', e.target.value)} />
                {errors.previous_school_details && <span style={customStyles.error}>{errors.previous_school_details}</span>}
              </div>

              <div style={{ ...customStyles.formGroup, gridColumn: '1 / -1' }}>
                <label style={customStyles.label}>Medical History & Allergies (If any)</label>
                <textarea style={{...customStyles.input, resize: 'vertical', minHeight: '60px'}} value={data.medical_history} onChange={e => setData('medical_history', e.target.value)} />
                {errors.medical_history && <span style={customStyles.error}>{errors.medical_history}</span>}
              </div>

              <div style={{ ...customStyles.formGroup, gridColumn: '1 / -1' }}>
                <label style={customStyles.label}>Present Address <span style={{color: '#ef4444'}}>*</span></label>
                <textarea style={{...customStyles.input, resize: 'vertical', minHeight: '80px'}} value={data.present_address} onChange={e => setData('present_address', e.target.value)} required />
                {errors.present_address && <span style={customStyles.error}>{errors.present_address}</span>}
              </div>
              <div style={{ ...customStyles.formGroup, gridColumn: '1 / -1' }}>
                <label style={customStyles.label}>Permanent Address <span style={{color: '#ef4444'}}>*</span></label>
                <textarea style={{...customStyles.input, resize: 'vertical', minHeight: '80px'}} value={data.permanent_address} onChange={e => setData('permanent_address', e.target.value)} required />
                {errors.permanent_address && <span style={customStyles.error}>{errors.permanent_address}</span>}
              </div>
            </div>
          </div>

          {/* 3. Guardian Information */}
          <div style={customStyles.card}>
            <h3 style={customStyles.sectionTitle}>
              <div style={{ background: '#dcfce7', color: '#16a34a', padding: '8px', borderRadius: '8px', display: 'flex' }}><Icon name="users" /></div>
              3. Guardian / Parents Information
            </h3>
            {student.guardian?.students && student.guardian.students.length > 1 && (
              <div style={{ background: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Icon name="warning" style={{ color: '#d97706', fontSize: '20px', marginTop: '2px' }} />
                <div>
                  <strong style={{ display: 'block', color: '#b45309', fontSize: '15px', marginBottom: '4px' }}>
                    লক্ষ্য করুন (Shared Guardian Info)
                  </strong>
                  <span style={{ color: '#92400e', fontSize: '14px', lineHeight: '1.5' }}>
                    এই গার্জিয়ানের আরও <b>{student.guardian.students.length - 1}</b> জন সন্তান এই স্কুলে অধ্যয়নরত আছে। এখান থেকে গার্জিয়ানের কোনো তথ্য (যেমন: মোবাইল নম্বর বা নাম) পরিবর্তন করলে তা অন্য ভাই-বোনদের প্রোফাইলেও অটোমেটিক আপডেট হয়ে যাবে।
                  </span>
                </div>
              </div>
            )}
            <div style={customStyles.grid}>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Father's Name <span style={{color: '#ef4444'}}>*</span></label>
                <input style={customStyles.input} type="text" value={data.father_name} onChange={e => setData('father_name', e.target.value)} required />
                {errors.father_name && <span style={customStyles.error}>{errors.father_name}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Father's Phone <span style={{color: '#ef4444'}}>*</span></label>
                <input style={customStyles.input} type="text" value={data.father_phone} onChange={e => setData('father_phone', e.target.value)} required />
                {errors.father_phone && <span style={customStyles.error}>{errors.father_phone}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Mother's Name <span style={{color: '#ef4444'}}>*</span></label>
                <input style={customStyles.input} type="text" value={data.mother_name} onChange={e => setData('mother_name', e.target.value)} required />
                {errors.mother_name && <span style={customStyles.error}>{errors.mother_name}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Mother's Phone</label>
                <input style={customStyles.input} type="text" value={data.mother_phone} onChange={e => setData('mother_phone', e.target.value)} />
                {errors.mother_phone && <span style={customStyles.error}>{errors.mother_phone}</span>}
              </div>
              <div style={customStyles.formGroup}>
                <label style={customStyles.label}>Guardian Email</label>
                <input style={customStyles.input} type="email" value={data.guardian_email} onChange={e => setData('guardian_email', e.target.value)} />
                {errors.guardian_email && <span style={customStyles.error}>{errors.guardian_email}</span>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', padding: '16px 0' }}>
            <Link href={route('admin.students.index')} style={{ color: '#64748b', fontWeight: '600', textDecoration: 'none' }}>
              Cancel
            </Link>
            <button
              type="submit"
              style={{
                background: '#4f46e5', color: '#fff', padding: '14px 32px', fontSize: '16px', fontWeight: '700',
                border: 'none', borderRadius: '8px', cursor: processing ? 'not-allowed' : 'pointer',
                opacity: processing ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)'
              }}
              disabled={processing}
            >
              {processing ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </AuthenticatedLayout>
  );
}
