import { useForm, usePage, Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';
import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CheckMark = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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

  // --- Registry index rail: tracks real completion state per section, not decoration ---
  const academicComplete = !!(data.campus_id && data.class_id && data.section_id && data.admission_date);
  const personalComplete = !!(data.first_name && data.date_of_birth && data.gender && data.nationality && data.present_address && data.permanent_address);
  const guardianComplete = !!(data.father_name && data.father_phone && data.mother_name);

  const sections = useMemo(() => ([
    { id: 'section-academic', numeral: 'I', label: 'Academic', complete: academicComplete },
    { id: 'section-personal', numeral: 'II', label: 'Personal', complete: personalComplete },
    { id: 'section-guardian', numeral: 'III', label: 'Guardian', complete: guardianComplete },
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
    ? new Date(data.admission_date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '24px', flexWrap: 'wrap', marginBottom: '0px', fontFamily: "'Public Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>
          <div>
            <span style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#AD7F35', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '18px', height: '1px', background: '#AD7F35', display: 'inline-block' }} /> Admission Register
            </span>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '30px', fontWeight: 600, color: '#142720', margin: '8px 0 0', letterSpacing: '-0.01em' }}>New Student Enrollment</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: '12.5px', color: '#21402F', border: '1px solid #21402F', borderRadius: '8px', padding: '9px 16px', display: 'flex', flexDirection: 'column', gap: '2px', background: '#fff', minWidth: '150px' }}>
              <b style={{ fontSize: '10.5px', letterSpacing: '0.08em', color: '#56647B', textTransform: 'uppercase', fontFamily: "'Public Sans', sans-serif", fontWeight: 600 }}>Entry Date</b>
              {formattedEntryDate}
            </div>
            <Link href={route('admin.students.index')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', color: '#142720', border: '1px solid #DCE2D8', padding: '11px 18px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <Icon name="list" /> View Directory
            </Link>
          </div>
        </div>
      }
    >
      <Head title="New Admission | Student">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Public+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        .adm-scope {
          --adm-ink: #16213A; --adm-ink-soft: #56647B; --adm-forest: #21402F; --adm-forest-dark: #142720;
          --adm-brass: #AD7F35; --adm-brass-soft: #F1E4C8; --adm-mist: #EEF1EA; --adm-paper: #FFFFFF;
          --adm-brick: #A6402C; --adm-line: #DCE2D8; --adm-radius: 14px;
          --adm-font-display: 'Fraunces', Georgia, serif; --adm-font-body: 'Public Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          --adm-font-mono: 'JetBrains Mono', ui-monospace, monospace;
          font-family: var(--adm-font-body); background: var(--adm-mist); color: var(--adm-ink);
          max-width: 1400px; margin: 0 auto; padding: 28px 24px 56px;
        }
        .adm-scope *, .adm-scope *::before, .adm-scope *::after { box-sizing: border-box; }

        .adm-mast { display:flex; justify-content:space-between; align-items:flex-end; gap:24px; padding-bottom:26px; border-bottom:1px solid var(--adm-line); margin-bottom:32px; flex-wrap:wrap; }
        .adm-eyebrow { font-family: var(--adm-font-mono); font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color: var(--adm-brass); font-weight:600; display:flex; align-items:center; gap:8px; }
        .adm-eyebrow::before { content:''; width:18px; height:1px; background: var(--adm-brass); }
        .adm-title { font-family: var(--adm-font-display); font-size:33px; font-weight:600; color: var(--adm-forest-dark); margin:8px 0 0; letter-spacing:-0.01em; }
        .adm-subtitle { font-size:14px; color: var(--adm-ink-soft); margin-top:6px; max-width:480px; }
        .adm-mast-right { display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .adm-stamp { font-family: var(--adm-font-mono); font-size:12.5px; color: var(--adm-forest); border:1px solid var(--adm-forest); border-radius:8px; padding:9px 16px; display:flex; flex-direction:column; gap:2px; background: var(--adm-paper); min-width:150px; }
        .adm-stamp b { font-size:10.5px; letter-spacing:0.08em; color: var(--adm-ink-soft); text-transform:uppercase; font-family: var(--adm-font-body); font-weight:600; }
        .adm-directory-link { display:inline-flex; align-items:center; gap:8px; padding:11px 18px; border-radius:8px; border:1px solid var(--adm-line); background: var(--adm-paper); color: var(--adm-forest-dark); font-weight:600; font-size:14px; text-decoration:none; transition: border-color .15s, transform .15s; }
        .adm-directory-link:hover { border-color: var(--adm-brass); transform: translateY(-1px); }

        .adm-alert { display:flex; gap:14px; align-items:flex-start; background:#FBEEE9; border-left:4px solid var(--adm-brick); color:#7A2E1D; padding:16px 20px; border-radius:8px; margin-bottom:28px; }
        .adm-alert strong { display:block; font-size:15px; margin-bottom:2px; }

        .adm-layout { display:grid; grid-template-columns: 88px 1fr; gap:24px; align-items:start; }
        @media (max-width: 860px) { .adm-layout { grid-template-columns: 1fr; } .adm-rail { display:none; } }

        .adm-rail { position:sticky; top:20px; display:flex; flex-direction:column; }
        .adm-rail-track { position:relative; }
        .adm-rail-track::before { content:''; position:absolute; left:19px; top:6px; bottom:6px; width:1px; background: var(--adm-line); }
        .adm-rail-item { position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; gap:6px; padding:16px 0; background:none; border:none; cursor:pointer; width:100%; }
        .adm-rail-numeral { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family: var(--adm-font-display); font-size:16px; font-weight:600; background: var(--adm-paper); border:1.5px solid var(--adm-line); color: var(--adm-ink-soft); transition: all .2s; }
        .adm-rail-item.active .adm-rail-numeral { border-color: var(--adm-forest); color: var(--adm-forest); box-shadow: 0 0 0 4px var(--adm-mist); }
        .adm-rail-item.complete .adm-rail-numeral { background: var(--adm-forest); border-color: var(--adm-forest); color:#fff; }
        .adm-rail-label { font-size:9.5px; letter-spacing:0.06em; text-transform:uppercase; color: var(--adm-ink-soft); font-weight:700; text-align:center; }
        .adm-rail-item.active .adm-rail-label { color: var(--adm-forest-dark); }

        .adm-card { background: var(--adm-paper); border-radius: var(--adm-radius); padding:32px; margin-bottom:24px; border:1px solid var(--adm-line); box-shadow: 0 1px 2px rgba(20,39,32,0.05); scroll-margin-top:24px; }
        @media (prefers-reduced-motion: no-preference) { .adm-card { animation: adm-rise .45s ease both; } }
        @keyframes adm-rise { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform:none; } }

        .adm-section-title { font-family: var(--adm-font-display); font-size:20px; font-weight:600; color: var(--adm-forest-dark); display:flex; align-items:center; gap:12px; margin:0 0 24px; padding-bottom:16px; border-bottom:1px solid var(--adm-line); }
        .adm-icon-chip { width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center; background: var(--adm-brass-soft); color: var(--adm-brass); flex-shrink:0; }
        .adm-icon-chip.forest { background: var(--adm-forest); color:#fff; }

        .adm-toggle-row { display:flex; gap:14px; margin-bottom:24px; flex-wrap:wrap; }
        .adm-toggle { display:flex; align-items:center; gap:10px; padding:11px 16px; border-radius:9px; border:1px solid var(--adm-line); background: var(--adm-mist); font-size:13.5px; font-weight:600; color: var(--adm-ink-soft); cursor:pointer; transition: all .15s; }
        .adm-toggle.on { background: var(--adm-forest); border-color: var(--adm-forest); color:#fff; }
        .adm-toggle input { accent-color: var(--adm-brass); width:16px; height:16px; }

        .adm-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:20px; }
        .adm-field { display:flex; flex-direction:column; gap:6px; }
        .adm-field.span-2 { grid-column: 1 / -1; }
        .adm-label { font-size:12.5px; font-weight:600; color: var(--adm-ink-soft); letter-spacing:0.01em; }
        .adm-req { color: var(--adm-brick); margin-left:2px; }

        .adm-input { width:100%; padding:10px 13px; font-size:14.5px; font-family: var(--adm-font-body); border:1.5px solid var(--adm-line); border-radius:8px; background:#fff; color: var(--adm-ink); outline:none; transition: border-color .15s, box-shadow .15s; min-height:42px; }
        .adm-input:focus-visible, .adm-input:focus { border-color: var(--adm-brass); box-shadow: 0 0 0 3px rgba(173,127,53,0.16); }
        .adm-input.mono { font-family: var(--adm-font-mono); letter-spacing:0.02em; }
        .adm-input-error { border-color: var(--adm-brick) !important; }
        textarea.adm-input { resize:vertical; min-height:72px; line-height:1.5; font-family: var(--adm-font-body); }
        .adm-error-text { color: var(--adm-brick); font-size:11.5px; margin-top:2px; }

        .adm-photo-row { display:flex; align-items:center; gap:24px; margin-bottom:32px; background: var(--adm-mist); padding:20px; border-radius:12px; }
        .adm-id-frame {
          width:104px; height:104px; border-radius:6px; position:relative; background:#fff; flex-shrink:0;
          display:flex; align-items:center; justify-content:center; overflow:hidden;
          background-image:
            linear-gradient(var(--adm-brass), var(--adm-brass)), linear-gradient(var(--adm-brass), var(--adm-brass)),
            linear-gradient(var(--adm-brass), var(--adm-brass)), linear-gradient(var(--adm-brass), var(--adm-brass)),
            linear-gradient(var(--adm-brass), var(--adm-brass)), linear-gradient(var(--adm-brass), var(--adm-brass)),
            linear-gradient(var(--adm-brass), var(--adm-brass)), linear-gradient(var(--adm-brass), var(--adm-brass));
          background-repeat:no-repeat;
          background-size: 16px 2px, 2px 16px, 16px 2px, 2px 16px, 16px 2px, 2px 16px, 16px 2px, 2px 16px;
          background-position: 0 0, 0 0, 100% 0, 100% 0, 0 100%, 0 100%, 100% 100%, 100% 100%;
        }
        .adm-id-frame img { width:100%; height:100%; object-fit:cover; position:relative; z-index:1; }
        .adm-id-frame input[type=file] { position:absolute; inset:0; opacity:0; cursor:pointer; z-index:2; }
        .adm-camera-hint { color: var(--adm-ink-soft); }
        .adm-photo-copy h4 { margin:0 0 6px; font-family: var(--adm-font-display); font-size:16px; font-weight:600; color: var(--adm-forest-dark); }
        .adm-photo-copy p { margin:0; font-size:13px; color: var(--adm-ink-soft); line-height:1.55; }

        .adm-sibling-box { margin-bottom:24px; padding-bottom:20px; border-bottom:1px dashed var(--adm-line); }
        .adm-sibling-toggle { display:inline-flex; align-items:center; gap:10px; font-weight:600; font-size:14px; color: var(--adm-ink); cursor:pointer; }
        .adm-sibling-toggle input { width:17px; height:17px; accent-color: var(--adm-brass); }
        .adm-lookup { display:flex; gap:10px; background: var(--adm-mist); padding:16px; border-radius:8px; margin-top:16px; border:1px solid var(--adm-line); }
        .adm-lookup input { flex:1; }
        .adm-lookup-btn { background: var(--adm-forest); color:#fff; padding:0 22px; border-radius:8px; border:none; cursor:pointer; font-weight:600; font-size:13.5px; display:flex; align-items:center; gap:8px; transition: background .15s; white-space:nowrap; }
        .adm-lookup-btn:hover { background: var(--adm-forest-dark); }
        .adm-lookup-btn:disabled { opacity:.6; cursor:not-allowed; }

        .adm-footer { display:flex; justify-content:flex-end; align-items:center; gap:20px; padding:20px 4px 4px; }
        .adm-cancel { color: var(--adm-ink-soft); font-weight:600; text-decoration:none; font-size:14px; }
        .adm-cancel:hover { color: var(--adm-ink); }
        .adm-submit { background: linear-gradient(135deg, var(--adm-forest), var(--adm-forest-dark)); color:#fff; padding:14px 28px; font-size:15px; font-weight:700; border:none; border-radius:9px; cursor:pointer; display:flex; align-items:center; gap:10px; box-shadow: 0 6px 16px -4px rgba(20,39,32,0.4); transition: transform .15s, box-shadow .15s; }
        .adm-submit:hover:not(:disabled) { transform: translateY(-1px); }
        .adm-submit:disabled { opacity:.65; cursor:not-allowed; box-shadow:none; transform:none; }
        .adm-seal { width:20px; height:20px; border-radius:50%; background: var(--adm-brass); display:flex; align-items:center; justify-content:center; flex-shrink:0; color:#fff; }
      `}</style>

      <div className="adm-scope">

        <p style={{ fontSize: '14px', color: '#56647B', margin: '4px 0 28px', fontFamily: "'Public Sans', sans-serif" }}>
          Complete all three sections below to file a new admission record.
        </p>

        {!active_session && (
          <div className="adm-alert">
            <Icon name="warning" style={{ fontSize: '22px', marginTop: '2px' }} />
            <div>
              <strong>No active session</strong>
              <span style={{ fontSize: '14px' }}>Configure an active academic session before admitting new students.</span>
            </div>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="adm-layout">

            <nav className="adm-rail">
              <div className="adm-rail-track">
                {sections.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => scrollToSection(s.id)}
                    className={`adm-rail-item ${activeSection === s.id ? 'active' : ''} ${s.complete ? 'complete' : ''}`}
                  >
                    <span className="adm-rail-numeral">{s.complete ? <CheckMark /> : s.numeral}</span>
                    <span className="adm-rail-label">{s.label}</span>
                  </button>
                ))}
              </div>
            </nav>

            <div>
              {/* 1. Academic Details */}
              <div id="section-academic" ref={el => sectionRefs.current['section-academic'] = el} className="adm-card">
                <h3 className="adm-section-title">
                  <span className="adm-icon-chip"><Icon name="book" /></span>
                  Academic Details
                </h3>

                <div className="adm-toggle-row">
                  <label className={`adm-toggle ${data.create_student_user ? 'on' : ''}`}>
                    <input type="checkbox" checked={data.create_student_user} onChange={e => setData('create_student_user', e.target.checked)} />
                    Create Portal Account for Student
                  </label>
                  <label className={`adm-toggle ${data.create_parent_user ? 'on' : ''}`}>
                    <input type="checkbox" checked={data.create_parent_user} onChange={e => setData('create_parent_user', e.target.checked)} />
                    Create Portal Account for Parents
                  </label>
                </div>

                <div className="adm-grid">
                  <div className="adm-field">
                    <label className="adm-label">Campus <span className="adm-req">*</span></label>
                    <select className={`adm-input ${errors.campus_id ? 'adm-input-error' : ''}`} value={data.campus_id} onChange={e => setData('campus_id', e.target.value)} required>
                      <option value="">-- Select Campus --</option>
                      {campuses?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {errors.campus_id && <span className="adm-error-text">{errors.campus_id}</span>}
                  </div>

                  <div className="adm-field">
                    <label className="adm-label">Student Category</label>
                    <select className="adm-input" value={data.category_id} onChange={e => setData('category_id', e.target.value)}>
                      <option value="">General / Regular</option>
                      {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {errors.category_id && <span className="adm-error-text">{errors.category_id}</span>}
                  </div>

                  <div className="adm-field">
                    <label className="adm-label">House (Optional)</label>
                    <select className="adm-input" value={data.house_id} onChange={e => setData('house_id', e.target.value)}>
                      <option value="">-- Select House --</option>
                      {houses?.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                    {errors.house_id && <span className="adm-error-text">{errors.house_id}</span>}
                  </div>

                  <div className="adm-field">
                    <label className="adm-label">Class <span className="adm-req">*</span></label>
                    <select className={`adm-input ${errors.class_id ? 'adm-input-error' : ''}`} value={data.class_id} onChange={e => setData('class_id', e.target.value)} required>
                      <option value="">-- Select Class --</option>
                      {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {errors.class_id && <span className="adm-error-text">{errors.class_id}</span>}
                  </div>

                  <div className="adm-field">
                    <label className="adm-label">Section <span className="adm-req">*</span></label>
                    <select className={`adm-input ${errors.section_id ? 'adm-input-error' : ''}`} value={data.section_id} onChange={e => setData('section_id', e.target.value)} required disabled={!data.class_id}>
                      <option value="">-- Select Section --</option>
                      {availableSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    {errors.section_id && <span className="adm-error-text">{errors.section_id}</span>}
                  </div>

                  <div className="adm-field">
                    <label className="adm-label">Roll Number</label>
                    <input className="adm-input mono" type="text" placeholder="e.g. 101" value={data.roll_no} onChange={e => setData('roll_no', e.target.value)} />
                    {errors.roll_no && <span className="adm-error-text">{errors.roll_no}</span>}
                  </div>

                  <div className="adm-field">
                    <label className="adm-label">Admission Date <span className="adm-req">*</span></label>
                    <input className="adm-input mono" type="date" value={data.admission_date} onChange={e => setData('admission_date', e.target.value)} required />
                    {errors.admission_date && <span className="adm-error-text">{errors.admission_date}</span>}
                  </div>
                </div>
              </div>

              {/* 2. Personal Information */}
              <div id="section-personal" ref={el => sectionRefs.current['section-personal'] = el} className="adm-card">
                <h3 className="adm-section-title">
                  <span className="adm-icon-chip forest"><Icon name="user" /></span>
                  Student Personal Information
                </h3>

                <div className="adm-photo-row">
                  <div className="adm-id-frame">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" />
                    ) : (
                      <Icon name="camera" className="adm-camera-hint" style={{ fontSize: '26px' }} />
                    )}
                    <input type="file" accept="image/*" onChange={handlePhotoChange} title="Click to upload profile photo" />
                  </div>
                  <div className="adm-photo-copy">
                    <h4>Student Profile Photo</h4>
                    <p>Click the frame to upload an image.<br />Recommended size: 300×300px. Max size: 2MB.</p>
                    {errors.photo && <span className="adm-error-text">{errors.photo}</span>}
                  </div>
                </div>

                <div className="adm-grid">
                  <div className="adm-field">
                    <label className="adm-label">First Name <span className="adm-req">*</span></label>
                    <input className={`adm-input ${errors.first_name ? 'adm-input-error' : ''}`} placeholder="e.g. Abdullah" type="text" value={data.first_name} onChange={e => setData('first_name', e.target.value)} required />
                    {errors.first_name && <span className="adm-error-text">{errors.first_name}</span>}
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">Last Name</label>
                    <input className="adm-input" placeholder="e.g. Al Noman" type="text" value={data.last_name} onChange={e => setData('last_name', e.target.value)} />
                    {errors.last_name && <span className="adm-error-text">{errors.last_name}</span>}
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">Date of Birth <span className="adm-req">*</span></label>
                    <input className={`adm-input mono ${errors.date_of_birth ? 'adm-input-error' : ''}`} type="date" value={data.date_of_birth} onChange={e => setData('date_of_birth', e.target.value)} required />
                    {errors.date_of_birth && <span className="adm-error-text">{errors.date_of_birth}</span>}
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">Birth Certificate No.</label>
                    <input className="adm-input mono" type="text" placeholder="17-digit registration number" value={data.birth_certificate_no} onChange={e => setData('birth_certificate_no', e.target.value)} />
                    {errors.birth_certificate_no && <span className="adm-error-text">{errors.birth_certificate_no}</span>}
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">National ID (If any)</label>
                    <input className="adm-input mono" type="text" placeholder="For older students" value={data.national_id} onChange={e => setData('national_id', e.target.value)} />
                    {errors.national_id && <span className="adm-error-text">{errors.national_id}</span>}
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">Gender <span className="adm-req">*</span></label>
                    <select className={`adm-input ${errors.gender ? 'adm-input-error' : ''}`} value={data.gender} onChange={e => setData('gender', e.target.value)} required>
                      <option value="">-- Select Gender --</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && <span className="adm-error-text">{errors.gender}</span>}
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">Blood Group</label>
                    <select className="adm-input" value={data.blood_group} onChange={e => setData('blood_group', e.target.value)}>
                      <option value="">-- Select Blood Group --</option>
                      <option value="A+">A+</option><option value="O+">O+</option><option value="B+">B+</option><option value="AB+">AB+</option>
                      <option value="A-">A-</option><option value="O-">O-</option><option value="B-">B-</option><option value="AB-">AB-</option>
                    </select>
                    {errors.blood_group && <span className="adm-error-text">{errors.blood_group}</span>}
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">Religion</label>
                    <input className="adm-input" placeholder="e.g. Islam" type="text" value={data.religion} onChange={e => setData('religion', e.target.value)} />
                    {errors.religion && <span className="adm-error-text">{errors.religion}</span>}
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">Mother Tongue</label>
                    <input className="adm-input" type="text" value={data.mother_tongue} onChange={e => setData('mother_tongue', e.target.value)} />
                    {errors.mother_tongue && <span className="adm-error-text">{errors.mother_tongue}</span>}
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">Nationality <span className="adm-req">*</span></label>
                    <input className="adm-input" type="text" value={data.nationality} onChange={e => setData('nationality', e.target.value)} required />
                    {errors.nationality && <span className="adm-error-text">{errors.nationality}</span>}
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">Student's Phone (Optional)</label>
                    <input className="adm-input mono" placeholder="01XXXXXXXXX" type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                    {errors.phone && <span className="adm-error-text">{errors.phone}</span>}
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">Student's Email (Optional)</label>
                    <input className="adm-input" type="email" placeholder="student@example.com" value={data.email} onChange={e => setData('email', e.target.value)} />
                    {errors.email && <span className="adm-error-text">{errors.email}</span>}
                  </div>

                  <div className="adm-field span-2">
                    <label className="adm-label">Previous School Details (Transfer Info)</label>
                    <textarea className="adm-input" placeholder="Name of previous school, TC Number, etc." value={data.previous_school_details} onChange={e => setData('previous_school_details', e.target.value)} />
                    {errors.previous_school_details && <span className="adm-error-text">{errors.previous_school_details}</span>}
                  </div>

                  <div className="adm-field span-2">
                    <label className="adm-label">Medical History &amp; Allergies (If any)</label>
                    <textarea className="adm-input" placeholder="Mention if the student has asthma, allergies to specific foods, etc." value={data.medical_history} onChange={e => setData('medical_history', e.target.value)} />
                    {errors.medical_history && <span className="adm-error-text">{errors.medical_history}</span>}
                  </div>

                  <div className="adm-field span-2">
                    <label className="adm-label">Present Address <span className="adm-req">*</span></label>
                    <textarea className={`adm-input ${errors.present_address ? 'adm-input-error' : ''}`} style={{ minHeight: '80px' }} placeholder="Enter full present address..." value={data.present_address} onChange={e => setData('present_address', e.target.value)} required />
                    {errors.present_address && <span className="adm-error-text">{errors.present_address}</span>}
                  </div>
                  <div className="adm-field span-2">
                    <label className="adm-label">Permanent Address <span className="adm-req">*</span></label>
                    <textarea className={`adm-input ${errors.permanent_address ? 'adm-input-error' : ''}`} style={{ minHeight: '80px' }} placeholder="Enter full permanent address..." value={data.permanent_address} onChange={e => setData('permanent_address', e.target.value)} required />
                    {errors.permanent_address && <span className="adm-error-text">{errors.permanent_address}</span>}
                  </div>
                </div>
              </div>

              {/* 3. Guardian Information */}
              <div id="section-guardian" ref={el => sectionRefs.current['section-guardian'] = el} className="adm-card">
                <h3 className="adm-section-title">
                  <span className="adm-icon-chip"><Icon name="users" /></span>
                  Guardian / Parents Information
                </h3>

                <div className="adm-sibling-box">
                  <label className="adm-sibling-toggle">
                    <input type="checkbox" checked={isSibling} onChange={e => setIsSibling(e.target.checked)} />
                    Already have a sibling in this school? (আগে থেকে কোনো ভাই/বোন এই স্কুলে পড়ে?)
                  </label>

                  {isSibling && (
                    <div className="adm-lookup">
                      <input
                        className="adm-input"
                        placeholder="Enter Sibling's Admission No OR Father's Phone"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSearchGuardian())}
                      />
                      <button type="button" onClick={handleSearchGuardian} disabled={searching} className="adm-lookup-btn">
                        <SearchIcon /> {searching ? 'Searching...' : 'Search'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="adm-grid">
                  <div className="adm-field">
                    <label className="adm-label">Father's Name <span className="adm-req">*</span></label>
                    <input className={`adm-input ${errors.father_name ? 'adm-input-error' : ''}`} type="text" value={data.father_name} onChange={e => setData('father_name', e.target.value)} required />
                    {errors.father_name && <span className="adm-error-text">{errors.father_name}</span>}
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">Father's Phone <span className="adm-req">*</span></label>
                    <input className={`adm-input mono ${errors.father_phone ? 'adm-input-error' : ''}`} type="text" placeholder="01XXXXXXXXX" value={data.father_phone} onChange={e => setData('father_phone', e.target.value)} required />
                    {errors.father_phone && <span className="adm-error-text">{errors.father_phone}</span>}
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">Mother's Name <span className="adm-req">*</span></label>
                    <input className={`adm-input ${errors.mother_name ? 'adm-input-error' : ''}`} type="text" value={data.mother_name} onChange={e => setData('mother_name', e.target.value)} required />
                    {errors.mother_name && <span className="adm-error-text">{errors.mother_name}</span>}
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">Mother's Phone</label>
                    <input className="adm-input mono" type="text" placeholder="01XXXXXXXXX" value={data.mother_phone} onChange={e => setData('mother_phone', e.target.value)} />
                    {errors.mother_phone && <span className="adm-error-text">{errors.mother_phone}</span>}
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">Guardian Email</label>
                    <input className="adm-input" type="email" placeholder="example@gmail.com" value={data.guardian_email} onChange={e => setData('guardian_email', e.target.value)} />
                    {errors.guardian_email && <span className="adm-error-text">{errors.guardian_email}</span>}
                  </div>
                </div>
              </div>

              <div className="adm-footer">
                <Link href={route('admin.students.index')} className="adm-cancel">Cancel</Link>
                <button type="submit" className="adm-submit" disabled={processing || !active_session}>
                  <span className="adm-seal"><CheckMark /></span>
                  {processing ? 'Processing Registration...' : 'Confirm Admission'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}