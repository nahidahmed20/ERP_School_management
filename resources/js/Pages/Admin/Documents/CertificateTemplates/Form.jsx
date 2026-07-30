import React, { useState } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';

/* ============================================================
   5 selectable certificate designs. Each design has its own
   colors, fonts and layout — not just a palette swap — so the
   preview genuinely changes shape when the user picks a new one.
   ============================================================ */
const CERTIFICATE_DESIGNS = [
  { key: 'classic',   name: 'Classic Gold',    blurb: 'Ivory & gold, ornate border',   swatch: 'linear-gradient(135deg,#FBF8F1,#EFE3C8)' },
  { key: 'modern',    name: 'Modern Minimal',  blurb: 'Clean lines, left-aligned',     swatch: 'linear-gradient(135deg,#FFFFFF,#EDEFF2)' },
  { key: 'academic',  name: 'Academic Navy',   blurb: 'Formal banner & seal',          swatch: 'linear-gradient(135deg,#1E3A5F,#274a75)' },
  { key: 'playful',   name: 'Playful Kids',    blurb: 'Bright, scalloped border',      swatch: 'linear-gradient(135deg,#FFE3B0,#FBC7DE)' },
  { key: 'corporate', name: 'Corporate Pro',   swatch: 'linear-gradient(135deg,#1F2937,#33465b)', blurb: 'Charcoal sidebar, bold' },
];

/* Small shared bits used inside multiple preview designs */
const SigImg = ({ src, height = 38 }) =>
  src ? <img src={src} alt="signature" style={{ height, objectFit: 'contain' }} /> : <div style={{ height }} />;

const FlourishCorner = ({ style }) => (
  <svg width="34" height="34" viewBox="0 0 34 34" style={style} fill="none">
    <path d="M2 2 Q2 18 18 18" stroke="#B08D57" strokeWidth="1.4" />
    <circle cx="2" cy="2" r="2.2" fill="#B08D57" />
  </svg>
);

const ShieldIcon = ({ color = '#C9A227', size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2 L20 5 V11 C20 16 16.5 20 12 22 C7.5 20 4 16 4 11 V5 Z" fill={color} opacity="0.95" />
    <path d="M8.5 12 L11 14.5 L16 9" stroke="#1E3A5F" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MedalBadge = ({ size = 46 }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
    <path d="M20 30 L14 52 L24 47 L30 56 L36 47 L46 52 L40 30 Z" fill="#F59E0B" />
    <circle cx="30" cy="22" r="15" fill="#FBBF24" stroke="#F59E0B" strokeWidth="3" />
    <path d="M30 13 L32.3 18.8 L38.5 19.3 L33.8 23.4 L35.2 29.5 L30 26.2 L24.8 29.5 L26.2 23.4 L21.5 19.3 L27.7 18.8 Z" fill="#fff" />
  </svg>
);

export default function CertificateForm({ item, campuses, activeCampusId }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, processing, errors } = useForm({
    _method: isEdit ? 'put' : 'post',
    campus_id: item?.campus_id ?? activeCampusId,
    title: item?.title ?? 'Certificate of Excellence',
    template_type: item?.template_type ?? 'Merit',
    design_style: item?.design_style ?? 'classic',
    content_body: item?.content_body ?? 'For outstanding academic performance and dedication during the semester.',
    signature_1_title: item?.signature_1_title ?? 'Principal',
    signature_2_title: item?.signature_2_title ?? 'Director',
    is_active: item?.is_active ?? true,
    background_image: null,
    signature_1_image: null,
    signature_2_image: null,
  });

  const [bgPreview, setBgPreview] = useState(item?.background_image ? `/storage/${item.background_image}` : null);
  const [sig1Preview, setSig1Preview] = useState(item?.signature_1_image ? `/storage/${item.signature_1_image}` : null);
  const [sig2Preview, setSig2Preview] = useState(item?.signature_2_image ? `/storage/${item.signature_2_image}` : null);

  const handleImageChange = (field, file, setPreview) => {
    setData(field, file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  function submit(e) {
    e.preventDefault();
    post(isEdit ? route('admin.documents.certificatetemplates.update', item.id) : route('admin.documents.certificatetemplates.store'));
  }

  /* ============================================================
     Live preview — one render function, switches on data.design_style.
     A custom uploaded background image always overrides the design's
     own default background, in every design.
     ============================================================ */
  function renderCertificatePreview() {
    const style = data.design_style;
    const customBg = bgPreview ? { backgroundImage: `url(${bgPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};

    if (style === 'modern') {
      return (
        <div style={{
          width: '100%', aspectRatio: '1.414 / 1', background: '#fff', ...customBg,
          borderLeft: '6px solid #6B8F71', overflow: 'hidden', position: 'relative',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: 'clamp(20px,5%,48px)', fontFamily: "'Inter', sans-serif",
        }}>
          <div>
            <div style={{ fontSize: 'clamp(10px,1.3vw,12px)', letterSpacing: '3px', textTransform: 'uppercase', color: '#6B7280', fontWeight: 600 }}>Certificate</div>
            <h1 style={{ fontSize: 'clamp(22px,3.4vw,32px)', color: '#111827', margin: '8px 0 0 0', fontWeight: 700, letterSpacing: '-0.5px' }}>{data.title}</h1>
          </div>
          <div style={{ fontSize: 'clamp(12px,1.6vw,14px)', color: '#374151', lineHeight: 1.7, maxWidth: '75%' }}>
            <p style={{ margin: '0 0 6px 0', color: '#6B7280' }}>Presented to</p>
            <h2 style={{ fontSize: 'clamp(18px,2.6vw,24px)', color: '#111827', borderBottom: '2px solid #111827', display: 'inline-block', paddingBottom: '4px', margin: '0 0 14px 0', fontWeight: 700 }}>
              [ Student Name ]
            </h2>
            <div>{data.content_body}</div>
          </div>
          <div style={{ display: 'flex', gap: '48px', marginTop: '16px' }}>
            <div style={{ textAlign: 'left' }}>
              <SigImg src={sig1Preview} />
              <div style={{ borderTop: '1px solid #111827', paddingTop: '5px', marginTop: '5px', fontSize: '11px', color: '#111827', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{data.signature_1_title || 'Signature'}</div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <SigImg src={sig2Preview} />
              <div style={{ borderTop: '1px solid #111827', paddingTop: '5px', marginTop: '5px', fontSize: '11px', color: '#111827', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{data.signature_2_title || 'Signature'}</div>
            </div>
          </div>
        </div>
      );
    }

    if (style === 'academic') {
      return (
        <div style={{
          width: '100%', aspectRatio: '1.414 / 1', background: '#F7F5EF', ...customBg,
          overflow: 'hidden', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
          display: 'flex', flexDirection: 'column', fontFamily: "'EB Garamond', Georgia, serif",
        }}>
          <div style={{ background: '#1E3A5F', padding: 'clamp(10px,2%,16px) 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <ShieldIcon />
            <span style={{ color: '#C9A227', fontSize: 'clamp(10px,1.3vw,13px)', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600 }}>Official Certificate</span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', textAlign: 'center', padding: 'clamp(16px,4%,36px)' }}>
            <h1 style={{ fontSize: 'clamp(20px,3vw,28px)', color: '#1E3A5F', margin: '4px 0 0 0', fontWeight: 700 }}>{data.title}</h1>
            <div style={{ fontSize: 'clamp(12px,1.6vw,14px)', color: '#3b3b3b', lineHeight: 1.8, maxWidth: '80%' }}>
              <p style={{ margin: '0 0 8px 0', fontStyle: 'italic' }}>This certifies that</p>
              <h2 style={{ fontSize: 'clamp(18px,2.6vw,23px)', color: '#1E3A5F', borderBottom: '2px solid #C9A227', display: 'inline-block', paddingBottom: '4px', margin: '0 0 12px 0', minWidth: '220px' }}>
                [ Student Name ]
              </h2>
              <div>{data.content_body}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-end' }}>
              <div style={{ textAlign: 'left', fontSize: '10px', color: '#9CA3AF' }}>Certificate No. ______</div>
              <div style={{ display: 'flex', gap: '40px' }}>
                <div style={{ textAlign: 'center', width: '130px' }}>
                  <SigImg src={sig1Preview} />
                  <div style={{ borderTop: '1px solid #1E3A5F', paddingTop: '4px', fontSize: '11px', color: '#1E3A5F', fontWeight: 600 }}>{data.signature_1_title || 'Signature'}</div>
                </div>
                <div style={{ textAlign: 'center', width: '130px' }}>
                  <SigImg src={sig2Preview} />
                  <div style={{ borderTop: '1px solid #1E3A5F', paddingTop: '4px', fontSize: '11px', color: '#1E3A5F', fontWeight: 600 }}>{data.signature_2_title || 'Signature'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (style === 'playful') {
      return (
        <div style={{
          width: '100%', aspectRatio: '1.414 / 1',
          background: bgPreview ? undefined : 'linear-gradient(135deg, #FFF4D6 0%, #FFD9C2 55%, #FFE3F1 100%)', ...customBg,
          border: '6px dashed #7C3AED', borderRadius: '26px', overflow: 'hidden', position: 'relative',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', alignItems: 'center', textAlign: 'center',
          padding: 'clamp(18px,4.5%,40px)', fontFamily: "'Baloo 2', sans-serif",
        }}>
          <div style={{ position: 'absolute', top: '10px', right: '16px' }}><MedalBadge /></div>
          <div>
            <div style={{ fontSize: 'clamp(10px,1.3vw,12px)', letterSpacing: '2px', textTransform: 'uppercase', color: '#7C3AED', fontWeight: 700 }}>Great Job!</div>
            <h1 style={{ fontSize: 'clamp(22px,3.4vw,30px)', color: '#7C3AED', margin: '6px 0 0 0', fontWeight: 700 }}>{data.title}</h1>
          </div>
          <div style={{ fontSize: 'clamp(12px,1.6vw,14px)', color: '#4B5563', lineHeight: 1.7, maxWidth: '82%' }}>
            <p style={{ margin: '0 0 8px 0' }}>This certificate is awarded to</p>
            <h2 style={{ fontSize: 'clamp(18px,2.6vw,24px)', color: '#0D9488', display: 'inline-block', padding: '4px 18px', margin: '0 0 14px 0', background: '#fff', borderRadius: '999px', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
              [ Student Name ]
            </h2>
            <div>{data.content_body}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', width: '100%' }}>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.7)', borderRadius: '14px', padding: '8px 16px' }}>
              <SigImg src={sig1Preview} />
              <div style={{ fontSize: '11px', color: '#7C3AED', fontWeight: 700, marginTop: '4px' }}>{data.signature_1_title || 'Signature'}</div>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.7)', borderRadius: '14px', padding: '8px 16px' }}>
              <SigImg src={sig2Preview} />
              <div style={{ fontSize: '11px', color: '#7C3AED', fontWeight: 700, marginTop: '4px' }}>{data.signature_2_title || 'Signature'}</div>
            </div>
          </div>
        </div>
      );
    }

    if (style === 'corporate') {
      return (
        <div style={{
          width: '100%', aspectRatio: '1.414 / 1', background: '#fff', ...customBg,
          overflow: 'hidden', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
          display: 'flex', fontFamily: "'Inter', sans-serif",
        }}>
          <div style={{ width: '30%', background: '#1F2937', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 'clamp(12px,3%,24px)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '100%', background: '#D97706' }} />
            <div style={{ fontSize: 'clamp(9px,1.2vw,11px)', letterSpacing: '2px', textTransform: 'uppercase', color: '#D97706', fontWeight: 700 }}>Certificate</div>
            <div style={{ fontSize: 'clamp(10px,1.3vw,12px)', color: '#9CA3AF', lineHeight: 1.5 }}>{data.template_type}</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 'clamp(16px,4%,36px)' }}>
            <h1 style={{ fontSize: 'clamp(20px,3vw,28px)', color: '#111827', margin: 0, fontWeight: 800, letterSpacing: '-0.5px' }}>{data.title}</h1>
            <div style={{ fontSize: 'clamp(12px,1.6vw,14px)', color: '#374151', lineHeight: 1.7 }}>
              <p style={{ margin: '0 0 6px 0', color: '#6B7280' }}>This is to certify that</p>
              <h2 style={{ fontSize: 'clamp(18px,2.6vw,23px)', color: '#111827', borderBottom: '3px solid #D97706', display: 'inline-block', paddingBottom: '4px', margin: '0 0 12px 0', fontWeight: 700 }}>
                [ Student Name ]
              </h2>
              <div>{data.content_body}</div>
            </div>
            <div style={{ display: 'flex', gap: '40px' }}>
              <div style={{ textAlign: 'left' }}>
                <SigImg src={sig1Preview} />
                <div style={{ borderTop: '2px solid #D97706', paddingTop: '4px', marginTop: '4px', fontSize: '11px', color: '#111827', fontWeight: 700 }}>{data.signature_1_title || 'Signature'}</div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <SigImg src={sig2Preview} />
                <div style={{ borderTop: '2px solid #D97706', paddingTop: '4px', marginTop: '4px', fontSize: '11px', color: '#111827', fontWeight: 700 }}>{data.signature_2_title || 'Signature'}</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    /* default: classic */
    return (
      <div style={{
        width: '100%', aspectRatio: '1.414 / 1', background: '#FBF8F1', ...customBg,
        boxShadow: 'inset 0 0 0 3px #FBF8F1, inset 0 0 0 5px #B08D57, 0 20px 25px -5px rgba(0,0,0,0.1)',
        padding: 'clamp(20px,5%,44px)', position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center',
        textAlign: 'center', fontFamily: "'EB Garamond', Georgia, serif",
      }}>
        <FlourishCorner style={{ position: 'absolute', top: '10px', left: '10px' }} />
        <FlourishCorner style={{ position: 'absolute', top: '10px', right: '10px', transform: 'scaleX(-1)' }} />
        <FlourishCorner style={{ position: 'absolute', bottom: '10px', left: '10px', transform: 'scaleY(-1)' }} />
        <FlourishCorner style={{ position: 'absolute', bottom: '10px', right: '10px', transform: 'scale(-1,-1)' }} />
        <div>
          <h4 style={{ letterSpacing: '3px', textTransform: 'uppercase', color: '#B08D57', fontSize: 'clamp(10px,1.3vw,13px)', margin: 0, fontFamily: "'Playfair Display', serif" }}>Certificate of Achievement</h4>
          <h1 style={{ fontSize: 'clamp(22px,3.4vw,30px)', color: '#1F2937', margin: '10px 0 0 0', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{data.title}</h1>
        </div>
        <div style={{ fontSize: 'clamp(12px,1.6vw,14px)', color: '#334155', lineHeight: 1.8, maxWidth: '80%' }}>
          <p style={{ margin: '0 0 10px 0', fontStyle: 'italic' }}>This is proudly presented to</p>
          <h2 style={{ fontSize: 'clamp(18px,2.6vw,24px)', color: '#7C2D3A', borderBottom: '2px solid #B08D57', display: 'inline-block', paddingBottom: '5px', margin: '0 0 15px 0', minWidth: '220px', fontFamily: "'Playfair Display', serif" }}>
            [ Student Name ]
          </h2>
          <div>{data.content_body}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-end', marginTop: '16px' }}>
          <div style={{ textAlign: 'center', width: '140px' }}>
            <SigImg src={sig1Preview} />
            <div style={{ borderTop: '1px solid #B08D57', paddingTop: '5px', fontSize: '12px', color: '#1F2937', fontWeight: 700 }}>{data.signature_1_title || 'Signature'}</div>
          </div>
          <div style={{ textAlign: 'center', width: '140px' }}>
            <SigImg src={sig2Preview} />
            <div style={{ borderTop: '1px solid #B08D57', paddingTop: '5px', fontSize: '12px', color: '#1F2937', fontWeight: 700 }}>{data.signature_2_title || 'Signature'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><span className="eyebrow">Documents / Certificates</span><h1>{isEdit ? 'Edit Certificate Template' : 'Create Live Certificate Template'}</h1></div>
          <Link href={route('admin.documents.certificatetemplates.index')} className="btn btn-outline"><Icon name="arrow-left" /> Back to List</Link>
        </div>
      }
    >
      <Head title={isEdit ? 'Edit Certificate' : 'Create Certificate'}>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=EB+Garamond:ital@0;1&family=Inter:wght@400;500;600;700;800&family=Baloo+2:wght@600;700&display=swap" rel="stylesheet" />
      </Head>

      {/* Layout fix: responsive grid instead of a fixed 600px column that
          overflowed / squeezed the form on narrower screens or sidebars. */}
      <style>{`
        .cert-page-grid { display:grid; grid-template-columns: minmax(0,1fr) minmax(360px,560px); gap:20px; align-items:start; }
        @media (max-width: 1080px) { .cert-page-grid { grid-template-columns: 1fr; } }
        .cert-preview-sticky { position:sticky; top:20px; }
        @media (max-width: 1080px) { .cert-preview-sticky { position:static; } }
        .design-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; }
        /* Scoped to this page only, so it doesn't affect mm-form-grid used elsewhere in the app */
        .cert-page-grid .mm-form-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
        @media (max-width: 720px) { .cert-page-grid .mm-form-grid { grid-template-columns: 1fr; } }
        .cert-page-grid input, .cert-page-grid select, .cert-page-grid textarea { max-width: 100%; box-sizing: border-box; }
        .design-card { cursor:pointer; border:2px solid #e2e8f0; border-radius:10px; padding:10px; transition:border-color .15s, transform .15s; background:#fff; }
        .design-card:hover { transform: translateY(-2px); }
        .design-card.selected { border-color:#4f46e5; box-shadow:0 0 0 3px rgba(79,70,229,.15); }
        .design-swatch { width:100%; height:60px; border-radius:6px; margin-bottom:8px; position:relative; }
        .design-swatch .tick { position:absolute; top:6px; right:6px; width:18px; height:18px; border-radius:50%; background:#4f46e5; color:#fff; font-size:11px; display:flex; align-items:center; justify-content:center; }
      `}</style>

      <div className="cert-page-grid">

        {/* ================= LEFT SIDE: EDIT FORM ================= */}
        <div className="card mm-card">
          <div className="card-header" style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}><h3 style={{ margin: 0 }}>Template Settings</h3></div>

          <form onSubmit={submit} className="mm-form" style={{ padding: '20px' }}>

            {/* Design picker lives inside the same card, right above the fields it affects */}
            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>Choose a Design</strong>
                <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '12px' }}>Pick a starting look — a custom background image below will override it.</p>
              </div>
              <div className="design-grid">
                {CERTIFICATE_DESIGNS.map(d => (
                  <div
                    key={d.key}
                    className={`design-card${data.design_style === d.key ? ' selected' : ''}`}
                    onClick={() => setData('design_style', d.key)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setData('design_style', d.key); }}
                  >
                    <div className="design-swatch" style={{ background: d.swatch }}>
                      {data.design_style === d.key && <span className="tick">✓</span>}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>{d.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{d.blurb}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mm-form-grid">

              <label style={{ gridColumn: '1 / -1' }}><span>Campus *</span>
                <select value={data.campus_id} onChange={(e) => setData('campus_id', e.target.value)} disabled={!isSuperAdmin} required>
                  <option value="" disabled>Select Campus</option>
                  {campuses?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>

              <label><span>Template Title (Headline) *</span>
                <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} required />
              </label>

              <label><span>Template Type *</span>
                <select value={data.template_type} onChange={e => setData('template_type', e.target.value)}>
                  <option value="Merit">Merit / Achievement</option>
                  <option value="Course Completion">Course Completion</option>
                  <option value="Participation">Participation</option>
                </select>
              </label>

              <label style={{ gridColumn: '1 / -1' }}><span>Main Content Body *</span>
                <textarea rows="4" value={data.content_body} onChange={e => setData('content_body', e.target.value)} required></textarea>
              </label>

              {/* Background File Upload */}
              <label style={{ gridColumn: '1 / -1' }}><span>Background Border Image (A4 Landscape)</span>
                <input type="file" accept="image/*" onChange={e => handleImageChange('background_image', e.target.files[0], setBgPreview)} />
                <small style={{color: '#64748b'}}>Optional — overrides the chosen design's default background above.</small>
              </label>

              {/* Signature 1 */}
              <div style={{ padding: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <strong style={{ display: 'block', marginBottom: '10px' }}>Left Signature</strong>
                <label><span>Title (e.g. Principal)</span>
                  <input type="text" value={data.signature_1_title} onChange={e => setData('signature_1_title', e.target.value)} />
                </label>
                <label className="mt-2"><span>Upload Signature Image</span>
                  <input type="file" accept="image/*" onChange={e => handleImageChange('signature_1_image', e.target.files[0], setSig1Preview)} />
                </label>
              </div>

              {/* Signature 2 */}
              <div style={{ padding: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <strong style={{ display: 'block', marginBottom: '10px' }}>Right Signature</strong>
                <label><span>Title (e.g. Director)</span>
                  <input type="text" value={data.signature_2_title} onChange={e => setData('signature_2_title', e.target.value)} />
                </label>
                <label className="mt-2"><span>Upload Signature Image</span>
                  <input type="file" accept="image/*" onChange={e => handleImageChange('signature_2_image', e.target.files[0], setSig2Preview)} />
                </label>
              </div>

              <label className="mm-checkbox" style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} /> Active Template
              </label>

            </div>

            <div className="mm-modal-foot mt-4" style={{ paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
              <button type="submit" className="btn" disabled={processing}><Icon name="save" /> {processing ? 'Saving...' : 'Save Template'}</button>
            </div>
          </form>
        </div>

        {/* ================= RIGHT SIDE: LIVE PREVIEW ================= */}
        <div className="cert-preview-sticky" style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <div style={{ color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px' }}>Live Preview</div>
          {renderCertificatePreview()}
        </div>

      </div>
    </AuthenticatedLayout>
  );
}
