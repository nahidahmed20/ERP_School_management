import React, { useState } from 'react';
import WorkingCampusField from '@/Components/WorkingCampusField';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';

const ID_CARD_DESIGNS = [
  { key: 'modern_wave', name: 'Modern Wave', desc: 'Curved fluid header' },
  { key: 'classic_solid', name: 'Classic Solid', desc: 'Traditional block header' },
  { key: 'corporate_minimal', name: 'Corporate Minimal', desc: 'Clean, professional lines' },
  { key: 'gradient_fluid', name: 'Gradient Fluid', desc: 'Smooth gradient overlaps' },
  { key: 'polygon_tech', name: 'Polygon Tech', desc: 'Sharp angled cuts' },
  { key: 'elegant_border', name: 'Elegant Border', desc: 'Premium framed design' },
];

export default function IdCardForm({ item, campuses, activeCampusId, schoolName = "Smart School" }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, processing, errors } = useForm({
    _method: isEdit ? 'put' : 'post',
    campus_id: item?.campus_id ?? auth?.active_campus_id ?? activeCampusId ?? '',
    title: item?.title ?? 'Student ID Card',
    audience: item?.audience ?? 'student',
    layout_type: item?.layout_type ?? 'vertical',
    design_template: item?.design_template ?? 'modern_wave',
    text_align: item?.text_align ?? 'center',
    photo_align: item?.photo_align ?? 'center',
    theme_color: item?.theme_color ?? '#1e40af',
    show_blood_group: item?.show_blood_group ?? true,
    show_address: item?.show_address ?? true,
    show_phone: item?.show_phone ?? true,
    back_side_content: item?.back_side_content ?? 'If found, please return to the school authority.',
    is_active: item?.is_active ?? true,
    logo_image: null,
    signature_image: null,
    background_image: null,
  });

  const [logoPreview, setLogoPreview] = useState(item?.logo_image ? `/storage/${item.logo_image}` : null);
  const [sigPreview, setSigPreview] = useState(item?.signature_image ? `/storage/${item.signature_image}` : null);

  const handleImageChange = (field, file, setPreview) => {
    setData(field, file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  function submit(e) {
    e.preventDefault();
    const url = isEdit ? route('admin.documents.idcards.update', item.id) : route('admin.documents.idcards.store');
    post(url);
  }

  // 🎨 THE 6 PREMIUM ID CARD DESIGNS
  function renderIdCardPreview() {
    const isVertical = data.layout_type === 'vertical';
    const theme = data.theme_color;
    const alignText = data.text_align === 'left' ? 'text-left' : data.text_align === 'right' ? 'text-right' : 'text-center';
    const alignPhoto = data.photo_align === 'left' ? 'items-start' : data.photo_align === 'right' ? 'items-end' : 'items-center';
    const cardSize = isVertical ? "w-[240px] h-[380px]" : "w-[380px] h-[240px]";
    
    // Helper Components
    const LogoBlock = ({ classes }) => (
      <div className={`relative z-10 flex ${isVertical ? 'flex-col items-center' : 'items-center gap-2'} ${classes}`}>
        {logoPreview ? <img src={logoPreview} alt="Logo" className="h-10 object-contain" /> : <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white"><Icon name="hexagon" className="w-5 h-5" /></div>}
        <h2 className={`font-bold text-white uppercase ${isVertical ? 'text-xs mt-1 text-center' : 'text-sm'}`}>{schoolName}</h2>
      </div>
    );

    const PhotoBlock = ({ customWrapper = "" }) => (
      <div className={`flex flex-col ${alignPhoto} ${isVertical ? 'w-full mb-3' : 'w-24 shrink-0 mr-4'} ${customWrapper}`}>
        <div className="w-20 h-24 bg-slate-200 border-[3px] border-white shadow-md rounded overflow-hidden flex items-center justify-center relative z-10">
          <Icon name="user" className="w-10 h-10 text-slate-400" />
        </div>
        <div className="mt-1.5 bg-amber-500 text-white text-[9px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm z-10">
          {data.audience === 'both' ? 'Student' : data.audience}
        </div>
      </div>
    );

    const DetailsBlock = ({ textCol = "text-slate-800" }) => (
      <div className={`flex flex-col justify-center flex-1 ${alignText} ${isVertical ? '' : 'py-2'}`}>
        <h3 className={`font-bold ${textCol} ${isVertical ? 'text-lg' : 'text-xl'} uppercase leading-tight`}>Student Name</h3>
        <p className="text-[10px] font-bold text-slate-500 font-mono mt-0.5 mb-2 border-b border-slate-200 inline-block pb-1">ID: STU-2024-001</p>
        <div className="space-y-1 text-[9px] text-slate-700">
          {data.show_blood_group && <p><strong className="text-rose-600">Blood:</strong> O+</p>}
          {data.show_phone && <p><strong>Phone:</strong> +880 1234 56789</p>}
          {data.show_address && <p className="leading-tight"><strong>Address:</strong> 123 School Avenue, Dhaka</p>}
        </div>
      </div>
    );

    const SignatureBlock = ({ classes }) => (
      <div className={`relative flex flex-col items-center w-16 ${classes}`}>
        {sigPreview ? <img src={sigPreview} className="h-6 object-contain" /> : <div className="h-6 border-b border-slate-300 w-full mb-1"></div>}
        <span className="text-[7px] font-bold text-slate-600 uppercase border-t border-slate-300 w-full text-center pt-0.5">Principal</span>
      </div>
    );

    // --- TEMPLATES RENDERING --- //
    
    let frontContent, backContent;

    if (data.design_template === 'modern_wave') {
      frontContent = (
        <div className="w-full h-full flex flex-col relative bg-white">
          <div className={`relative ${isVertical ? 'h-24' : 'h-16 w-full'} shrink-0 pt-3 px-4 flex justify-center`} style={{ backgroundColor: theme }}>
            {isVertical ? <div className="absolute -bottom-6 left-0 w-full h-12 bg-white" style={{ clipPath: 'ellipse(100% 50% at 50% 100%)' }}></div> : <div className="absolute -bottom-3 left-0 w-full h-6 bg-white" style={{ clipPath: 'ellipse(100% 100% at 50% 100%)' }}></div>}
            <LogoBlock />
          </div>
          <div className={`flex flex-1 ${isVertical ? 'flex-col px-4 pt-1' : 'flex-row px-4'}`}>
            <PhotoBlock customWrapper={isVertical ? "-mt-10" : "mt-2"} />
            <DetailsBlock />
          </div>
          <div className={`relative px-4 pb-3 flex ${isVertical ? 'justify-between items-end' : 'justify-end items-end absolute bottom-3 right-4'}`}>
            {isVertical && <div className="font-barcode text-xl text-slate-400">||| || ||| ||</div>}
            <SignatureBlock />
          </div>
        </div>
      );
      backContent = (
        <div className="w-full h-full flex flex-col text-center bg-slate-50 p-4">
          <div className="w-12 h-1 mx-auto rounded-full mb-3" style={{ backgroundColor: theme }}></div>
          <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-2">Terms & Conditions</h4>
          <div className="text-[9px] text-slate-600 leading-relaxed text-justify px-2 flex-1 whitespace-pre-wrap">{data.back_side_content}</div>
          <div className="mt-auto border-t border-slate-200 pt-2"><h5 className="text-[10px] font-bold" style={{ color: theme }}>{schoolName}</h5></div>
        </div>
      );
    } 
    else if (data.design_template === 'classic_solid') {
      frontContent = (
        <div className="w-full h-full flex flex-col relative bg-white">
          <div className={`flex items-center justify-center px-4 ${isVertical ? 'h-20' : 'h-16'}`} style={{ backgroundColor: theme }}>
            <LogoBlock />
          </div>
          <div className={`flex flex-1 ${isVertical ? 'flex-col px-4 pt-4' : 'flex-row px-4 pt-2'}`}>
            <PhotoBlock />
            <DetailsBlock />
          </div>
          <div className={`relative px-4 pb-3 flex ${isVertical ? 'justify-between items-end border-t border-slate-100 pt-2 mx-4' : 'justify-end items-end absolute bottom-3 right-4'}`}>
            {isVertical && <div className="font-mono text-[8px] text-slate-400 tracking-widest">ID: STU24001</div>}
            <SignatureBlock />
          </div>
          <div className="h-1.5 w-full mt-auto" style={{ backgroundColor: theme }}></div>
        </div>
      );
      backContent = (
        <div className="w-full h-full flex flex-col bg-white border-2 border-slate-100 p-4">
          <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2 border-b pb-1" style={{ color: theme, borderColor: theme }}>Instructions</h4>
          <div className="text-[8.5px] text-slate-600 leading-relaxed text-justify flex-1 whitespace-pre-wrap">{data.back_side_content}</div>
          <div className="h-1.5 w-full mt-auto absolute bottom-0 left-0" style={{ backgroundColor: theme }}></div>
        </div>
      );
    }
    else if (data.design_template === 'corporate_minimal') {
      frontContent = (
        <div className="w-full h-full flex flex-col relative bg-white border-t-4" style={{ borderColor: theme }}>
          <div className="flex items-center justify-center px-4 pt-4 pb-2">
            <div className={`relative z-10 flex ${isVertical ? 'flex-col items-center' : 'items-center gap-2'}`}>
              {logoPreview && <img src={logoPreview} alt="Logo" className="h-8 object-contain" />}
              <h2 className="font-bold text-slate-800 uppercase text-xs mt-1 text-center tracking-widest">{schoolName}</h2>
            </div>
          </div>
          <div className={`flex flex-1 ${isVertical ? 'flex-col items-center px-4' : 'flex-row px-4 pt-2'}`}>
            <PhotoBlock />
            <DetailsBlock textCol="text-slate-900" />
          </div>
          <div className={`px-4 pb-4 flex ${isVertical ? 'justify-center' : 'justify-end absolute bottom-4 right-4'}`}>
            <SignatureBlock />
          </div>
        </div>
      );
      backContent = (
        <div className="w-full h-full flex flex-col bg-white border-b-4 p-5 text-center" style={{ borderColor: theme }}>
          <Icon name="info" className="w-5 h-5 text-slate-300 mx-auto mb-2" />
          <div className="text-[9px] text-slate-600 leading-relaxed whitespace-pre-wrap">{data.back_side_content}</div>
          <div className="mt-auto text-[8px] font-mono text-slate-400">IF FOUND RETURN TO OFFICE</div>
        </div>
      );
    }
    else if (data.design_template === 'gradient_fluid') {
      frontContent = (
        <div className="w-full h-full flex flex-col relative bg-slate-50 overflow-hidden">
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 -translate-y-10 translate-x-10`} style={{ backgroundColor: theme }}></div>
          <div className={`absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10 translate-y-10 -translate-x-5`} style={{ backgroundColor: theme }}></div>
          <div className={`relative ${isVertical ? 'h-24' : 'h-16 w-full'} flex items-center justify-center px-4`} style={{ background: `linear-gradient(135deg, ${theme}, #00000030)` }}>
            <LogoBlock />
          </div>
          <div className={`flex flex-1 ${isVertical ? 'flex-col px-4 pt-4' : 'flex-row px-4 pt-2'} relative z-10`}>
            <PhotoBlock />
            <DetailsBlock />
          </div>
          <div className={`relative px-4 pb-3 flex ${isVertical ? 'justify-between items-end' : 'justify-end items-end absolute bottom-3 right-4'}`}>
            {isVertical && <div className="font-barcode text-2xl text-slate-400 opacity-50">|||||||</div>}
            <SignatureBlock />
          </div>
        </div>
      );
      backContent = (
        <div className="w-full h-full flex flex-col bg-slate-50 p-5 overflow-hidden relative">
          <div className={`absolute top-0 left-0 w-full h-1`} style={{ backgroundColor: theme }}></div>
          <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-2 z-10">Important Notice</h4>
          <div className="text-[9px] text-slate-600 leading-relaxed whitespace-pre-wrap z-10">{data.back_side_content}</div>
        </div>
      );
    }
    else if (data.design_template === 'polygon_tech') {
      frontContent = (
        <div className="w-full h-full flex flex-col relative bg-white">
          <div className={`relative ${isVertical ? 'h-28' : 'h-20 w-full'} flex items-start justify-center pt-3 px-4`} style={{ backgroundColor: theme, clipPath: isVertical ? 'polygon(0 0, 100% 0, 100% 75%, 0 100%)' : 'polygon(0 0, 100% 0, 100% 100%, 0 70%)' }}>
            <LogoBlock />
          </div>
          <div className={`flex flex-1 ${isVertical ? 'flex-col px-4' : 'flex-row px-4'}`}>
            <PhotoBlock customWrapper={isVertical ? "-mt-12 ml-auto mr-auto" : "-mt-6"} />
            <DetailsBlock />
          </div>
          <div className={`relative px-4 pb-3 flex ${isVertical ? 'justify-between items-end' : 'justify-end items-end absolute bottom-3 right-4'}`}>
            {isVertical && <div className="w-8 h-8 opacity-20 border-4 border-dashed rounded-full" style={{ borderColor: theme }}></div>}
            <SignatureBlock />
          </div>
        </div>
      );
      backContent = (
        <div className="w-full h-full flex flex-col bg-white p-0 relative overflow-hidden">
          <div className="w-full h-8" style={{ backgroundColor: theme, clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 100%)' }}></div>
          <div className="px-5 py-3 flex-1 flex flex-col">
            <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-2">Conditions</h4>
            <div className="text-[8.5px] text-slate-600 leading-relaxed whitespace-pre-wrap">{data.back_side_content}</div>
          </div>
          <div className="w-full h-8 mt-auto" style={{ backgroundColor: theme, clipPath: 'polygon(100% 0, 100% 100%, 0 100%, 100% 100%)' }}></div>
        </div>
      );
    }
    else if (data.design_template === 'elegant_border') {
      frontContent = (
        <div className="w-full h-full p-2 bg-white">
          <div className="w-full h-full border-[3px] flex flex-col relative overflow-hidden" style={{ borderColor: theme }}>
            <div className="flex items-center justify-center px-4 py-3 border-b" style={{ borderColor: theme }}>
              <div className={`relative z-10 flex ${isVertical ? 'flex-col items-center' : 'items-center gap-2'}`}>
                {logoPreview && <img src={logoPreview} alt="Logo" className="h-7 object-contain" />}
                <h2 className="font-bold uppercase text-[10px] text-center tracking-widest" style={{ color: theme }}>{schoolName}</h2>
              </div>
            </div>
            <div className={`flex flex-1 ${isVertical ? 'flex-col px-4 pt-4' : 'flex-row px-4 pt-2'}`}>
              <PhotoBlock />
              <DetailsBlock />
            </div>
            <div className={`relative px-4 pb-3 flex ${isVertical ? 'justify-center items-end' : 'justify-end items-end absolute bottom-3 right-4'}`}>
              <SignatureBlock />
            </div>
          </div>
        </div>
      );
      backContent = (
        <div className="w-full h-full p-2 bg-white">
          <div className="w-full h-full border-[3px] flex flex-col p-4 text-center" style={{ borderColor: theme }}>
            <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: theme }}>Instructions</h4>
            <div className="text-[8.5px] text-slate-600 leading-relaxed whitespace-pre-wrap flex-1">{data.back_side_content}</div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col xl:flex-row gap-6 items-center justify-center pt-4">
        {/* FRONT SIDE */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Front Side</span>
          <div className={`${cardSize} bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden relative shrink-0`}>
             {frontContent}
          </div>
        </div>

        {/* BACK SIDE */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Back Side</span>
          <div className={`${cardSize} bg-slate-50 rounded-xl shadow-lg border border-slate-200 overflow-hidden relative shrink-0`}>
             {backContent}
          </div>
        </div>
      </div>
    );
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

  return (
    <AuthenticatedLayout>
      <Head title={isEdit ? 'Edit ID Card' : 'Create ID Card'} />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Documents / ID Cards</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">{isEdit ? 'Edit ID Card Template' : 'Create New ID Card Template'}</h1>
          </div>
          <Link href={route('admin.documents.idcards.index')} className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm">
            <Icon name="arrow-left" className="w-4 h-4" /> Back to List
          </Link>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 items-start">
          
          {/* Settings Form Side */}
          <div className="w-full xl:w-[480px] shrink-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
               <h3 className="text-lg font-bold text-slate-900">Template Settings</h3>
            </div>

            <form onSubmit={submit} className="p-6 space-y-6">
              
              <div className="pb-6 border-b border-slate-100">
                <label className={labelClass}>Select Design Theme</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {ID_CARD_DESIGNS.map(d => (
                    <div key={d.key} onClick={() => setData('design_template', d.key)} className={`cursor-pointer border-2 rounded-xl p-3 transition-all bg-white hover:-translate-y-0.5 flex flex-col gap-1 ${data.design_template === d.key ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300'}`}>
                      <div className="font-bold text-[12px] text-slate-800 leading-tight">{d.name}</div>
                      <div className="text-[10px] text-slate-500 leading-tight">{d.desc}</div>
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

                <div>
                  <label className={labelClass}>Template Title *</label>
                  <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} required placeholder="e.g. Student ID Card 2024" className={inputClass} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Target Audience</label>
                    <select value={data.audience} onChange={e => setData('audience', e.target.value)} className={`${inputClass} bg-white`}>
                      <option value="student">Student Only</option>
                      <option value="staff">Staff / Teacher</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Layout Type</label>
                    <select value={data.layout_type} onChange={e => setData('layout_type', e.target.value)} className={`${inputClass} bg-white font-bold text-indigo-700`}>
                      <option value="vertical">Portrait (Vertical)</option>
                      <option value="horizontal">Landscape (Horizontal)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Text Alignment</label>
                    <select value={data.text_align} onChange={e => setData('text_align', e.target.value)} className={`${inputClass} bg-white`}>
                      <option value="center">Center</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Theme Color</label>
                    <div className="flex items-center gap-3 mt-1">
                      <input type="color" value={data.theme_color} onChange={e => setData('theme_color', e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                      <span className="text-sm font-mono text-slate-500 uppercase">{data.theme_color}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
                  <strong className="text-xs font-bold text-slate-800 block border-b border-slate-200 pb-2">Toggle Display Fields</strong>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" checked={data.show_blood_group} onChange={e => setData('show_blood_group', e.target.checked)} /> Blood Grp</label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" checked={data.show_phone} onChange={e => setData('show_phone', e.target.checked)} /> Phone</label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" checked={data.show_address} onChange={e => setData('show_address', e.target.checked)} /> Address</label>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Back Side Instruction Text</label>
                  <textarea rows="3" value={data.back_side_content} onChange={e => setData('back_side_content', e.target.value)} placeholder="Terms and instructions for the back of the card..." className={`${inputClass} resize-none`}></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 border border-slate-200 rounded-xl">
                    <strong className="text-xs font-bold text-slate-800 mb-2 block">Upload Logo</strong>
                    <input type="file" accept="image/*" onChange={e => handleImageChange('logo_image', e.target.files[0], setLogoPreview)} className="block w-full text-[10px] file:mr-2 file:py-1.5 file:px-2 file:rounded-md file:border-0 file:bg-indigo-100 file:text-indigo-700 cursor-pointer" />
                  </div>
                  <div className="bg-slate-50 p-3 border border-slate-200 rounded-xl">
                    <strong className="text-xs font-bold text-slate-800 mb-2 block">Authorized Signature</strong>
                    <input type="file" accept="image/*" onChange={e => handleImageChange('signature_image', e.target.files[0], setSigPreview)} className="block w-full text-[10px] file:mr-2 file:py-1.5 file:px-2 file:rounded-md file:border-0 file:bg-indigo-100 file:text-indigo-700 cursor-pointer" />
                  </div>
                </div>
                
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="rounded w-5 h-5 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-sm font-bold text-slate-700">Active Template</span>
                </label>
                <button type="submit" disabled={processing} className="flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md disabled:opacity-70 active:scale-95">
                  {processing ? 'Saving...' : <><Icon name="save" className="w-4 h-4" /> Save ID Card</>}
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview Side */}
          <div className="w-full flex-1 xl:sticky xl:top-24 flex flex-col items-center">
            <div className="w-full flex items-center justify-center gap-2 mb-4 bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse border-2 border-slate-900"></span> Live ID Card Preview
            </div>
            
            <div className="w-full rounded-2xl p-6 bg-slate-200/50 border border-slate-200 flex justify-center overflow-x-auto custom-scrollbar min-h-[500px]">
              {renderIdCardPreview()}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}