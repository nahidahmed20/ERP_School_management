import React, { useState } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';

export default function TranscriptForm({ item, campuses, activeCampusId }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, processing, errors } = useForm({
    _method: isEdit ? 'put' : 'post',
    campus_id: item?.campus_id ?? activeCampusId,
    title: item?.title ?? 'Official Academic Transcript',
    grading_system: item?.grading_system ?? 'GPA 5.0',
    header_text: item?.header_text ?? 'Record of Student Academic Performance',
    footer_text: item?.footer_text ?? 'This transcript is invalid without the official seal and signature.',
    authorized_signature_title: item?.authorized_signature_title ?? 'Controller of Examinations',
    is_active: item?.is_active ?? true,
    watermark_image: null,
    authorized_signature_image: null,
  });

  const [wmPreview, setWmPreview] = useState(item?.watermark_image ? `/storage/${item.watermark_image}` : null);
  const [sigPreview, setSigPreview] = useState(item?.authorized_signature_image ? `/storage/${item.authorized_signature_image}` : null);

  const handleImageChange = (field, file, setPreview) => {
    setData(field, file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  function submit(e) {
    e.preventDefault();
    post(isEdit ? route('admin.documents.transcripts.update', item.id) : route('admin.documents.transcripts.store'));
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><span className="eyebrow">Documents / Transcripts</span><h1>{isEdit ? 'Edit Transcript Template' : 'Create Live Transcript Template'}</h1></div>
          <Link href={route('admin.documents.transcripts.index')} className="btn btn-outline"><Icon name="arrow-left" /> Back to List</Link>
        </div>
      }
    >
      <Head title={isEdit ? 'Edit Transcript' : 'Create Transcript'} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 500px', gap: '20px', alignItems: 'start' }}>

        {/* ================= LEFT SIDE: EDIT FORM ================= */}
        <div className="card mm-card">
          <div className="card-header" style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}><h3 style={{ margin: 0 }}>Template Settings</h3></div>

          <form onSubmit={submit} className="mm-form" style={{ padding: '20px' }}>
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

              <label><span>Grading System Scale *</span>
                <input type="text" value={data.grading_system} onChange={e => setData('grading_system', e.target.value)} placeholder="e.g. GPA 5.0, Out of 100" required />
              </label>

              <label style={{ gridColumn: '1 / -1' }}><span>Header Subtitle Text</span>
                <input type="text" value={data.header_text} onChange={e => setData('header_text', e.target.value)} />
              </label>

              {/* Watermark File Upload */}
              <label style={{ gridColumn: '1 / -1' }}><span>Watermark / Background Logo</span>
                <input type="file" accept="image/*" onChange={e => handleImageChange('watermark_image', e.target.files[0], setWmPreview)} />
                <small style={{color: '#64748b'}}>Appears faded in the center of the transcript.</small>
              </label>

              {/* Signature */}
              <div style={{ gridColumn: '1 / -1', padding: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <strong style={{ display: 'block', marginBottom: '10px' }}>Authorized Signature</strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <label><span>Signatory Title</span>
                    <input type="text" value={data.authorized_signature_title} onChange={e => setData('authorized_signature_title', e.target.value)} />
                  </label>
                  <label><span>Upload Signature</span>
                    <input type="file" accept="image/*" onChange={e => handleImageChange('authorized_signature_image', e.target.files[0], setSigPreview)} />
                  </label>
                </div>
              </div>

              <label style={{ gridColumn: '1 / -1' }}><span>Footer / Disclaimer Text</span>
                <textarea rows="3" value={data.footer_text} onChange={e => setData('footer_text', e.target.value)}></textarea>
              </label>

              <label className="mm-checkbox" style={{ gridColumn: '1 / -1' }}>
                <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} /> Active Template
              </label>

            </div>

            <div className="mm-modal-foot mt-4" style={{ paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
              <button type="submit" className="btn" disabled={processing}><Icon name="save" /> {processing ? 'Saving...' : 'Save Template'}</button>
            </div>
          </form>
        </div>

        {/* ================= RIGHT SIDE: LIVE PREVIEW ================= */}
        <div style={{ position: 'sticky', top: '20px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>

          <div style={{ color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px' }}>Live Preview</div>

          {/* A4 Portrait Box */}
          <div style={{
            width: '100%',
            maxWidth: '500px',
            background: '#fff',
            padding: '30px',
            position: 'relative',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            fontFamily: 'Arial, sans-serif',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>

            {/* Watermark Overlay */}
            {wmPreview && (
              <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60%', height: '60%',
                backgroundImage: `url(${wmPreview})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                opacity: '0.1', // Makes it look like a watermark
                pointerEvents: 'none'
              }}></div>
            )}

            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #1e293b', paddingBottom: '10px', marginBottom: '15px' }}>
              <h1 style={{ margin: '0 0 5px 0', fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase' }}>{data.title}</h1>
              <h3 style={{ margin: 0, fontSize: '13px', color: '#475569' }}>{data.header_text}</h3>
            </div>

            {/* Student Info Dummy */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', marginBottom: '15px' }}>
              <div><strong>Name:</strong> John Doe</div>
              <div><strong>ID:</strong> STU-12345</div>
              <div><strong>Class:</strong> 10 (Science)</div>
              <div><strong>Scale:</strong> {data.grading_system}</div>
            </div>

            {/* Dummy Grades Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '20px', zIndex: 1, position: 'relative' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'left' }}>Subject</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>Grade</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>GPA</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>Mathematics</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>A+</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>5.0</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>Physics</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>A</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>4.0</td>
                </tr>
              </tbody>
            </table>

            <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '12px', marginBottom: '40px' }}>
              CGPA: 4.50
            </div>

            {/* Signatures & Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '30px' }}>

              {/* Left Empty Signature space */}
              <div style={{ width: '120px', textAlign: 'center' }}>
                <div style={{ borderTop: '1px solid #0f172a', paddingTop: '5px', fontSize: '10px' }}>Class Teacher</div>
              </div>

              {/* Right Configurable Signature */}
              <div style={{ width: '150px', textAlign: 'center' }}>
                {sigPreview ? (
                  <img src={sigPreview} alt="Sig" style={{ height: '35px', objectFit: 'contain', marginBottom: '5px' }} />
                ) : (
                  <div style={{ height: '35px' }}></div>
                )}
                <div style={{ borderTop: '1px solid #0f172a', paddingTop: '5px', fontSize: '10px', fontWeight: 'bold' }}>
                  {data.authorized_signature_title || 'Signature'}
                </div>
              </div>

            </div>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '9px', color: '#64748b', borderTop: '1px dashed #cbd5e1', paddingTop: '10px' }}>
              {data.footer_text}
            </div>

          </div>

        </div>

      </div>
    </AuthenticatedLayout>
  );
}
