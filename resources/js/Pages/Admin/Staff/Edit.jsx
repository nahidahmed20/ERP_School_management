import { useForm, usePage, Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';
import { useEffect, useMemo, useRef, useState } from 'react';

const CheckMark = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function Edit({ staff, departments, designations, roles, currentRole }) {
  const { flash } = usePage().props;

  // 🛠️ ডিবাগিং টুল: ব্রাউজারের Inspect -> Console-এ গিয়ে দেখতে পারবেন ব্যাকএন্ড কী ডাটা পাঠাচ্ছে
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

  // --- Registry index rail: tracks real completion state per section, not decoration ---
  const employmentComplete = !!(data.department_id && data.designation_id && data.joining_date && data.basic_salary);
  const personalComplete = !!(data.first_name && data.date_of_birth && data.gender);
  const contactComplete = !!(data.phone && data.present_address && data.permanent_address);

  const sections = useMemo(() => ([
    { id: 'section-employment', numeral: 'I', label: 'Employment', complete: employmentComplete },
    { id: 'section-personal', numeral: 'II', label: 'Personal', complete: personalComplete },
    { id: 'section-contact', numeral: 'III', label: 'Contact', complete: contactComplete },
  ]), [employmentComplete, personalComplete, contactComplete]);

  const [activeSection, setActiveSection] = useState('section-employment');
  const sectionRefs = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const formattedJoiningDate = data.joining_date
    ? new Date(data.joining_date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '24px', flexWrap: 'wrap', marginBottom: '0px', fontFamily: "'Public Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>
          <div>
            <span style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#AD7F35', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '18px', height: '1px', background: '#AD7F35', display: 'inline-block' }} /> Personnel Register
            </span>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '30px', fontWeight: 600, color: '#142720', margin: '8px 0 0', letterSpacing: '-0.01em' }}>{staff.staff_id_no} — {staff.first_name}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: '12.5px', color: '#21402F', border: '1px solid #21402F', borderRadius: '8px', padding: '9px 16px', display: 'flex', flexDirection: 'column', gap: '2px', background: '#fff', minWidth: '150px' }}>
              <b style={{ fontSize: '10.5px', letterSpacing: '0.08em', color: '#56647B', textTransform: 'uppercase', fontFamily: "'Public Sans', sans-serif", fontWeight: 600 }}>Joining Date</b>
              {formattedJoiningDate}
            </div>
            <Link href={route('admin.staff.index')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', color: '#142720', border: '1px solid #DCE2D8', padding: '11px 18px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <Icon name="list" /> Staff Directory
            </Link>
          </div>
        </div>
      }
    >
      <Head title={`Edit Staff - ${staff.first_name}`}>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Public+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        .stf-scope {
          --stf-ink: #16213A; --stf-ink-soft: #56647B; --stf-forest: #21402F; --stf-forest-dark: #142720;
          --stf-brass: #AD7F35; --stf-brass-soft: #F1E4C8; --stf-mist: #EEF1EA; --stf-paper: #FFFFFF;
          --stf-brick: #A6402C; --stf-line: #DCE2D8; --stf-radius: 14px;
          --stf-font-display: 'Fraunces', Georgia, serif; --stf-font-body: 'Public Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          --stf-font-mono: 'JetBrains Mono', ui-monospace, monospace;
          font-family: var(--stf-font-body); background: var(--stf-mist); color: var(--stf-ink);
          max-width: 1400px; margin: 0 auto; padding: 28px 24px 56px;
        }
        .stf-scope *, .stf-scope *::before, .stf-scope *::after { box-sizing: border-box; }

        .stf-layout { display:grid; grid-template-columns: 88px 1fr; gap:24px; align-items:start; }
        @media (max-width: 860px) { .stf-layout { grid-template-columns: 1fr; } .stf-rail { display:none; } }

        .stf-rail { position:sticky; top:20px; display:flex; flex-direction:column; }
        .stf-rail-track { position:relative; }
        .stf-rail-track::before { content:''; position:absolute; left:19px; top:6px; bottom:6px; width:1px; background: var(--stf-line); }
        .stf-rail-item { position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; gap:6px; padding:16px 0; background:none; border:none; cursor:pointer; width:100%; }
        .stf-rail-numeral { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family: var(--stf-font-display); font-size:16px; font-weight:600; background: var(--stf-paper); border:1.5px solid var(--stf-line); color: var(--stf-ink-soft); transition: all .2s; }
        .stf-rail-item.active .stf-rail-numeral { border-color: var(--stf-forest); color: var(--stf-forest); box-shadow: 0 0 0 4px var(--stf-mist); }
        .stf-rail-item.complete .stf-rail-numeral { background: var(--stf-forest); border-color: var(--stf-forest); color:#fff; }
        .stf-rail-label { font-size:9.5px; letter-spacing:0.06em; text-transform:uppercase; color: var(--stf-ink-soft); font-weight:700; text-align:center; }
        .stf-rail-item.active .stf-rail-label { color: var(--stf-forest-dark); }

        .stf-card { background: var(--stf-paper); border-radius: var(--stf-radius); padding:32px; margin-bottom:24px; border:1px solid var(--stf-line); box-shadow: 0 1px 2px rgba(20,39,32,0.05); scroll-margin-top:24px; }
        @media (prefers-reduced-motion: no-preference) { .stf-card { animation: stf-rise .45s ease both; } }
        @keyframes stf-rise { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform:none; } }

        .stf-section-title { font-family: var(--stf-font-display); font-size:20px; font-weight:600; color: var(--stf-forest-dark); display:flex; align-items:center; gap:12px; margin:0 0 24px; padding-bottom:16px; border-bottom:1px solid var(--stf-line); }
        .stf-icon-chip { width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center; background: var(--stf-brass-soft); color: var(--stf-brass); flex-shrink:0; }
        .stf-icon-chip.forest { background: var(--stf-forest); color:#fff; }
        .stf-icon-chip.brick { background: #F3DCD5; color: var(--stf-brick); }

        .stf-role-box { margin-bottom:24px; padding:20px; background: var(--stf-mist); border-radius:8px; border:1px dashed var(--stf-line); }
        .stf-role-box .stf-field { max-width:320px; }

        .stf-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:20px; }
        .stf-field { display:flex; flex-direction:column; gap:6px; }
        .stf-field.span-2 { grid-column: 1 / -1; }
        .stf-label { font-size:12.5px; font-weight:600; color: var(--stf-ink-soft); letter-spacing:0.01em; }
        .stf-req { color: var(--stf-brick); margin-left:2px; }

        .stf-input { width:100%; padding:10px 13px; font-size:14.5px; font-family: var(--stf-font-body); border:1.5px solid var(--stf-line); border-radius:8px; background:#fff; color: var(--stf-ink); outline:none; transition: border-color .15s, box-shadow .15s; min-height:42px; }
        .stf-input:focus-visible, .stf-input:focus { border-color: var(--stf-brass); box-shadow: 0 0 0 3px rgba(173,127,53,0.16); }
        .stf-input.mono { font-family: var(--stf-font-mono); letter-spacing:0.02em; }
        .stf-input-error { border-color: var(--stf-brick) !important; }
        textarea.stf-input { resize:vertical; min-height:72px; line-height:1.5; font-family: var(--stf-font-body); }
        .stf-error-text { color: var(--stf-brick); font-size:11.5px; margin-top:2px; }

        .stf-photo-row { display:flex; align-items:center; gap:24px; margin-bottom:32px; background: var(--stf-mist); padding:20px; border-radius:12px; }
        .stf-id-frame {
          width:104px; height:104px; border-radius:6px; position:relative; background:#fff; flex-shrink:0;
          display:flex; align-items:center; justify-content:center; overflow:hidden;
          background-image:
            linear-gradient(var(--stf-brass), var(--stf-brass)), linear-gradient(var(--stf-brass), var(--stf-brass)),
            linear-gradient(var(--stf-brass), var(--stf-brass)), linear-gradient(var(--stf-brass), var(--stf-brass)),
            linear-gradient(var(--stf-brass), var(--stf-brass)), linear-gradient(var(--stf-brass), var(--stf-brass)),
            linear-gradient(var(--stf-brass), var(--stf-brass)), linear-gradient(var(--stf-brass), var(--stf-brass));
          background-repeat:no-repeat;
          background-size: 16px 2px, 2px 16px, 16px 2px, 2px 16px, 16px 2px, 2px 16px, 16px 2px, 2px 16px;
          background-position: 0 0, 0 0, 100% 0, 100% 0, 0 100%, 0 100%, 100% 100%, 100% 100%;
        }
        .stf-id-frame img { width:100%; height:100%; object-fit:cover; position:relative; z-index:1; }
        .stf-id-frame input[type=file] { position:absolute; inset:0; opacity:0; cursor:pointer; z-index:2; }
        .stf-camera-hint { color: var(--stf-ink-soft); }
        .stf-photo-copy h4 { margin:0 0 6px; font-family: var(--stf-font-display); font-size:16px; font-weight:600; color: var(--stf-forest-dark); }
        .stf-photo-copy p { margin:0; font-size:13px; color: var(--stf-ink-soft); line-height:1.55; }

        .stf-active-toggle { display:inline-flex; align-items:center; gap:10px; padding:11px 16px; border-radius:9px; border:1px solid var(--stf-line); background: var(--stf-mist); font-size:13.5px; font-weight:600; color: var(--stf-ink-soft); cursor:pointer; transition: all .15s; margin-top:24px; }
        .stf-active-toggle.on { background: var(--stf-forest); border-color: var(--stf-forest); color:#fff; }
        .stf-active-toggle input { accent-color: var(--stf-brass); width:16px; height:16px; }

        .stf-footer { display:flex; justify-content:flex-end; align-items:center; gap:20px; padding:20px 4px 4px; }
        .stf-cancel { color: var(--stf-ink-soft); font-weight:600; text-decoration:none; font-size:14px; }
        .stf-cancel:hover { color: var(--stf-ink); }
        .stf-submit { background: linear-gradient(135deg, var(--stf-forest), var(--stf-forest-dark)); color:#fff; padding:14px 28px; font-size:15px; font-weight:700; border:none; border-radius:9px; cursor:pointer; display:flex; align-items:center; gap:10px; box-shadow: 0 6px 16px -4px rgba(20,39,32,0.4); transition: transform .15s, box-shadow .15s; }
        .stf-submit:hover:not(:disabled) { transform: translateY(-1px); }
        .stf-submit:disabled { opacity:.65; cursor:not-allowed; box-shadow:none; transform:none; }
        .stf-seal { width:20px; height:20px; border-radius:50%; background: var(--stf-brass); display:flex; align-items:center; justify-content:center; flex-shrink:0; color:#fff; }
      `}</style>

      <div className="stf-scope">

        <p style={{ fontSize: '14px', color: '#56647B', margin: '4px 0 28px', fontFamily: "'Public Sans', sans-serif" }}>
          Update the staff record across all three sections below.
        </p>

        <form onSubmit={submit}>
          <div className="stf-layout">

            <nav className="stf-rail">
              <div className="stf-rail-track">
                {sections.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => scrollToSection(s.id)}
                    className={`stf-rail-item ${activeSection === s.id ? 'active' : ''} ${s.complete ? 'complete' : ''}`}
                  >
                    <span className="stf-rail-numeral">{s.complete ? <CheckMark /> : s.numeral}</span>
                    <span className="stf-rail-label">{s.label}</span>
                  </button>
                ))}
              </div>
            </nav>

            <div>
              {/* 1. Employment Details */}
              <div id="section-employment" ref={el => sectionRefs.current['section-employment'] = el} className="stf-card">
                <h3 className="stf-section-title">
                  <span className="stf-icon-chip"><Icon name="briefcase" /></span>
                  Employment Details
                </h3>

                {staff.user_id && (
                  <div className="stf-role-box">
                    <div className="stf-field">
                      <label className="stf-label">System Role (Permission) <span className="stf-req">*</span></label>
                      <select className={`stf-input ${errors.role_name ? 'stf-input-error' : ''}`} value={data.role_name} onChange={e => setData('role_name', e.target.value)} required>
                        <option value="">-- Select System Role --</option>
                        {roles?.map(role => (
                          <option key={role.id} value={role.name}>
                            {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                          </option>
                        ))}
                      </select>
                      {errors.role_name && <span className="stf-error-text">{errors.role_name}</span>}
                    </div>
                  </div>
                )}

                <div className="stf-grid">
                  <div className="stf-field">
                    <label className="stf-label">Department <span className="stf-req">*</span></label>
                    <select className={`stf-input ${errors.department_id ? 'stf-input-error' : ''}`} value={data.department_id} onChange={e => setData('department_id', e.target.value)} required>
                      <option value="">-- Select Department --</option>
                      {departments?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    {errors.department_id && <span className="stf-error-text">{errors.department_id}</span>}
                  </div>

                  <div className="stf-field">
                    <label className="stf-label">Designation <span className="stf-req">*</span></label>
                    <select className={`stf-input ${errors.designation_id ? 'stf-input-error' : ''}`} value={data.designation_id} onChange={e => setData('designation_id', e.target.value)} required>
                      <option value="">-- Select Designation --</option>
                      {designations?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    {errors.designation_id && <span className="stf-error-text">{errors.designation_id}</span>}
                  </div>

                  <div className="stf-field">
                    <label className="stf-label">Joining Date <span className="stf-req">*</span></label>
                    <input className={`stf-input mono ${errors.joining_date ? 'stf-input-error' : ''}`} type="date" value={data.joining_date} onChange={e => setData('joining_date', e.target.value)} required />
                    {errors.joining_date && <span className="stf-error-text">{errors.joining_date}</span>}
                  </div>

                  <div className="stf-field">
                    <label className="stf-label">Basic Salary (Monthly) <span className="stf-req">*</span></label>
                    <input className={`stf-input mono ${errors.basic_salary ? 'stf-input-error' : ''}`} type="number" step="0.01" min="0" value={data.basic_salary} onChange={e => setData('basic_salary', e.target.value)} required />
                    {errors.basic_salary && <span className="stf-error-text">{errors.basic_salary}</span>}
                  </div>
                </div>
              </div>

              {/* 2. Personal Information */}
              <div id="section-personal" ref={el => sectionRefs.current['section-personal'] = el} className="stf-card">
                <h3 className="stf-section-title">
                  <span className="stf-icon-chip forest"><Icon name="user" /></span>
                  Staff Personal Information
                </h3>

                <div className="stf-photo-row">
                  <div className="stf-id-frame">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" />
                    ) : (
                      <Icon name="camera" className="stf-camera-hint" style={{ fontSize: '26px' }} />
                    )}
                    <input type="file" accept="image/*" onChange={handlePhotoChange} title="Update Photo" />
                  </div>
                  <div className="stf-photo-copy">
                    <h4>Update Staff Photo</h4>
                    <p>Click the frame to upload a new image.<br />Max size: 2MB.</p>
                    {errors.photo && <span className="stf-error-text">{errors.photo}</span>}
                  </div>
                </div>

                <div className="stf-grid">
                  <div className="stf-field">
                    <label className="stf-label">First Name <span className="stf-req">*</span></label>
                    <input className={`stf-input ${errors.first_name ? 'stf-input-error' : ''}`} type="text" value={data.first_name} onChange={e => setData('first_name', e.target.value)} required />
                    {errors.first_name && <span className="stf-error-text">{errors.first_name}</span>}
                  </div>
                  <div className="stf-field">
                    <label className="stf-label">Last Name</label>
                    <input className="stf-input" type="text" value={data.last_name} onChange={e => setData('last_name', e.target.value)} />
                    {errors.last_name && <span className="stf-error-text">{errors.last_name}</span>}
                  </div>
                  <div className="stf-field">
                    <label className="stf-label">Father's Name</label>
                    <input className="stf-input" type="text" value={data.father_name} onChange={e => setData('father_name', e.target.value)} />
                    {errors.father_name && <span className="stf-error-text">{errors.father_name}</span>}
                  </div>
                  <div className="stf-field">
                    <label className="stf-label">Mother's Name</label>
                    <input className="stf-input" type="text" value={data.mother_name} onChange={e => setData('mother_name', e.target.value)} />
                    {errors.mother_name && <span className="stf-error-text">{errors.mother_name}</span>}
                  </div>
                  <div className="stf-field">
                    <label className="stf-label">Date of Birth <span className="stf-req">*</span></label>
                    <input className={`stf-input mono ${errors.date_of_birth ? 'stf-input-error' : ''}`} type="date" value={data.date_of_birth} onChange={e => setData('date_of_birth', e.target.value)} required />
                    {errors.date_of_birth && <span className="stf-error-text">{errors.date_of_birth}</span>}
                  </div>
                  <div className="stf-field">
                    <label className="stf-label">Gender <span className="stf-req">*</span></label>
                    <select className={`stf-input ${errors.gender ? 'stf-input-error' : ''}`} value={data.gender} onChange={e => setData('gender', e.target.value)} required>
                      <option value="">-- Select --</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && <span className="stf-error-text">{errors.gender}</span>}
                  </div>
                  <div className="stf-field">
                    <label className="stf-label">Blood Group</label>
                    <select className="stf-input" value={data.blood_group} onChange={e => setData('blood_group', e.target.value)}>
                      <option value="">-- Select --</option>
                      <option value="A+">A+</option><option value="O+">O+</option><option value="B+">B+</option><option value="AB+">AB+</option>
                      <option value="A-">A-</option><option value="O-">O-</option><option value="B-">B-</option><option value="AB-">AB-</option>
                    </select>
                    {errors.blood_group && <span className="stf-error-text">{errors.blood_group}</span>}
                  </div>
                  <div className="stf-field">
                    <label className="stf-label">Marital Status</label>
                    <select className="stf-input" value={data.marital_status} onChange={e => setData('marital_status', e.target.value)}>
                      <option value="">-- Select --</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                    </select>
                    {errors.marital_status && <span className="stf-error-text">{errors.marital_status}</span>}
                  </div>
                </div>
              </div>

              {/* 3. Contact & Qualifications */}
              <div id="section-contact" ref={el => sectionRefs.current['section-contact'] = el} className="stf-card">
                <h3 className="stf-section-title">
                  <span className="stf-icon-chip brick"><Icon name="phone" /></span>
                  Contact &amp; Qualifications
                </h3>

                <div className="stf-grid">
                  <div className="stf-field">
                    <label className="stf-label">Phone Number <span className="stf-req">*</span></label>
                    <input className={`stf-input mono ${errors.phone ? 'stf-input-error' : ''}`} type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} required />
                    {errors.phone && <span className="stf-error-text">{errors.phone}</span>}
                  </div>
                  <div className="stf-field">
                    <label className="stf-label">Emergency Contact</label>
                    <input className="stf-input mono" type="text" value={data.emergency_phone} onChange={e => setData('emergency_phone', e.target.value)} />
                    {errors.emergency_phone && <span className="stf-error-text">{errors.emergency_phone}</span>}
                  </div>
                  <div className="stf-field">
                    <label className="stf-label">Email Address</label>
                    <input className="stf-input" type="email" value={data.email} onChange={e => setData('email', e.target.value)} />
                    {errors.email && <span className="stf-error-text">{errors.email}</span>}
                  </div>

                  <div className="stf-field span-2">
                    <label className="stf-label">Educational Qualifications</label>
                    <input className="stf-input" type="text" value={data.qualification} onChange={e => setData('qualification', e.target.value)} />
                    {errors.qualification && <span className="stf-error-text">{errors.qualification}</span>}
                  </div>

                  <div className="stf-field span-2">
                    <label className="stf-label">Work Experience</label>
                    <input className="stf-input" type="text" value={data.experience} onChange={e => setData('experience', e.target.value)} />
                    {errors.experience && <span className="stf-error-text">{errors.experience}</span>}
                  </div>

                  <div className="stf-field span-2">
                    <label className="stf-label">Present Address <span className="stf-req">*</span></label>
                    <textarea className={`stf-input ${errors.present_address ? 'stf-input-error' : ''}`} style={{ minHeight: '80px' }} value={data.present_address} onChange={e => setData('present_address', e.target.value)} required />
                    {errors.present_address && <span className="stf-error-text">{errors.present_address}</span>}
                  </div>
                  <div className="stf-field span-2">
                    <label className="stf-label">Permanent Address <span className="stf-req">*</span></label>
                    <textarea className={`stf-input ${errors.permanent_address ? 'stf-input-error' : ''}`} style={{ minHeight: '80px' }} value={data.permanent_address} onChange={e => setData('permanent_address', e.target.value)} required />
                    {errors.permanent_address && <span className="stf-error-text">{errors.permanent_address}</span>}
                  </div>
                </div>

                <label className={`stf-active-toggle ${data.is_active ? 'on' : ''}`}>
                  <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} />
                  Account is Active (Current Employee)
                </label>
              </div>

              <div className="stf-footer">
                <Link href={route('admin.staff.index')} className="stf-cancel">Cancel</Link>
                <button type="submit" className="stf-submit" disabled={processing}>
                  <span className="stf-seal"><CheckMark /></span>
                  {processing ? 'Saving Changes...' : 'Update Record'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}