import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import WorkingCampusField from '@/Components/WorkingCampusField';
import Icon from '@/Components/Icons';

export default function TranscriptFormModal({ item, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  // 🟢 FIX: File upload requires POST, so we spoof PUT via _method
  const { data, setData, post, processing, errors, reset, isDirty } = useForm({
    _method: isEdit ? 'put' : 'post',
    campus_id: item?.campus_id ?? auth?.active_campus_id ?? activeCampusId ?? '',
    title: item?.title ?? 'Official Academic Transcript',
    grading_system: item?.grading_system ?? 'GPA 5.0',
    header_text: item?.header_text ?? 'Official Record of Student Progress',
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
    // 🟢 FIX: Always use post() for handling files in Inertia
    const url = isEdit ? route('admin.documents.transcripts.update', item.id) : route('admin.documents.transcripts.store');
    post(url, { onSuccess: () => { reset(); onClose(); } });
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      
      <div 
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Transcript Template' : 'Create Transcript Template'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure layout, grading scale, and signatures.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden" noValidate>
          <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="sm:col-span-2">
                <label className={labelClass}>Assign to Campus <span className="text-rose-500">*</span></label>
                <WorkingCampusField value={data.campus_id} campuses={campuses} className={`${inputClass} ${!isSuperAdmin ? 'bg-slate-100 opacity-70' : 'bg-white'}`} />
                {errors.campus_id && <p className="text-rose-500 text-xs mt-1">{errors.campus_id}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Template Title (Headline) <span className="text-rose-500">*</span></label>
                <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} required placeholder="e.g. Official Academic Transcript" className={inputClass} autoFocus />
                {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className={labelClass}>Grading System Scale <span className="text-rose-500">*</span></label>
                <input type="text" value={data.grading_system} onChange={e => setData('grading_system', e.target.value)} placeholder="e.g. GPA 5.0 (A+ to F)" required className={inputClass} />
                {errors.grading_system && <p className="text-rose-500 text-xs mt-1">{errors.grading_system}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Header Subtitle Text</label>
                <input type="text" value={data.header_text} onChange={e => setData('header_text', e.target.value)} placeholder="e.g. Record of Student Academic Performance" className={inputClass} />
              </div>

              {/* Watermark Upload Section */}
              <div className="sm:col-span-2 bg-slate-50 p-4 border border-slate-200 rounded-xl">
                <label className={labelClass}>Watermark / Background Logo</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2">
                  {wmPreview && (
                    <div className="relative group shrink-0">
                      <img src={wmPreview} alt="Watermark" className="h-16 w-16 rounded-lg border border-slate-200 shadow-sm object-contain bg-white p-1" />
                      <button type="button" className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeImage('watermark_image', setWmPreview)}>
                        <Icon name="x" className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <div className="w-full">
                    <input 
                      type="file" 
                      accept="image/jpeg, image/png, image/jpg" 
                      onChange={e => handleImageChange('watermark_image', e.target.files[0], setWmPreview)} 
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 transition-all border border-slate-200 rounded-xl bg-white cursor-pointer"
                    />
                    <small className="text-xs text-slate-500 mt-1.5 block">Appears faded in the center of the transcript page.</small>
                  </div>
                </div>
              </div>

              {/* Signature Upload Section */}
              <div className="sm:col-span-2 bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-4">
                <strong className={labelClass}>Authorized Signature Area</strong>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Signatory Title</label>
                    <input type="text" value={data.authorized_signature_title} onChange={e => setData('authorized_signature_title', e.target.value)} placeholder="e.g. Controller of Examinations" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Upload Signature</label>
                    <div className="flex flex-col gap-3">
                      {sigPreview && (
                        <div className="relative group w-fit">
                          <img src={sigPreview} alt="Signature" className="h-10 border border-slate-200 rounded p-1 bg-white object-contain" />
                          <button type="button" className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeImage('authorized_signature_image', setSigPreview)}>
                            <Icon name="x" className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/jpeg, image/png, image/jpg" 
                        onChange={e => handleImageChange('authorized_signature_image', e.target.files[0], setSigPreview)} 
                        className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-100 file:text-indigo-700 cursor-pointer border border-slate-200 rounded-lg bg-white" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Footer / Disclaimer Text</label>
                <textarea rows="2" value={data.footer_text} onChange={e => setData('footer_text', e.target.value)} placeholder="e.g. This transcript is invalid without the official seal..." className={`${inputClass} resize-none`}></textarea>
              </div>

              {/* Active Status Toggle */}
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
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Set as Active Template</span>
                </label>
              </div>

            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
            <span className="text-sm font-bold text-amber-500">{isDirty ? 'Unsaved changes' : ''}</span>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} disabled={processing} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm active:scale-95">
                Cancel
              </button>
              
              {/* 🟢 FIX: Saving Animation */}
              <button type="submit" disabled={processing} className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md disabled:opacity-70 active:scale-95">
                {processing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Saving...
                  </>
                ) : (
                  <><Icon name="save" className="w-4 h-4" /> Save Template</>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}