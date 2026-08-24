import React, { useState } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';

export default function TranscriptForm({ item, campuses, activeCampusId }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, processing, errors, isDirty } = useForm({
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

  const removeImage = (field, setPreview) => {
    setData(field, null);
    setPreview(null);
  };

  function submit(e) {
    e.preventDefault();
    post(isEdit ? route('admin.documents.transcripts.update', item.id) : route('admin.documents.transcripts.store'));
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <AuthenticatedLayout>
      <Head title={isEdit ? 'Edit Transcript' : 'Create Transcript'} />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Documents / Transcripts</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">{isEdit ? 'Edit Transcript Template' : 'Create Live Transcript Template'}</h1>
          </div>
          <Link href={route('admin.documents.transcripts.index')} className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm">
            <Icon name="arrow-left" className="w-4 h-4" /> Back to List
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ================= LEFT SIDE: EDIT FORM ================= */}
          <div className="w-full lg:w-[60%] xl:w-[65%] shrink-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">Template Settings</h3>
            </div>

            <form onSubmit={submit} className="p-6 space-y-6" noValidate>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                <div className="sm:col-span-2">
                  <label className={labelClass}>Campus *</label>
                  <select value={data.campus_id} onChange={(e) => setData('campus_id', e.target.value)} disabled={!isSuperAdmin} required className={`${inputClass} ${!isSuperAdmin ? 'bg-slate-100 opacity-70' : 'bg-white'}`}>
                    <option value="" disabled>Select Campus</option>
                    {campuses?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.campus_id && <p className="text-rose-500 text-xs mt-1">{errors.campus_id}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Template Title (Headline) *</label>
                  <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} required className={inputClass} />
                  {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className={labelClass}>Grading System Scale *</label>
                  <input type="text" value={data.grading_system} onChange={e => setData('grading_system', e.target.value)} placeholder="e.g. GPA 5.0, Out of 100" required className={inputClass} />
                  {errors.grading_system && <p className="text-rose-500 text-xs mt-1">{errors.grading_system}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Header Subtitle Text</label>
                  <input type="text" value={data.header_text} onChange={e => setData('header_text', e.target.value)} placeholder="Record of Student Academic Performance" className={inputClass} />
                </div>

                {/* Watermark File Upload */}
                <div className="sm:col-span-2">
                  <label className={labelClass}>Watermark / Background Logo</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {wmPreview && (
                      <div className="relative group shrink-0">
                        <img src={wmPreview} alt="Watermark" className="h-16 w-16 rounded-lg border border-slate-200 shadow-sm object-contain bg-slate-50 p-1" />
                        <button type="button" className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeImage('watermark_image', setWmPreview)}>
                          <Icon name="x" className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <div className="w-full">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => handleImageChange('watermark_image', e.target.files[0], setWmPreview)} 
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all border border-slate-200 rounded-xl bg-slate-50 cursor-pointer"
                      />
                      <small className="text-xs text-slate-400 mt-1.5 block">Appears faded in the center of the transcript.</small>
                    </div>
                  </div>
                </div>

                {/* Signature Box */}
                <div className="sm:col-span-2 bg-slate-50 p-5 border border-slate-200 rounded-xl space-y-4">
                  <strong className="text-sm font-bold text-slate-800 block border-b border-slate-200 pb-2">Authorized Signature</strong>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Signatory Title</label>
                      <input type="text" value={data.authorized_signature_title} onChange={e => setData('authorized_signature_title', e.target.value)} placeholder="e.g. Controller of Examinations" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Upload Signature</label>
                      <div className="flex items-center gap-3">
                        {sigPreview && (
                          <div className="relative group shrink-0">
                            <img src={sigPreview} alt="Signature" className="h-10 border border-slate-200 rounded p-1 bg-white object-contain" />
                            <button type="button" className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeImage('authorized_signature_image', setSigPreview)}>
                              <Icon name="x" className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <input type="file" accept="image/*" onChange={e => handleImageChange('authorized_signature_image', e.target.files[0], setSigPreview)} className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 cursor-pointer border border-slate-200 rounded-lg bg-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Footer / Disclaimer Text</label>
                  <textarea rows="3" value={data.footer_text} onChange={e => setData('footer_text', e.target.value)} placeholder="Terms or validation text at the bottom" className={`${inputClass} resize-none`}></textarea>
                </div>

                {/* Active Toggle */}
                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-3 cursor-pointer group w-max">
                    <div className="relative flex items-center">
                      <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-0 checked:bg-emerald-600 checked:border-emerald-600 cursor-pointer transition-colors" />
                      <svg className="absolute w-3.5 h-3.5 top-[3px] left-[3px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Set as Active Template</span>
                  </label>
                </div>

              </div>

              {/* Action Button */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-bold text-amber-500">{isDirty ? 'You have unsaved changes' : ''}</span>
                <button type="submit" disabled={processing} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
                  <Icon name="save" className="w-4 h-4" />
                  {processing ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>

          {/* ================= RIGHT SIDE: LIVE PREVIEW ================= */}
          <div className="w-full lg:flex-1 lg:sticky lg:top-24 flex flex-col items-center">
            
            <div className="w-full flex items-center justify-center gap-2 mb-4 bg-slate-900 text-white py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live Preview (A4 Format)
            </div>

            <div className="w-full max-w-[500px] bg-white relative shadow-xl border border-slate-200 overflow-hidden p-8 flex flex-col items-center font-sans text-slate-900" style={{ minHeight: '600px' }}>
              
              {/* Watermark Overlay */}
              {wmPreview && (
                <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.06] flex items-center justify-center">
                  <img src={wmPreview} alt="Watermark" className="w-[60%] h-[60%] object-contain" />
                </div>
              )}

              {/* Header */}
              <div className="w-full text-center border-b-2 border-slate-800 pb-3 mb-4 z-10">
                <h1 className="m-0 text-xl font-black uppercase tracking-wide">{data.title || 'Academic Transcript'}</h1>
                <h3 className="m-0 text-xs text-slate-600 mt-1 font-semibold">{data.header_text}</h3>
              </div>

              {/* Student Info Dummy */}
              <div className="w-full grid grid-cols-2 gap-2 text-[10px] mb-4 z-10 font-medium">
                <div><span className="font-bold text-slate-500">Name:</span> John Doe</div>
                <div><span className="font-bold text-slate-500">ID:</span> STU-12345</div>
                <div><span className="font-bold text-slate-500">Class:</span> 10 (Science)</div>
                <div><span className="font-bold text-slate-500">Scale:</span> {data.grading_system}</div>
              </div>

              {/* Dummy Grades Table */}
              <table className="w-full border-collapse text-[10px] mb-4 z-10">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 p-1.5 text-left text-slate-600">Subject</th>
                    <th className="border border-slate-300 p-1.5 text-center text-slate-600">Grade</th>
                    <th className="border border-slate-300 p-1.5 text-center text-slate-600">GPA</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 p-1.5 font-medium">Mathematics</td>
                    <td className="border border-slate-300 p-1.5 text-center font-bold">A+</td>
                    <td className="border border-slate-300 p-1.5 text-center font-bold">5.0</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-1.5 font-medium">Physics</td>
                    <td className="border border-slate-300 p-1.5 text-center font-bold">A</td>
                    <td className="border border-slate-300 p-1.5 text-center font-bold">4.0</td>
                  </tr>
                </tbody>
              </table>

              <div className="w-full text-right font-black text-xs mb-8 z-10">
                CGPA: 4.50
              </div>

              {/* Signatures & Footer */}
              <div className="w-full flex justify-between items-end mt-auto z-10">
                {/* Left Empty Signature space */}
                <div className="w-[120px] text-center">
                  <div className="border-t border-slate-800 pt-1 text-[9px] font-bold text-slate-600">Class Teacher</div>
                </div>

                {/* Right Configurable Signature */}
                <div className="w-[140px] text-center flex flex-col items-center">
                  {sigPreview ? (
                    <img src={sigPreview} alt="Sig" className="h-8 object-contain mb-1" />
                  ) : (
                    <div className="h-8 mb-1"></div>
                  )}
                  <div className="border-t border-slate-800 pt-1 text-[9px] font-bold text-slate-800 w-full">
                    {data.authorized_signature_title || 'Signature'}
                  </div>
                </div>
              </div>

              <div className="w-full text-center mt-6 text-[8px] text-slate-500 border-t border-dashed border-slate-300 pt-2 z-10">
                {data.footer_text || 'This transcript is invalid without the official seal and signature.'}
              </div>

            </div>
          </div>

        </div>
      </div>
    </AuthenticatedLayout>
  );
}