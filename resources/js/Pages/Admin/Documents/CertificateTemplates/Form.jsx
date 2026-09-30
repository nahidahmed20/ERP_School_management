import React, { useState } from 'react';
import WorkingCampusField from '@/Components/WorkingCampusField';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';

// 🟢 Premium Styles Selection
const CERTIFICATE_DESIGNS = [
  { key: 'classic_gold', name: 'Classic University', blurb: 'Elegant borders & serif fonts', swatch: 'linear-gradient(135deg, #fef3c7, #b45309)' },
  { key: 'modern_blue',  name: 'Modern Corporate', blurb: 'Clean lines, geometric shapes', swatch: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' },
  { key: 'emerald_honor', name: 'Emerald Honor', blurb: 'Green/Gold accents, premium feel', swatch: 'linear-gradient(135deg, #064e3b, #10b981)' },
  { key: 'creative_wave', name: 'Creative Wave', blurb: 'Vibrant waves, playful layout', swatch: 'linear-gradient(135deg, #ea580c, #f43f5e)' },
];

const SigImg = ({ src, height = 30 }) =>
  src ? <img src={src} alt="signature" className="mx-auto" style={{ height, objectFit: 'contain' }} /> : <div style={{ height }} className="border-b border-dashed border-slate-300 w-full mb-1" />;

// 🟢 FIX: Props এ schoolName রিসিভ করা হলো
export default function CertificateForm({ item, campuses, activeCampusId, schoolName = 'Your School Name' }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, processing, errors } = useForm({
    _method: isEdit ? 'put' : 'post',
    campus_id: item?.campus_id ?? auth?.active_campus_id ?? activeCampusId ?? '',
    title: item?.title ?? 'CERTIFICATE OF ACHIEVEMENT',
    template_type: item?.template_type ?? 'Merit',
    design_style: item?.design_style ?? 'classic_gold',
    content_body: item?.content_body ?? 'This is proudly presented to acknowledge the outstanding performance, dedication, and successful completion of the required criteria.',
    signature_1_title: item?.signature_1_title ?? 'Date Issued',
    signature_2_title: item?.signature_2_title ?? 'Principal / Director',
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
    const url = isEdit ? route('admin.documents.certificatetemplates.update', item.id) : route('admin.documents.certificatetemplates.store');
    post(url);
  }

  // 🎨 THE PREMIUM DESIGNS RENDERER (School Name is now Dynamic!)
  function renderCertificatePreview() {
    const style = data.design_style;
    const customBg = bgPreview ? { backgroundImage: `url(${bgPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};

    if (style === 'classic_gold') {
      return (
        <div className="w-full aspect-[1.414/1] bg-[#faf9f6] relative p-6 flex flex-col justify-between text-center overflow-hidden border border-slate-200" style={customBg}>
          <div className="absolute inset-3 border-[3px] border-double border-amber-700/80 pointer-events-none"></div>
          <div className="absolute inset-5 border border-amber-600/30 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col justify-between h-full pt-4">
            <div>
              <p className="text-[10px] font-bold text-amber-800 uppercase tracking-[0.3em] mb-2">{schoolName}</p>
              <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-wider uppercase mb-1" style={{ textShadow: '1px 1px 0px rgba(255,255,255,0.8)' }}>
                {data.title || 'CERTIFICATE'}
              </h1>
              <div className="w-24 h-0.5 bg-amber-600 mx-auto my-2 rounded-full"></div>
            </div>

            <div className="my-auto px-10">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-semibold">This is proudly presented to</p>
              <h2 className="text-3xl font-serif italic text-amber-900 my-2 border-b border-amber-900/30 pb-1 inline-block min-w-[250px]">Student Name Here</h2>
              <p className="text-[10px] text-slate-700 leading-relaxed mt-3 font-medium">
                {data.content_body || 'Description text goes here...'}
              </p>
            </div>

            <div className="flex justify-between items-end px-12 pb-2 relative z-10">
              <div className="w-32 text-center">
                <SigImg src={sig1Preview} />
                <div className="w-full h-px bg-slate-400 mt-1"></div>
                <p className="text-[8px] text-slate-600 uppercase font-bold mt-1 tracking-wider">{data.signature_1_title || 'Signature 1'}</p>
              </div>

              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-white shadow-lg flex items-center justify-center -mb-2 relative">
                <div className="w-11 h-11 rounded-full border border-amber-200 border-dashed flex items-center justify-center text-[7px] text-white font-bold uppercase text-center leading-tight">Seal<br/>Here</div>
              </div>

              <div className="w-32 text-center">
                <SigImg src={sig2Preview} />
                <div className="w-full h-px bg-slate-400 mt-1"></div>
                <p className="text-[8px] text-slate-600 uppercase font-bold mt-1 tracking-wider">{data.signature_2_title || 'Signature 2'}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (style === 'modern_blue') {
      return (
        <div className="w-full aspect-[1.414/1] bg-white relative overflow-hidden flex flex-col justify-between text-left" style={customBg}>
          <div className="absolute top-0 left-0 w-1/2 h-full bg-blue-50/50 pointer-events-none" style={{ clipPath: 'polygon(0 0, 100% 0, 60% 100%, 0% 100%)' }}></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-bl-full pointer-events-none opacity-90"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-sky-500 rounded-tr-full pointer-events-none opacity-90"></div>

          <div className="relative z-10 flex flex-col justify-between h-full p-10">
            <div>
              <div className="w-12 h-12 bg-blue-600 rounded-xl mb-4 flex items-center justify-center text-white text-xs font-black shadow-md"><Icon name="award" className="w-6 h-6" /></div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-1">{data.title || 'CERTIFICATE'}</h1>
              <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">{schoolName}</p>
            </div>

            <div className="my-auto pl-4 border-l-4 border-slate-200">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Presented To</p>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Student Name Here</h2>
              <p className="text-[11px] text-slate-600 leading-relaxed max-w-md">
                {data.content_body || 'Description text goes here...'}
              </p>
            </div>

            <div className="flex justify-start gap-16 items-end">
              <div className="w-32">
                <SigImg src={sig1Preview} />
                <div className="w-full h-0.5 bg-slate-300 mt-1"></div>
                <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">{data.signature_1_title || 'Signature 1'}</p>
              </div>
              <div className="w-32">
                <SigImg src={sig2Preview} />
                <div className="w-full h-0.5 bg-slate-300 mt-1"></div>
                <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">{data.signature_2_title || 'Signature 2'}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (style === 'emerald_honor') {
        return (
          <div className="w-full aspect-[1.414/1] bg-slate-50 relative overflow-hidden flex flex-col justify-between text-center border-[8px] border-emerald-900" style={customBg}>
            <div className="absolute inset-1 border-[1px] border-amber-500 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col justify-between h-full p-8">
              <div className="mt-4">
                <p className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.4em] mb-1">{schoolName}</p>
                <h1 className="text-4xl font-serif font-bold text-amber-600 uppercase tracking-widest">{data.title || 'HONOR'}</h1>
              </div>

              <div className="my-auto px-16">
                <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Presented Proudly To</p>
                <h2 className="text-3xl font-serif text-emerald-950 border-b border-emerald-900/20 pb-1 mb-3">Student Name Here</h2>
                <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
                  {data.content_body || 'Description text goes here...'}
                </p>
              </div>

              <div className="flex justify-between items-end px-8 relative z-10">
                <div className="w-28 text-center border-t border-slate-400 pt-1">
                  <div className="-mt-8"><SigImg src={sig1Preview} /></div>
                  <p className="text-[8px] text-slate-600 font-bold uppercase">{data.signature_1_title}</p>
                </div>
                <div className="w-12 h-12 bg-amber-500 rounded-sm rotate-45 border-2 border-emerald-900 flex items-center justify-center shadow-inner">
                   <div className="-rotate-45 text-[6px] text-white font-bold uppercase text-center leading-none">Honor<br/>Award</div>
                </div>
                <div className="w-28 text-center border-t border-slate-400 pt-1">
                  <div className="-mt-8"><SigImg src={sig2Preview} /></div>
                  <p className="text-[8px] text-slate-600 font-bold uppercase">{data.signature_2_title}</p>
                </div>
              </div>
            </div>
          </div>
        );
      }

    // Default Fallback (Creative Wave)
    return (
      <div className="w-full aspect-[1.414/1] bg-white relative flex flex-col justify-between overflow-hidden" style={customBg}>
        <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-rose-500 to-orange-500 rounded-b-[50%] scale-110 -translate-y-4"></div>
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-r from-orange-500 to-rose-500 rounded-t-[50%] scale-110 translate-y-4 opacity-30"></div>

        <div className="relative z-10 flex flex-col justify-between h-full p-8 text-center pt-16">
          <div>
            <h1 className="text-3xl font-black text-rose-600 uppercase tracking-widest">{data.title || 'CERTIFICATE'}</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{schoolName}</p>
          </div>

          <div className="my-auto px-10">
            <h2 className="text-2xl font-bold text-slate-800 bg-slate-100 py-1.5 px-4 rounded-full inline-block mb-3">Student Name Here</h2>
            <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
              {data.content_body || 'Description text goes here...'}
            </p>
          </div>

          <div className="flex justify-center gap-16 items-end mb-4 relative z-10">
            <div className="w-28 text-center">
              <SigImg src={sig1Preview} />
              <div className="w-full h-[1px] bg-slate-300 my-1"></div>
              <p className="text-[8px] text-slate-500 font-bold uppercase">{data.signature_1_title}</p>
            </div>
            <div className="w-28 text-center">
              <SigImg src={sig2Preview} />
              <div className="w-full h-[1px] bg-slate-300 my-1"></div>
              <p className="text-[8px] text-slate-500 font-bold uppercase">{data.signature_2_title}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

  return (
    <AuthenticatedLayout>
      <Head title={isEdit ? 'Edit Certificate' : 'Create Certificate'} />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Documents / Certificates</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">{isEdit ? 'Edit Certificate Template' : 'Create Live Certificate Template'}</h1>
          </div>
          <Link href={route('admin.documents.certificatetemplates.index')} className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm">
            <Icon name="arrow-left" className="w-4 h-4" /> Back to List
          </Link>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 items-start">

          {/* Form Section */}
          <div className="w-full xl:w-[500px] shrink-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
               <h3 className="text-lg font-bold text-slate-900">Template Settings</h3>
            </div>

            <form onSubmit={submit} className="p-6 space-y-6">
              <div className="pb-6 border-b border-slate-100">
                <label className={labelClass}>Select Design Theme</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {CERTIFICATE_DESIGNS.map(d => (
                    <div
                      key={d.key}
                      onClick={() => setData('design_style', d.key)}
                      className={`cursor-pointer border-2 rounded-xl p-3 transition-all bg-white hover:-translate-y-0.5 flex items-center gap-3 ${data.design_style === d.key ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300'}`}
                    >
                      <div className="w-8 h-8 rounded-full shrink-0 shadow-sm" style={{ background: d.swatch }}></div>
                      <div>
                        <div className="font-bold text-[12px] text-slate-800 leading-tight">{d.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{d.blurb}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className={labelClass}>Campus *</label>
                  <WorkingCampusField value={data.campus_id} campuses={campuses} className={`${inputClass} ${!isSuperAdmin ? 'opacity-70 bg-slate-100' : 'bg-white'}`} />
                  {errors.campus_id && <span className="text-rose-500 text-xs mt-1 block">{errors.campus_id}</span>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Title (Headline) *</label>
                    <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} required placeholder="e.g. CERTIFICATE" className={inputClass} />
                    {errors.title && <span className="text-rose-500 text-xs mt-1 block">{errors.title}</span>}
                  </div>
                  <div>
                    <label className={labelClass}>Template Type *</label>
                    <select value={data.template_type} onChange={e => setData('template_type', e.target.value)} required className={`${inputClass} bg-white`}>
                      <option value="Merit">Merit / Excellence</option>
                      <option value="Achievement">Achievement</option>
                      <option value="Completion">Completion</option>
                      <option value="Participation">Participation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Main Body Content *</label>
                  <textarea rows="4" value={data.content_body} onChange={e => setData('content_body', e.target.value)} required placeholder="Write the certificate description here..." className={`${inputClass} resize-none`}></textarea>
                  {errors.content_body && <span className="text-rose-500 text-xs mt-1 block">{errors.content_body}</span>}
                </div>

                <div>
                  <label className={labelClass}>Custom Background Image (Optional)</label>
                  <input type="file" accept="image/jpeg, image/png, image/jpg" onChange={e => handleImageChange('background_image', e.target.files[0], setBgPreview)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all border border-slate-200 rounded-xl bg-slate-50 cursor-pointer" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
                    <strong className="text-xs font-bold text-slate-800 block border-b border-slate-200 pb-2">Left Signature / Date</strong>
                    <div>
                      <input type="text" placeholder="Title (e.g. Date Issued)" value={data.signature_1_title} onChange={e => setData('signature_1_title', e.target.value)} className={`${inputClass} py-2 text-xs`} />
                    </div>
                    <div>
                      <input type="file" accept="image/*" onChange={e => handleImageChange('signature_1_image', e.target.files[0], setSig1Preview)} className="block w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-100 file:text-indigo-700 cursor-pointer border border-slate-200 rounded-lg bg-white" />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
                    <strong className="text-xs font-bold text-slate-800 block border-b border-slate-200 pb-2">Right Signature / Head</strong>
                    <div>
                      <input type="text" placeholder="Title (e.g. Principal)" value={data.signature_2_title} onChange={e => setData('signature_2_title', e.target.value)} className={`${inputClass} py-2 text-xs`} />
                    </div>
                    <div>
                      <input type="file" accept="image/*" onChange={e => handleImageChange('signature_2_image', e.target.files[0], setSig2Preview)} className="block w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-100 file:text-indigo-700 cursor-pointer border border-slate-200 rounded-lg bg-white" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button type="submit" disabled={processing} className="w-full flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md disabled:opacity-70 active:scale-95">
                  {processing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Saving Template...
                    </>
                  ) : (
                    <><Icon name="save" className="w-5 h-5" /> {isEdit ? 'Update Template' : 'Create Template'}</>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview Section */}
          <div className="w-full flex-1 xl:sticky xl:top-24 flex flex-col items-center">
            <div className="w-full flex items-center justify-center gap-2 mb-4 bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse border-2 border-slate-900"></span> Live Certificate Preview
            </div>

            <div className="w-full rounded-sm shadow-2xl border border-slate-300 overflow-hidden bg-white ring-8 ring-slate-100/50 max-w-4xl">
              {renderCertificatePreview()}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
