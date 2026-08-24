import React, { useState } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';

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

  /* Live preview styles generated dynamically */
  function renderCertificatePreview() {
    const style = data.design_style;
    const customBg = bgPreview ? { backgroundImage: `url(${bgPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};

    if (style === 'modern') {
      return (
        <div style={{ width: '100%', aspectRatio: '1.414 / 1', background: '#fff', ...customBg, borderLeft: '6px solid #6B8F71', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 'clamp(20px,5%,48px)', fontFamily: "'Inter', sans-serif" }}>
          <div>
            <div style={{ fontSize: 'clamp(10px,1.3vw,12px)', letterSpacing: '3px', textTransform: 'uppercase', color: '#6B7280', fontWeight: 600 }}>Certificate</div>
            <h1 style={{ fontSize: 'clamp(22px,3.4vw,32px)', color: '#111827', margin: '8px 0 0 0', fontWeight: 700, letterSpacing: '-0.5px' }}>{data.title}</h1>
          </div>
          <div style={{ fontSize: 'clamp(12px,1.6vw,14px)', color: '#374151', lineHeight: 1.7, maxWidth: '75%' }}>
            <p style={{ margin: '0 0 6px 0', color: '#6B7280' }}>Presented to</p>
            <h2 style={{ fontSize: 'clamp(18px,2.6vw,24px)', color: '#111827', borderBottom: '2px solid #111827', display: 'inline-block', paddingBottom: '4px', margin: '0 0 14px 0', fontWeight: 700 }}>[ Student Name ]</h2>
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
        <div style={{ width: '100%', aspectRatio: '1.414 / 1', background: '#F7F5EF', ...customBg, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', fontFamily: "'EB Garamond', Georgia, serif" }}>
          <div style={{ background: '#1E3A5F', padding: 'clamp(10px,2%,16px) 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <ShieldIcon />
            <span style={{ color: '#C9A227', fontSize: 'clamp(10px,1.3vw,13px)', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600 }}>Official Certificate</span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', textAlign: 'center', padding: 'clamp(16px,4%,36px)' }}>
            <h1 style={{ fontSize: 'clamp(20px,3vw,28px)', color: '#1E3A5F', margin: '4px 0 0 0', fontWeight: 700 }}>{data.title}</h1>
            <div style={{ fontSize: 'clamp(12px,1.6vw,14px)', color: '#3b3b3b', lineHeight: 1.8, maxWidth: '80%' }}>
              <p style={{ margin: '0 0 8px 0', fontStyle: 'italic' }}>This certifies that</p>
              <h2 style={{ fontSize: 'clamp(18px,2.6vw,23px)', color: '#1E3A5F', borderBottom: '2px solid #C9A227', display: 'inline-block', paddingBottom: '4px', margin: '0 0 12px 0', minWidth: '220px' }}>[ Student Name ]</h2>
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
        <div style={{ width: '100%', aspectRatio: '1.414 / 1', background: bgPreview ? undefined : 'linear-gradient(135deg, #FFF4D6 0%, #FFD9C2 55%, #FFE3F1 100%)', ...customBg, border: '6px dashed #7C3AED', borderRadius: '26px', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', textAlign: 'center', padding: 'clamp(18px,4.5%,40px)', fontFamily: "'Baloo 2', sans-serif" }}>
          <div style={{ position: 'absolute', top: '10px', right: '16px' }}><MedalBadge /></div>
          <div>
            <div style={{ fontSize: 'clamp(10px,1.3vw,12px)', letterSpacing: '2px', textTransform: 'uppercase', color: '#7C3AED', fontWeight: 700 }}>Great Job!</div>
            <h1 style={{ fontSize: 'clamp(22px,3.4vw,30px)', color: '#7C3AED', margin: '6px 0 0 0', fontWeight: 700 }}>{data.title}</h1>
          </div>
          <div style={{ fontSize: 'clamp(12px,1.6vw,14px)', color: '#4B5563', lineHeight: 1.7, maxWidth: '82%' }}>
            <p style={{ margin: '0 0 8px 0' }}>This certificate is awarded to</p>
            <h2 style={{ fontSize: 'clamp(18px,2.6vw,24px)', color: '#0D9488', display: 'inline-block', padding: '4px 18px', margin: '0 0 14px 0', background: '#fff', borderRadius: '999px', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>[ Student Name ]</h2>
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
        <div style={{ width: '100%', aspectRatio: '1.414 / 1', background: '#fff', ...customBg, overflow: 'hidden', position: 'relative', display: 'flex', fontFamily: "'Inter', sans-serif" }}>
          <div style={{ width: '30%', background: '#1F2937', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 'clamp(12px,3%,24px)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '100%', background: '#D97706' }} />
            <div style={{ fontSize: 'clamp(9px,1.2vw,11px)', letterSpacing: '2px', textTransform: 'uppercase', color: '#D97706', fontWeight: 700 }}>Certificate</div>
            <div style={{ fontSize: 'clamp(10px,1.3vw,12px)', color: '#9CA3AF', lineHeight: 1.5 }}>{data.template_type}</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 'clamp(16px,4%,36px)' }}>
            <h1 style={{ fontSize: 'clamp(20px,3vw,28px)', color: '#111827', margin: 0, fontWeight: 800, letterSpacing: '-0.5px' }}>{data.title}</h1>
            <div style={{ fontSize: 'clamp(12px,1.6vw,14px)', color: '#374151', lineHeight: 1.7 }}>
              <p style={{ margin: '0 0 6px 0', color: '#6B7280' }}>This is to certify that</p>
              <h2 style={{ fontSize: 'clamp(18px,2.6vw,23px)', color: '#111827', borderBottom: '3px solid #D97706', display: 'inline-block', paddingBottom: '4px', margin: '0 0 12px 0', fontWeight: 700 }}>[ Student Name ]</h2>
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
      <div style={{ width: '100%', aspectRatio: '1.414 / 1', background: '#FBF8F1', ...customBg, boxShadow: 'inset 0 0 0 3px #FBF8F1, inset 0 0 0 5px #B08D57', padding: 'clamp(20px,5%,44px)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', textAlign: 'center', fontFamily: "'EB Garamond', Georgia, serif" }}>
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
          <h2 style={{ fontSize: 'clamp(18px,2.6vw,24px)', color: '#7C2D3A', borderBottom: '2px solid #B08D57', display: 'inline-block', paddingBottom: '5px', margin: '0 0 15px 0', minWidth: '220px', fontFamily: "'Playfair Display', serif" }}>[ Student Name ]</h2>
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

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <AuthenticatedLayout>
      <Head title={isEdit ? 'Edit Certificate' : 'Create Certificate'}>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=EB+Garamond:ital@0;1&family=Inter:wght@400;500;600;700;800&family=Baloo+2:wght@600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Documents / Certificates</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">{isEdit ? 'Edit Certificate Template' : 'Create Live Certificate Template'}</h1>
          </div>
          <Link href={route('admin.documents.certificatetemplates.index')} className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm">
            <Icon name="arrow-left" className="w-4 h-4" /> Back to List
          </Link>
        </div>

        {/* Split Layout: Form & Preview */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ================= LEFT SIDE: EDIT FORM ================= */}
          <div className="w-full lg:w-[500px] xl:w-[600px] shrink-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
               <h3 className="text-lg font-bold text-slate-900">Template Settings</h3>
            </div>

            <form onSubmit={submit} className="p-6 space-y-6">
              
              {/* Design Picker */}
              <div className="pb-6 border-b border-slate-100">
                <div className="mb-3">
                  <strong className="text-sm font-semibold text-slate-800">Choose a Design</strong>
                  <p className="text-xs text-slate-500 mt-1">Pick a starting look — a custom background image below will override it.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CERTIFICATE_DESIGNS.map(d => (
                    <div
                      key={d.key}
                      onClick={() => setData('design_style', d.key)}
                      className={`cursor-pointer border-2 rounded-xl p-3 transition-all bg-white hover:-translate-y-0.5 ${data.design_style === d.key ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-slate-200 hover:border-indigo-300'}`}
                    >
                      <div className="w-full h-10 rounded-lg mb-2 relative" style={{ background: d.swatch }}>
                        {data.design_style === d.key && <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">✓</span>}
                      </div>
                      <div className="font-bold text-xs text-slate-800 leading-tight">{d.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{d.blurb}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Campus *</label>
                  <select value={data.campus_id} onChange={(e) => setData('campus_id', e.target.value)} disabled={!isSuperAdmin} required className={`${inputClass} ${!isSuperAdmin ? 'bg-slate-100 opacity-70' : 'bg-white'}`}>
                    <option value="" disabled>Select Campus</option>
                    {campuses?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Template Title (Headline) *</label>
                  <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} required className={inputClass} />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Template Type *</label>
                  <select value={data.template_type} onChange={e => setData('template_type', e.target.value)} required className={`${inputClass} bg-white`}>
                    <option value="Merit">Merit / Academic Excellence</option>
                    <option value="Course Completion">Course Completion</option>
                    <option value="Participation">Participation</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Main Content Body *</label>
                  <textarea rows="3" value={data.content_body} onChange={e => setData('content_body', e.target.value)} required className={`${inputClass} resize-none`}></textarea>
                </div>

                {/* Background File Upload */}
                <div className="sm:col-span-2">
                  <label className={labelClass}>Background Border Image (A4 Landscape)</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => handleImageChange('background_image', e.target.files[0], setBgPreview)} 
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all border border-slate-200 rounded-xl bg-slate-50 cursor-pointer"
                  />
                  <small className="text-xs text-slate-500 mt-1.5 block">Optional — overrides the chosen design's default background.</small>
                </div>

                {/* Signature 1 */}
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
                  <strong className="text-sm font-bold text-slate-800 block border-b border-slate-200 pb-2">Left Signature</strong>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Title (e.g. Principal)</label>
                    <input type="text" value={data.signature_1_title} onChange={e => setData('signature_1_title', e.target.value)} className={`${inputClass} py-2 px-3 text-xs`} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Upload Signature</label>
                    <input type="file" accept="image/*" onChange={e => handleImageChange('signature_1_image', e.target.files[0], setSig1Preview)} className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 cursor-pointer border border-slate-200 rounded-lg bg-white" />
                  </div>
                </div>

                {/* Signature 2 */}
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
                  <strong className="text-sm font-bold text-slate-800 block border-b border-slate-200 pb-2">Right Signature</strong>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Title (e.g. Director)</label>
                    <input type="text" value={data.signature_2_title} onChange={e => setData('signature_2_title', e.target.value)} className={`${inputClass} py-2 px-3 text-xs`} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Upload Signature</label>
                    <input type="file" accept="image/*" onChange={e => handleImageChange('signature_2_image', e.target.files[0], setSig2Preview)} className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 cursor-pointer border border-slate-200 rounded-lg bg-white" />
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-3 cursor-pointer group w-max">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                        className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-0 checked:bg-emerald-600 checked:border-emerald-600 cursor-pointer transition-colors"
                      />
                      <svg className="absolute w-3.5 h-3.5 top-[3px] left-[3px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Active Template</span>
                  </label>
                </div>

              </div>

              {/* Action Button */}
              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button type="submit" disabled={processing} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
                  <Icon name="save" className="w-4 h-4" />
                  {processing ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>

          {/* ================= RIGHT SIDE: LIVE PREVIEW ================= */}
          <div className="w-full flex-1 lg:sticky lg:top-24 flex flex-col items-center">
            <div className="w-full flex items-center justify-center gap-2 mb-4 bg-slate-900 text-white py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live Preview
            </div>
            <div className="w-full rounded-2xl shadow-xl border border-slate-200 overflow-hidden bg-white ring-8 ring-slate-50">
              {renderCertificatePreview()}
            </div>
          </div>

        </div>
      </div>
    </AuthenticatedLayout>
  );
}