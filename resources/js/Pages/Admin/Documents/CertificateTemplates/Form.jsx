import React, { useState } from 'react';
import WorkingCampusField from '@/Components/WorkingCampusField';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';

const CERTIFICATE_DESIGNS = [
  { key: 'orange_bevel', name: 'Orange Bevel (Img 1)', blurb: 'Orange frame, corner clips & gold ribbon badge', swatch: 'linear-gradient(135deg, #ea580c, #f97316)' },
  { key: 'green_gold',   name: 'Green & Gold (Img 2)',   blurb: 'Green curves, gold banner & center star seal', swatch: 'linear-gradient(135deg, #047857, #eab308)' },
  { key: 'classic_gold', name: 'Classic Ornamental (Img 3)', blurb: 'Ivory background & ornate gold filigree corners', swatch: 'linear-gradient(135deg, #fef3c7, #b45309)' },
  { key: 'academic_navy',name: 'Academic Navy (Img 4)', blurb: 'Navy geometric angles & grad cap badge', swatch: 'linear-gradient(135deg, #1e3a8a, #d97706)' },
  { key: 'blue_orange',  name: 'Modern Waves (Img 5)',   blurb: 'Wavy blue corners & top hanging ribbon', swatch: 'linear-gradient(135deg, #0284c7, #ea580c)' },
];

const SigImg = ({ src, height = 26 }) =>
  src ? <img src={src} alt="signature" style={{ height, objectFit: 'contain' }} /> : <div style={{ height }} />;

const FiligreeHeader = () => (
  <svg width="110" height="18" viewBox="0 0 200 30" fill="none" className="mx-auto my-0.5">
    <path d="M100 20 C80 20, 70 5, 40 10 C20 15, 10 5, 0 15 C20 15, 35 25, 60 15 C80 5, 90 15, 100 20 Z" fill="#3f3f46" />
    <path d="M100 20 C120 20, 130 5, 160 10 C180 15, 190 5, 200 15 C180 15, 165 25, 140 15 C120 5, 110 15, 100 20 Z" fill="#3f3f46" />
    <circle cx="100" cy="10" r="3.5" fill="#3f3f46" />
  </svg>
);

const CornerFiligree = ({ className }) => (
  <svg width="45" height="45" viewBox="0 0 100 100" fill="#b45309" className={className}>
    <path d="M0,0 L40,0 C35,15 25,25 0,40 Z M10,0 C10,20 20,30 0,30" />
    <path d="M5,5 C25,5 35,15 35,35 C25,25 15,25 5,5 Z" opacity="0.6" />
    <circle cx="18" cy="18" r="2.5" />
  </svg>
);

export default function CertificateForm({ item, campuses, activeCampusId }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const defaultCampusId = item?.campus_id ?? auth?.active_campus_id ?? activeCampusId ?? '';

  const { data, setData, post, processing, errors } = useForm({
    _method: isEdit ? 'put' : 'post',
    campus_id: defaultCampusId,
    title: item?.title ?? 'CERTIFICATE',
    template_type: item?.template_type ?? 'Merit',
    design_style: item?.design_style ?? 'orange_bevel',
    content_body: item?.content_body ?? 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.',
    signature_1_title: item?.signature_1_title ?? 'Date',
    signature_2_title: item?.signature_2_title ?? 'Manager',
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
    
    const url = isEdit 
      ? route('admin.documents.certificatetemplates.update', item.id) 
      : route('admin.documents.certificatetemplates.store');
    
    post(url);
  }

  function renderCertificatePreview() {
    const style = data.design_style;
    const customBg = bgPreview ? { backgroundImage: `url(${bgPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};

    if (style === 'orange_bevel') {
      return (
        <div className="w-full aspect-[1.414/1] bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-4 relative overflow-hidden flex flex-col justify-between shadow-md" style={customBg}>
          <div 
            className="w-full h-full bg-white relative p-5 flex flex-col justify-between text-center"
            style={{ clipPath: 'polygon(16px 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0 calc(100% - 16px), 0 16px)' }}
          >
            <div 
              className="absolute inset-2 border-[1px] border-zinc-400 pointer-events-none"
              style={{ clipPath: 'polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)' }}
            />
            <div className="absolute top-2 left-2 z-10 flex flex-col items-center pointer-events-none">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-300 to-amber-200 border border-amber-700 shadow-sm flex items-center justify-center font-bold text-[7px] text-zinc-900 uppercase">
                Gold
              </div>
              <div className="w-5 h-5 bg-amber-500 -mt-1.5 rotate-45 border-b border-r border-amber-700"></div>
            </div>

            <div className="relative z-10 pt-1">
              <FiligreeHeader />
              <p className="text-[10px] font-bold text-zinc-800 uppercase tracking-widest mt-0.5">Institute Name Here</p>
              <h1 className="text-2xl font-black text-zinc-900 tracking-wider font-serif uppercase mt-0.5">{data.title}</h1>
              <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">Of Achievement</p>
            </div>

            <div className="my-auto relative z-10">
              <p className="text-[8px] font-bold text-zinc-600 tracking-widest uppercase mb-1">This Certificate is Proudly Presented To</p>
              <div className="text-2xl font-serif italic text-zinc-900 border-b border-zinc-400 pb-0.5 px-6 inline-block min-w-[200px]">
                Name Here
              </div>
              <p className="text-[8px] text-zinc-600 max-w-md mx-auto leading-relaxed mt-2 px-4">
                {data.content_body}
              </p>
            </div>

            <div className="relative z-10 pb-0.5">
              <div className="flex justify-between items-end px-10 mb-1">
                <div className="w-28 text-center border-b border-zinc-400 pb-0.5">
                  <SigImg src={sig1Preview} />
                  <p className="text-[8px] text-zinc-600 font-medium mt-0.5">{data.signature_1_title}</p>
                </div>
                <div className="w-28 text-center border-b border-zinc-400 pb-0.5">
                  <SigImg src={sig2Preview} />
                  <p className="text-[8px] text-zinc-600 font-medium mt-0.5">{data.signature_2_title}</p>
                </div>
              </div>
              <FiligreeHeader />
            </div>
          </div>
        </div>
      );
    }

    if (style === 'green_gold') {
      return (
        <div className="w-full aspect-[1.414/1] bg-white relative overflow-hidden p-5 flex flex-col justify-between text-center" style={customBg}>
          <div className="absolute -bottom-8 -left-8 w-40 h-64 bg-emerald-900 rounded-full mix-blend-multiply opacity-90 transform rotate-45 pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-2 w-36 h-64 bg-amber-500 rounded-full transform rotate-45 pointer-events-none"></div>

          <div className="absolute -bottom-8 -right-8 w-40 h-64 bg-emerald-900 rounded-full mix-blend-multiply opacity-90 transform -rotate-45 pointer-events-none"></div>
          <div className="absolute -bottom-10 -right-2 w-36 h-64 bg-amber-500 rounded-full transform -rotate-45 pointer-events-none"></div>

          <div className="absolute inset-3 border border-amber-500/60 pointer-events-none"></div>
          <div className="absolute inset-4 border-[1.5px] border-emerald-900/80 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col justify-between h-full py-1">
            <div>
              <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest mt-1">Company Name</p>
              <h1 className="text-2xl font-black text-emerald-900 tracking-wider uppercase font-sans">{data.title}</h1>
              <p className="text-[10px] font-extrabold text-zinc-800 tracking-widest uppercase">Of Achievement</p>
            </div>

            <div className="my-auto">
              <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-white text-[8px] font-bold tracking-widest uppercase py-0.5 px-5 inline-block rounded-xs shadow-xs mb-1.5">
                The Certificate Proudly Presented To
              </div>
              <h2 className="text-2xl font-serif italic text-emerald-950 my-0.5">Itsname Surname</h2>
              <div className="w-1/2 h-[1px] bg-zinc-300 mx-auto my-1.5"></div>
              <p className="text-[8px] text-zinc-600 italic max-w-sm mx-auto leading-relaxed px-2">
                {data.content_body}
              </p>
            </div>

            <div className="flex justify-between items-end px-12 relative z-10">
              <div className="w-24 text-center border-b border-zinc-700 pb-0.5">
                <SigImg src={sig1Preview} />
                <p className="text-[8px] font-bold text-zinc-800 uppercase mt-0.5">{data.signature_1_title}</p>
              </div>

              <div className="w-9 h-9 rounded-full bg-amber-500 border-2 border-amber-300 shadow flex items-center justify-center -mb-1">
                <Icon name="star" className="w-4 h-4 fill-white text-white" />
              </div>

              <div className="w-24 text-center border-b border-zinc-700 pb-0.5">
                <SigImg src={sig2Preview} />
                <p className="text-[8px] font-bold text-zinc-800 uppercase mt-0.5">{data.signature_2_title}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (style === 'classic_gold') {
      return (
        <div className="w-full aspect-[1.414/1] bg-[#fdfbf7] relative p-5 flex flex-col justify-between text-center overflow-hidden" style={customBg}>
          <div className="absolute inset-3 border-[1px] border-amber-600/70 pointer-events-none"></div>
          <div className="absolute inset-4 border-[0.5px] border-amber-600/40 pointer-events-none"></div>

          <CornerFiligree className="absolute top-3 left-3" />
          <CornerFiligree className="absolute top-3 right-3 transform scale-x-[-1]" />
          <CornerFiligree className="absolute bottom-3 left-3 transform scale-y-[-1]" />
          <CornerFiligree className="absolute bottom-3 right-3 transform scale-x-[-1] scale-y-[-1]" />

          <div className="relative z-10 flex flex-col justify-between h-full py-2">
            <div>
              <h1 className="text-2xl font-serif font-bold text-zinc-900 tracking-widest uppercase">{data.title}</h1>
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mt-0.5">of achievement</p>
              
              <div className="flex items-center justify-center gap-2 my-1">
                <div className="w-10 h-[1px] bg-amber-600"></div>
                <div className="w-1 h-1 rotate-45 bg-amber-600"></div>
                <div className="w-10 h-[1px] bg-amber-600"></div>
              </div>
            </div>

            <div className="my-auto">
              <p className="text-[9px] text-zinc-700 font-serif mb-0.5">This certificate is proudly presented to</p>
              <h2 className="text-2xl font-serif italic text-amber-800 my-0.5">Michael Sprague</h2>
              <p className="text-[8px] text-zinc-600 max-w-xs mx-auto leading-relaxed my-1.5 px-4">
                {data.content_body}
              </p>
              <p className="text-[9px] font-bold text-zinc-800">Thank you lorem ipsum dolor sit amet!</p>
            </div>

            <div className="flex justify-between items-end px-10">
              <div className="flex items-center gap-1">
                <div className="w-9 h-9 rounded-full bg-amber-600 border border-amber-300 shadow flex items-center justify-center text-[6px] font-bold text-white uppercase text-center leading-tight">
                  Best<br />Award
                </div>
              </div>

              <div className="flex gap-8">
                <div className="w-20 text-center border-b border-zinc-400 pb-0.5">
                  <SigImg src={sig1Preview} />
                  <p className="text-[7px] text-zinc-600 mt-0.5">{data.signature_1_title}</p>
                </div>
                <div className="w-20 text-center border-b border-zinc-400 pb-0.5">
                  <SigImg src={sig2Preview} />
                  <p className="text-[7px] text-zinc-600 mt-0.5">{data.signature_2_title}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (style === 'academic_navy') {
      return (
        <div className="w-full aspect-[1.414/1] bg-slate-50 relative p-5 flex flex-col justify-between overflow-hidden" style={customBg}>
          <div className="absolute top-0 left-0 w-1/3 h-1/2 bg-blue-950 pointer-events-none" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
          <div className="absolute top-0 left-0 w-1/3 h-1/2 bg-amber-500 pointer-events-none" style={{ clipPath: 'polygon(0 0, 104% 0, 0 104%)', zIndex: -1 }}></div>

          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-blue-950 pointer-events-none" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-amber-500 pointer-events-none opacity-80" style={{ clipPath: 'polygon(100% 8%, 100% 100%, 8% 100%)' }}></div>

          <div className="absolute inset-4 border-[1px] border-amber-600/80 pointer-events-none"></div>

          <div className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full bg-amber-500 border border-blue-950 flex items-center justify-center shadow-xs">
            <Icon name="academic-cap" className="w-4 h-4 text-blue-950" />
          </div>

          <div className="relative z-10 flex flex-col justify-between h-full py-1 text-center">
            <div className="mt-1">
              <h1 className="text-2xl font-black text-blue-950 tracking-wider uppercase font-sans">{data.title}</h1>
              <p className="text-[9px] font-bold text-blue-900 uppercase tracking-widest">Of High School Graduation</p>
              <div className="w-1/3 h-[1.5px] bg-amber-500 mx-auto mt-1"></div>
            </div>

            <div className="my-auto">
              <p className="text-[8px] font-bold text-zinc-800 uppercase tracking-wider mb-0.5">Proudly Present To:</p>
              <h2 className="text-2xl font-serif italic text-zinc-900 my-0.5">Name Surname</h2>
              <p className="text-[7.5px] font-semibold text-zinc-600 uppercase max-w-xs mx-auto leading-relaxed mt-1">
                {data.content_body}
              </p>
            </div>

            <div className="flex justify-around items-end px-10 mb-1">
              <div className="w-24 text-center border-b border-blue-950 pb-0.5">
                <SigImg src={sig1Preview} />
                <p className="text-[7.5px] font-bold text-blue-950 uppercase mt-0.5">{data.signature_1_title}</p>
              </div>
              <div className="w-24 text-center border-b border-blue-950 pb-0.5">
                <SigImg src={sig2Preview} />
                <p className="text-[7.5px] font-bold text-blue-950 uppercase mt-0.5">{data.signature_2_title}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full aspect-[1.414/1] bg-white relative p-4 flex flex-col justify-between overflow-hidden" style={customBg}>
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-amber-500"></div>
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 to-amber-500"></div>

        <div className="absolute top-0 right-0 w-32 h-28 bg-sky-900 rounded-bl-full opacity-90 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-36 h-32 bg-sky-900 rounded-tr-full opacity-90 pointer-events-none"></div>

        <div className="absolute top-0 left-8 w-3 h-20 bg-sky-900 z-10"></div>
        <div className="absolute top-10 left-4 z-20 w-11 h-11 rounded-full bg-sky-950 border-2 border-amber-500 flex flex-col items-center justify-center text-amber-400 font-bold shadow">
          <span className="text-[8px] leading-tight">2030</span>
          <span className="text-[5px] tracking-tighter uppercase">Award</span>
        </div>

        <div className="absolute bottom-3 left-3 z-10 text-[7px] font-bold text-white uppercase tracking-wider">
          Logo Here
        </div>

        <div className="relative z-10 pl-20 pr-4 py-3 flex flex-col justify-between h-full">
          <div>
            <h1 className="text-2xl font-serif font-bold text-amber-600 tracking-wide">{data.title}</h1>
            <p className="text-[9px] font-bold text-zinc-700 tracking-widest uppercase">Of Appreciation</p>
          </div>

          <div className="my-auto">
            <h2 className="text-2xl font-serif italic text-sky-950 mb-0.5">Name Surname</h2>
            <div className="w-full h-[1px] bg-amber-500 mb-1.5"></div>
            <p className="text-[8px] font-bold text-zinc-800 leading-tight">Lorem Ipsum is simply dummy text of the printing and typesetting</p>
            <p className="text-[7.5px] text-zinc-500 leading-relaxed mt-1 max-w-xs">
              {data.content_body}
            </p>
          </div>

          <div className="flex justify-end gap-8 items-end mb-1">
            <div className="w-20 text-center border-b border-amber-500 pb-0.5">
              <SigImg src={sig1Preview} />
              <p className="text-[7px] text-zinc-700 mt-0.5">{data.signature_1_title}</p>
            </div>
            <div className="w-20 text-center border-b border-amber-500 pb-0.5">
              <SigImg src={sig2Preview} />
              <p className="text-[7px] text-zinc-700 mt-0.5">{data.signature_2_title}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

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

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-[480px] xl:w-[540px] shrink-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
               <h3 className="text-lg font-bold text-slate-900">Template Settings</h3>
            </div>

            <form onSubmit={submit} className="p-6 space-y-6">
              <div className="pb-6 border-b border-slate-100">
                <div className="mb-3">
                  <strong className="text-sm font-semibold text-slate-800">Select Design Style</strong>
                  <p className="text-xs text-slate-500 mt-0.5">Choose layout matching your reference certificate style.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CERTIFICATE_DESIGNS.map(d => (
                    <div
                      key={d.key}
                      onClick={() => setData('design_style', d.key)}
                      className={`cursor-pointer border-2 rounded-xl p-2.5 transition-all bg-white hover:-translate-y-0.5 ${data.design_style === d.key ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-slate-200 hover:border-indigo-300'}`}
                    >
                      <div className="w-full h-8 rounded-lg mb-2 relative" style={{ background: d.swatch }}>
                        {data.design_style === d.key && <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">✓</span>}
                      </div>
                      <div className="font-bold text-[11px] text-slate-800 leading-tight">{d.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Campus *</label>
                  <WorkingCampusField value={data.campus_id} campuses={campuses} className={`${inputClass} bg-white`} />
                  {errors.campus_id && <span className="text-red-500 text-xs mt-1 block">{errors.campus_id}</span>}
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Template Title (Headline) *</label>
                  <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} required className={inputClass} />
                  {errors.title && <span className="text-red-500 text-xs mt-1 block">{errors.title}</span>}
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Template Type *</label>
                  <select value={data.template_type} onChange={e => setData('template_type', e.target.value)} required className={`${inputClass} bg-white`}>
                    <option value="Merit">Merit / Excellence</option>
                    <option value="Achievement">Achievement</option>
                    <option value="Completion">Completion</option>
                    <option value="Participation">Participation</option>
                  </select>
                  {errors.template_type && <span className="text-red-500 text-xs mt-1 block">{errors.template_type}</span>}
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Main Body Content *</label>
                  <textarea rows="3" value={data.content_body} onChange={e => setData('content_body', e.target.value)} required className={`${inputClass} resize-none`}></textarea>
                  {errors.content_body && <span className="text-red-500 text-xs mt-1 block">{errors.content_body}</span>}
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Custom Background Overlay</label>
                  <input type="file" accept="image/*" onChange={e => handleImageChange('background_image', e.target.files[0], setBgPreview)} className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all border border-slate-200 rounded-xl bg-slate-50 cursor-pointer" />
                </div>

                <div className="bg-slate-50 p-3.5 border border-slate-200 rounded-xl space-y-2.5">
                  <strong className="text-xs font-bold text-slate-800 block border-b border-slate-200 pb-1.5">Left Signature / Date</strong>
                  <input type="text" value={data.signature_1_title} onChange={e => setData('signature_1_title', e.target.value)} className={`${inputClass} py-1.5 px-3 text-xs`} />
                  <input type="file" accept="image/*" onChange={e => handleImageChange('signature_1_image', e.target.files[0], setSig1Preview)} className="block w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 cursor-pointer border border-slate-200 rounded-lg bg-white" />
                </div>

                <div className="bg-slate-50 p-3.5 border border-slate-200 rounded-xl space-y-2.5">
                  <strong className="text-xs font-bold text-slate-800 block border-b border-slate-200 pb-1.5">Right Signature / Manager</strong>
                  <input type="text" value={data.signature_2_title} onChange={e => setData('signature_2_title', e.target.value)} className={`${inputClass} py-1.5 px-3 text-xs`} />
                  <input type="file" accept="image/*" onChange={e => handleImageChange('signature_2_image', e.target.files[0], setSig2Preview)} className="block w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 cursor-pointer border border-slate-200 rounded-lg bg-white" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button type="submit" disabled={processing} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/25 disabled:opacity-70">
                  <Icon name="save" className="w-4 h-4" />
                  {processing ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>

          <div className="w-full flex-1 lg:sticky lg:top-24 flex flex-col items-center">
            <div className="w-full flex items-center justify-center gap-2 mb-3 bg-slate-900 text-white py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Certificate Live Preview
            </div>
            <div className="w-full rounded-2xl shadow-xl border border-slate-200 overflow-hidden bg-white ring-8 ring-slate-100">
              {renderCertificatePreview()}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
