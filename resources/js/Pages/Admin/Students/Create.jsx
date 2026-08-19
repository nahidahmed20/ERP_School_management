import { useForm, usePage, Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';
import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CheckMark = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function Create({ classes, active_session, campuses, categories, houses }) {
  const { flash } = usePage().props;

  const { data, setData, post, processing, errors } = useForm({
    campus_id: '',
    category_id: '',
    house_id: '',
    class_id: '',
    section_id: '',
    roll_no: '',
    admission_date: new Date().toISOString().split('T')[0],

    first_name: '',
    last_name: '',
    date_of_birth: '',
    birth_certificate_no: '',
    national_id: '',
    gender: '',
    blood_group: '',
    religion: '',
    mother_tongue: 'Bangla',
    nationality: 'Bangladeshi',
    phone: '',
    email: '',
    medical_history: '',
    previous_school_details: '',
    present_address: '',
    permanent_address: '',

    father_name: '',
    father_phone: '',
    mother_name: '',
    mother_phone: '',
    guardian_email: '',

    create_student_user: true,
    create_parent_user: true,
    photo: null,
    guardian_id: null
  });

  const [photoPreview, setPhotoPreview] = useState(null);

  const selectedClass = classes?.find(c => c.id == data.class_id);
  const availableSections = selectedClass?.sections || [];

  const [isSibling, setIsSibling] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearchGuardian = async () => {
    if (!searchQuery) return;
    setSearching(true);
    try {
      const response = await axios.get(route('admin.students.search_guardian'), { params: { query: searchQuery } });

      if (response.data.guardian) {
        const g = response.data.guardian;
        setData(data => ({
          ...data,
          guardian_id: g.id,
          father_name: g.father_name || '',
          father_phone: g.father_phone || '',
          mother_name: g.mother_name || '',
          mother_phone: g.mother_phone || '',
          guardian_email: g.guardian_email || '',
          present_address: g.address || data.present_address,
        }));
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Guardian found! Data Auto-filled.', showConfirmButton: false, timer: 3000 });
      } else {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'No guardian or student found with this info.', showConfirmButton: false, timer: 3000 });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Server Error!', showConfirmButton: false, timer: 3000 });
    } finally {
      setSearching(false);
    }
  };

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
    post(route('admin.students.store'), { forceFormData: true });
  };

  const academicComplete = !!(data.campus_id && data.class_id && data.section_id && data.admission_date);
  const personalComplete = !!(data.first_name && data.date_of_birth && data.gender && data.nationality && data.present_address && data.permanent_address);
  const guardianComplete = !!(data.father_name && data.father_phone && data.mother_name);

  const sections = useMemo(() => ([
    { id: 'section-academic', step: '01', label: 'Academic', complete: academicComplete },
    { id: 'section-personal', step: '02', label: 'Personal', complete: personalComplete },
    { id: 'section-guardian', step: '03', label: 'Guardian', complete: guardianComplete },
  ]), [academicComplete, personalComplete, guardianComplete]);

  const [activeSection, setActiveSection] = useState('section-academic');
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

  const formattedEntryDate = data.admission_date
    ? new Date(data.admission_date + 'T00:00:00').toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <AuthenticatedLayout
      header={
        <div className="mod-mast">
          <div>
            <div className="mod-badge">Enrollment Portal</div>
            <h1 className="mod-title">New Student Admission</h1>
            <p className="mod-subtitle">Fill in the details below to register a new student into the system.</p>
          </div>
          <div className="mod-mast-actions">
            <div className="mod-date-pill">
              <span>Date</span>
              <strong>{formattedEntryDate}</strong>
            </div>
            <Link href={route('admin.students.index')} className="mod-btn-outline">
              <Icon name="list" /> View Directory
            </Link>
          </div>
        </div>
      }
    >
      <Head title="New Admission | Student">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        .mod-scope {
          --brand: #4f46e5;
          --brand-hover: #4338ca;
          --brand-light: #e0e7ff;
          --bg-main: #f8fafc;
          --bg-card: #ffffff;
          --text-main: #0f172a;
          --text-muted: #64748b;
          --border: #e2e8f0;
          --border-focus: #818cf8;
          --ring: rgba(99, 102, 241, 0.2);
          --danger: #ef4444;
          --danger-bg: #fef2f2;

          font-family: 'Inter', -apple-system, sans-serif;
          background: var(--bg-main);
          color: var(--text-main);
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 24px 64px;
        }

        .mod-scope *, .mod-scope *::before, .mod-scope *::after { box-sizing: border-box; }

        /* Header Styles */
        .mod-mast { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; flex-wrap: wrap; margin-bottom: 32px; }
        .mod-badge { display: inline-block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--brand); background: var(--brand-light); padding: 4px 10px; border-radius: 6px; margin-bottom: 12px; }
        .mod-title { font-size: 28px; font-weight: 700; color: var(--text-main); margin: 0 0 6px; letter-spacing: -0.02em; }
        .mod-subtitle { font-size: 15px; color: var(--text-muted); margin: 0; }

        .mod-mast-actions { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .mod-date-pill { display: flex; flex-direction: column; background: var(--bg-card); border: 1px solid var(--border); padding: 8px 16px; border-radius: 10px; font-size: 14px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
        .mod-date-pill span { font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; }
        .mod-date-pill strong { font-weight: 600; color: var(--text-main); }

        .mod-btn-outline { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-main); font-weight: 600; font-size: 14px; text-decoration: none; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
        .mod-btn-outline:hover { background: var(--bg-main); border-color: #cbd5e1; }

        .mod-alert { display: flex; gap: 12px; align-items: flex-start; background: var(--danger-bg); border: 1px solid #fecaca; color: #991b1b; padding: 16px; border-radius: 12px; margin-bottom: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .mod-alert strong { display: block; font-size: 15px; margin-bottom: 4px; }

        /* Layout */
        .mod-layout { display: grid; grid-template-columns: 200px 1fr; gap: 40px; align-items: start; }
        @media (max-width: 900px) { .mod-layout { grid-template-columns: 1fr; } .mod-rail { display: none; } }

        /* Sidebar Progress Rail */
        .mod-rail { position: sticky; top: 32px; display: flex; flex-direction: column; gap: 0; }
        .mod-rail-item { display: flex; align-items: flex-start; gap: 16px; background: none; border: none; cursor: pointer; text-align: left; padding: 0 0 32px 0; position: relative; width: 100%; opacity: 0.6; transition: opacity 0.3s; }
        .mod-rail-item:last-child { padding-bottom: 0; }
        .mod-rail-item:not(:last-child)::after { content: ''; position: absolute; left: 15px; top: 36px; bottom: 8px; width: 2px; background: var(--border); }

        .mod-rail-item.active, .mod-rail-item.complete { opacity: 1; }
        .mod-rail-item.complete:not(:last-child)::after { background: var(--brand); }

        .mod-rail-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--bg-card); border: 2px solid var(--border); font-size: 12px; font-weight: 600; color: var(--text-muted); position: relative; z-index: 2; transition: all 0.3s; }
        .mod-rail-item.active .mod-rail-icon { border-color: var(--brand); color: var(--brand); box-shadow: 0 0 0 4px var(--brand-light); }
        .mod-rail-item.complete .mod-rail-icon { background: var(--brand); border-color: var(--brand); color: white; }

        .mod-rail-text { padding-top: 6px; }
        .mod-rail-label { display: block; font-size: 14px; font-weight: 600; color: var(--text-main); }
        .mod-rail-desc { display: block; font-size: 12px; color: var(--text-muted); margin-top: 2px; }

        /* Form Cards */
        .mod-card { background: var(--bg-card); border-radius: 16px; padding: 32px; margin-bottom: 32px; border: 1px solid var(--border); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -2px rgba(0,0,0,0.02); scroll-margin-top: 32px; }

        .mod-section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
        .mod-section-icon { width: 40px; height: 40px; border-radius: 10px; background: var(--bg-main); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--text-main); }
        .mod-section-title { font-size: 18px; font-weight: 600; margin: 0; color: var(--text-main); letter-spacing: -0.01em; }

        /* Inputs */
        .mod-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
        .mod-field { display: flex; flex-direction: column; gap: 6px; }
        .mod-field.span-2 { grid-column: 1 / -1; }
        .mod-label { font-size: 13px; font-weight: 500; color: var(--text-main); }
        .mod-req { color: var(--danger); margin-left: 2px; }

        .mod-input { width: 100%; padding: 10px 14px; font-size: 14px; font-family: inherit; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-card); color: var(--text-main); outline: none; transition: all 0.2s; min-height: 44px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
        .mod-input::placeholder { color: #94a3b8; }
        .mod-input:focus-visible, .mod-input:focus { border-color: var(--border-focus); box-shadow: 0 0 0 3px var(--ring); }
        .mod-input.mono { font-family: 'JetBrains Mono', monospace; font-size: 13.5px; }
        .mod-input-error { border-color: var(--danger) !important; box-shadow: 0 0 0 3px rgba(239,68,68,0.1) !important; }
        textarea.mod-input { resize: vertical; min-height: 80px; line-height: 1.5; padding: 12px 14px; }
        .mod-error-text { color: var(--danger); font-size: 12px; margin-top: 4px; font-weight: 500; }

        /* Switches & Toggles */
        .mod-toggles { display: flex; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
        .mod-switch-label { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 500; color: var(--text-main); cursor: pointer; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-main); transition: all 0.2s; }
        .mod-switch-label:hover { border-color: #cbd5e1; }
        .mod-switch-label input { width: 18px; height: 18px; accent-color: var(--brand); cursor: pointer; }

        /* Photo Upload */
        .mod-photo-area { display: flex; align-items: center; gap: 24px; margin-bottom: 32px; padding: 24px; border: 1px dashed var(--border); border-radius: 12px; background: var(--bg-main); transition: border-color 0.2s; }
        .mod-photo-area:hover { border-color: #cbd5e1; }
        .mod-avatar { width: 90px; height: 90px; border-radius: 50%; background: var(--bg-card); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; flex-shrink: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .mod-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .mod-avatar input[type=file] { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
        .mod-photo-info h4 { margin: 0 0 4px; font-size: 15px; font-weight: 600; }
        .mod-photo-info p { margin: 0; font-size: 13px; color: var(--text-muted); line-height: 1.5; }

        /* Sibling Lookup */
        .mod-sibling-box { padding: 20px; background: var(--bg-main); border-radius: 12px; margin-bottom: 28px; border: 1px solid var(--border); }
        .mod-lookup-wrap { display: flex; gap: 12px; margin-top: 16px; }
        .mod-lookup-wrap input { flex: 1; }
        .mod-btn-search { background: var(--text-main); color: white; padding: 0 20px; border-radius: 10px; border: none; font-weight: 500; font-size: 14px; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: background 0.2s; }
        .mod-btn-search:hover { background: #334155; }
        .mod-btn-search:disabled { opacity: 0.7; cursor: not-allowed; }

        /* Footer Actions */
        .mod-footer { display: flex; justify-content: flex-end; align-items: center; gap: 16px; padding: 16px 0 0; }
        .mod-btn-cancel { color: var(--text-muted); font-weight: 500; text-decoration: none; font-size: 14px; padding: 12px 20px; border-radius: 10px; transition: all 0.2s; }
        .mod-btn-cancel:hover { color: var(--text-main); background: var(--bg-main); }
        .mod-btn-submit { background: var(--brand); color: white; padding: 12px 28px; font-size: 15px; font-weight: 600; border: none; border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px -1px rgba(79,70,229,0.3); transition: all 0.2s; }
        .mod-btn-submit:hover:not(:disabled) { background: var(--brand-hover); transform: translateY(-1px); box-shadow: 0 6px 8px -1px rgba(79,70,229,0.3); }
        .mod-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
      `}</style>

      <div className="mod-scope">
        {!active_session && (
          <div className="mod-alert">
            <Icon name="warning" style={{ fontSize: '20px', marginTop: '2px' }} />
            <div>
              <strong>No active session found</strong>
              <span style={{ fontSize: '14px' }}>Please configure an active academic session in settings before admitting new students.</span>
            </div>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="mod-layout">

            {/* Sidebar Rail */}
            <nav className="mod-rail">
              {sections.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => scrollToSection(s.id)}
                  className={`mod-rail-item ${activeSection === s.id ? 'active' : ''} ${s.complete ? 'complete' : ''}`}
                >
                  <div className="mod-rail-icon">
                    {s.complete ? <CheckMark /> : s.step}
                  </div>
                  <div className="mod-rail-text">
                    <span className="mod-rail-label">{s.label}</span>
                    <span className="mod-rail-desc">
                      {s.id === 'section-academic' && 'Class & Section'}
                      {s.id === 'section-personal' && 'Bio & Address'}
                      {s.id === 'section-guardian' && 'Parents info'}
                    </span>
                  </div>
                </button>
              ))}
            </nav>

            {/* Form Content */}
            <div>
              {/* 1. Academic Details */}
              <div id="section-academic" ref={el => sectionRefs.current['section-academic'] = el} className="mod-card">
                <div className="mod-section-header">
                  <div className="mod-section-icon"><Icon name="book" /></div>
                  <h3 className="mod-section-title">Academic Details</h3>
                </div>

                <div className="mod-toggles">
                  <label className="mod-switch-label">
                    <input type="checkbox" checked={data.create_student_user} onChange={e => setData('create_student_user', e.target.checked)} />
                    Create Student Portal Account
                  </label>
                  <label className="mod-switch-label">
                    <input type="checkbox" checked={data.create_parent_user} onChange={e => setData('create_parent_user', e.target.checked)} />
                    Create Parent Portal Account
                  </label>
                </div>

                <div className="mod-grid">
                  <div className="mod-field">
                    <label className="mod-label">Campus <span className="mod-req">*</span></label>
                    <select className={`mod-input ${errors.campus_id ? 'mod-input-error' : ''}`} value={data.campus_id} onChange={e => setData('campus_id', e.target.value)} required>
                      <option value="">Select Campus</option>
                      {campuses?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {errors.campus_id && <span className="mod-error-text">{errors.campus_id}</span>}
                  </div>

                  <div className="mod-field">
                    <label className="mod-label">Student Category</label>
                    <select className="mod-input" value={data.category_id} onChange={e => setData('category_id', e.target.value)}>
                      <option value="">General / Regular</option>
                      {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {errors.category_id && <span className="mod-error-text">{errors.category_id}</span>}
                  </div>

                  <div className="mod-field">
                    <label className="mod-label">House (Optional)</label>
                    <select className="mod-input" value={data.house_id} onChange={e => setData('house_id', e.target.value)}>
                      <option value="">Select House</option>
                      {houses?.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                    {errors.house_id && <span className="mod-error-text">{errors.house_id}</span>}
                  </div>

                  <div className="mod-field">
                    <label className="mod-label">Class <span className="mod-req">*</span></label>
                    <select className={`mod-input ${errors.class_id ? 'mod-input-error' : ''}`} value={data.class_id} onChange={e => setData('class_id', e.target.value)} required>
                      <option value="">Select Class</option>
                      {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {errors.class_id && <span className="mod-error-text">{errors.class_id}</span>}
                  </div>

                  <div className="mod-field">
                    <label className="mod-label">Section <span className="mod-req">*</span></label>
                    <select className={`mod-input ${errors.section_id ? 'mod-input-error' : ''}`} value={data.section_id} onChange={e => setData('section_id', e.target.value)} required disabled={!data.class_id}>
                      <option value="">Select Section</option>
                      {availableSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    {errors.section_id && <span className="mod-error-text">{errors.section_id}</span>}
                  </div>

                  <div className="mod-field">
                    <label className="mod-label">Roll Number</label>
                    <input className="mod-input mono" type="text" placeholder="e.g. 101" value={data.roll_no} onChange={e => setData('roll_no', e.target.value)} />
                    {errors.roll_no && <span className="mod-error-text">{errors.roll_no}</span>}
                  </div>

                  <div className="mod-field">
                    <label className="mod-label">Admission Date <span className="mod-req">*</span></label>
                    <input className="mod-input mono" type="date" value={data.admission_date} onChange={e => setData('admission_date', e.target.value)} required />
                    {errors.admission_date && <span className="mod-error-text">{errors.admission_date}</span>}
                  </div>
                </div>
              </div>

              {/* 2. Personal Information */}
              <div id="section-personal" ref={el => sectionRefs.current['section-personal'] = el} className="mod-card">
                <div className="mod-section-header">
                  <div className="mod-section-icon"><Icon name="user" /></div>
                  <h3 className="mod-section-title">Personal Information</h3>
                </div>

                <div className="mod-photo-area">
                  <div className="mod-avatar">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" />
                    ) : (
                      <Icon name="camera" style={{ fontSize: '24px', color: '#94a3b8' }} />
                    )}
                    <input type="file" accept="image/*" onChange={handlePhotoChange} title="Click to upload profile photo" />
                  </div>
                  <div className="mod-photo-info">
                    <h4>Profile Photo</h4>
                    <p>Click the avatar to upload an image.<br />Square format recommended. Max size: 2MB.</p>
                    {errors.photo && <span className="mod-error-text">{errors.photo}</span>}
                  </div>
                </div>

                <div className="mod-grid">
                  <div className="mod-field">
                    <label className="mod-label">First Name <span className="mod-req">*</span></label>
                    <input className={`mod-input ${errors.first_name ? 'mod-input-error' : ''}`} placeholder="e.g. Abdullah" type="text" value={data.first_name} onChange={e => setData('first_name', e.target.value)} required />
                    {errors.first_name && <span className="mod-error-text">{errors.first_name}</span>}
                  </div>
                  <div className="mod-field">
                    <label className="mod-label">Last Name</label>
                    <input className="mod-input" placeholder="e.g. Al Noman" type="text" value={data.last_name} onChange={e => setData('last_name', e.target.value)} />
                    {errors.last_name && <span className="mod-error-text">{errors.last_name}</span>}
                  </div>
                  <div className="mod-field">
                    <label className="mod-label">Date of Birth <span className="mod-req">*</span></label>
                    <input className={`mod-input mono ${errors.date_of_birth ? 'mod-input-error' : ''}`} type="date" value={data.date_of_birth} onChange={e => setData('date_of_birth', e.target.value)} required />
                    {errors.date_of_birth && <span className="mod-error-text">{errors.date_of_birth}</span>}
                  </div>
                  <div className="mod-field">
                    <label className="mod-label">Birth Certificate No.</label>
                    <input className="mod-input mono" type="text" placeholder="17-digit registration number" value={data.birth_certificate_no} onChange={e => setData('birth_certificate_no', e.target.value)} />
                    {errors.birth_certificate_no && <span className="mod-error-text">{errors.birth_certificate_no}</span>}
                  </div>
                  <div className="mod-field">
                    <label className="mod-label">National ID (If applicable)</label>
                    <input className="mod-input mono" type="text" placeholder="For older students" value={data.national_id} onChange={e => setData('national_id', e.target.value)} />
                    {errors.national_id && <span className="mod-error-text">{errors.national_id}</span>}
                  </div>
                  <div className="mod-field">
                    <label className="mod-label">Gender <span className="mod-req">*</span></label>
                    <select className={`mod-input ${errors.gender ? 'mod-input-error' : ''}`} value={data.gender} onChange={e => setData('gender', e.target.value)} required>
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && <span className="mod-error-text">{errors.gender}</span>}
                  </div>
                  <div className="mod-field">
                    <label className="mod-label">Blood Group</label>
                    <select className="mod-input" value={data.blood_group} onChange={e => setData('blood_group', e.target.value)}>
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option><option value="O+">O+</option><option value="B+">B+</option><option value="AB+">AB+</option>
                      <option value="A-">A-</option><option value="O-">O-</option><option value="B-">B-</option><option value="AB-">AB-</option>
                    </select>
                    {errors.blood_group && <span className="mod-error-text">{errors.blood_group}</span>}
                  </div>
                  <div className="mod-field">
                    <label className="mod-label">Religion</label>
                    <input className="mod-input" placeholder="e.g. Islam" type="text" value={data.religion} onChange={e => setData('religion', e.target.value)} />
                    {errors.religion && <span className="mod-error-text">{errors.religion}</span>}
                  </div>
                  <div className="mod-field">
                    <label className="mod-label">Mother Tongue</label>
                    <input className="mod-input" type="text" value={data.mother_tongue} onChange={e => setData('mother_tongue', e.target.value)} />
                    {errors.mother_tongue && <span className="mod-error-text">{errors.mother_tongue}</span>}
                  </div>
                  <div className="mod-field">
                    <label className="mod-label">Nationality <span className="mod-req">*</span></label>
                    <input className="mod-input" type="text" value={data.nationality} onChange={e => setData('nationality', e.target.value)} required />
                    {errors.nationality && <span className="mod-error-text">{errors.nationality}</span>}
                  </div>
                  <div className="mod-field">
                    <label className="mod-label">Phone (Optional)</label>
                    <input className="mod-input mono" placeholder="01XXXXXXXXX" type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                    {errors.phone && <span className="mod-error-text">{errors.phone}</span>}
                  </div>
                  <div className="mod-field">
                    <label className="mod-label">Email (Optional)</label>
                    <input className="mod-input" type="email" placeholder="student@example.com" value={data.email} onChange={e => setData('email', e.target.value)} />
                    {errors.email && <span className="mod-error-text">{errors.email}</span>}
                  </div>

                  <div className="mod-field span-2">
                    <label className="mod-label">Previous School Details</label>
                    <textarea className="mod-input" placeholder="Name of previous school, TC Number, reason for leaving..." value={data.previous_school_details} onChange={e => setData('previous_school_details', e.target.value)} />
                    {errors.previous_school_details && <span className="mod-error-text">{errors.previous_school_details}</span>}
                  </div>

                  <div className="mod-field span-2">
                    <label className="mod-label">Medical History & Allergies</label>
                    <textarea className="mod-input" placeholder="Mention if the student has asthma, allergies to specific foods, etc." value={data.medical_history} onChange={e => setData('medical_history', e.target.value)} />
                    {errors.medical_history && <span className="mod-error-text">{errors.medical_history}</span>}
                  </div>

                  <div className="mod-field span-2">
                    <label className="mod-label">Present Address <span className="mod-req">*</span></label>
                    <textarea className={`mod-input ${errors.present_address ? 'mod-input-error' : ''}`} placeholder="Enter full present address..." value={data.present_address} onChange={e => setData('present_address', e.target.value)} required />
                    {errors.present_address && <span className="mod-error-text">{errors.present_address}</span>}
                  </div>
                  <div className="mod-field span-2">
                    <label className="mod-label">Permanent Address <span className="mod-req">*</span></label>
                    <textarea className={`mod-input ${errors.permanent_address ? 'mod-input-error' : ''}`} placeholder="Enter full permanent address..." value={data.permanent_address} onChange={e => setData('permanent_address', e.target.value)} required />
                    {errors.permanent_address && <span className="mod-error-text">{errors.permanent_address}</span>}
                  </div>
                </div>
              </div>

              {/* 3. Guardian Information */}
              <div id="section-guardian" ref={el => sectionRefs.current['section-guardian'] = el} className="mod-card">
                <div className="mod-section-header">
                  <div className="mod-section-icon"><Icon name="users" /></div>
                  <h3 className="mod-section-title">Guardian Information</h3>
                </div>

                <div className="mod-sibling-box">
                  <label className="mod-switch-label" style={{ border: 'none', padding: 0, background: 'transparent' }}>
                    <input type="checkbox" checked={isSibling} onChange={e => setIsSibling(e.target.checked)} />
                    Does the student already have a sibling in this school?
                  </label>

                  {isSibling && (
                    <div className="mod-lookup-wrap">
                      <input
                        className="mod-input"
                        placeholder="Enter Sibling's Admission No or Father's Phone"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSearchGuardian())}
                      />
                      <button type="button" onClick={handleSearchGuardian} disabled={searching} className="mod-btn-search">
                        <SearchIcon /> {searching ? 'Searching...' : 'Search Guardian'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="mod-grid">
                  <div className="mod-field">
                    <label className="mod-label">Father's Name <span className="mod-req">*</span></label>
                    <input className={`mod-input ${errors.father_name ? 'mod-input-error' : ''}`} type="text" value={data.father_name} onChange={e => setData('father_name', e.target.value)} required />
                    {errors.father_name && <span className="mod-error-text">{errors.father_name}</span>}
                  </div>
                  <div className="mod-field">
                    <label className="mod-label">Father's Phone <span className="mod-req">*</span></label>
                    <input className={`mod-input mono ${errors.father_phone ? 'mod-input-error' : ''}`} type="text" placeholder="01XXXXXXXXX" value={data.father_phone} onChange={e => setData('father_phone', e.target.value)} required />
                    {errors.father_phone && <span className="mod-error-text">{errors.father_phone}</span>}
                  </div>
                  <div className="mod-field">
                    <label className="mod-label">Mother's Name <span className="mod-req">*</span></label>
                    <input className={`mod-input ${errors.mother_name ? 'mod-input-error' : ''}`} type="text" value={data.mother_name} onChange={e => setData('mother_name', e.target.value)} required />
                    {errors.mother_name && <span className="mod-error-text">{errors.mother_name}</span>}
                  </div>
                  <div className="mod-field">
                    <label className="mod-label">Mother's Phone</label>
                    <input className="mod-input mono" type="text" placeholder="01XXXXXXXXX" value={data.mother_phone} onChange={e => setData('mother_phone', e.target.value)} />
                    {errors.mother_phone && <span className="mod-error-text">{errors.mother_phone}</span>}
                  </div>
                  <div className="mod-field">
                    <label className="mod-label">Guardian Email</label>
                    <input className="mod-input" type="email" placeholder="example@gmail.com" value={data.guardian_email} onChange={e => setData('guardian_email', e.target.value)} />
                    {errors.guardian_email && <span className="mod-error-text">{errors.guardian_email}</span>}
                  </div>
                </div>
              </div>

              <div className="mod-footer">
                <Link href={route('admin.students.index')} className="mod-btn-cancel">Cancel</Link>
                <button type="submit" className="mod-btn-submit" disabled={processing || !active_session}>
                  <CheckMark />
                  {processing ? 'Processing...' : 'Confirm Admission'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}
