import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';
import IdCardPreview from "./Partials/IdCardPreview";
import { CARD_TEMPLATES, CARD_SIZE, FIELD_LABEL_DEFAULTS } from './Partials/idCardTemplates';

const MAX_IMAGE_MB = 2;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const BACK_CONTENT_LIMIT = 220;
const THUMB_WIDTH = 96;

const THEME_PRESETS = [
  { name: 'Forest Green', value: '#1B4332' },
  { name: 'Emerald', value: '#166534' },
  { name: 'Gold', value: '#B8860B' },
  { name: 'Slate Navy', value: '#1e293b' },
  { name: 'Maroon', value: '#7f1d1d' },
  { name: 'Royal Blue', value: '#1e3a8a' },
];

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-rose-500 text-xs mt-1">{message}</p>;
}

function AlignPicker({ value, onChange }) {
  return (
    <div className="flex items-center bg-slate-100 p-1 rounded-xl w-max border border-slate-200">
      {['left', 'center', 'right'].map((opt) => (
        <button
          type="button"
          key={opt}
          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${value === opt ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => onChange(opt)}
        >
          {opt.charAt(0).toUpperCase() + opt.slice(1)}
        </button>
      ))}
    </div>
  );
}

function thumbGeometry(template, layoutType) {
  const orientation = template.orientation === 'any' ? layoutType : template.orientation;
  const size = CARD_SIZE[orientation] ?? CARD_SIZE.Portrait;
  const scale = THUMB_WIDTH / size.width;
  return { width: size.width, height: size.height, scale, thumbHeight: size.height * scale };
}

function ImageField({ label, preview, error, onChange, onRemove, inputRef, fullWidth }) {
  return (
    <label className={`block ${fullWidth ? 'sm:col-span-2' : ''}`}>
      <span className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</span>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {preview && (
          <div className="relative group shrink-0">
            <img src={preview} alt="" className="h-14 rounded-lg border border-slate-200 shadow-sm object-cover" />
            <button type="button" className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity" onClick={onRemove} title={`Remove ${label}`}>
              <Icon name="x" className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="w-full">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => onChange(e.target.files[0])}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all border border-slate-200 rounded-xl bg-slate-50 cursor-pointer"
          />
          <div className="text-xs text-slate-400 mt-1.5">JPG, PNG, or WEBP — up to {MAX_IMAGE_MB}MB.</div>
        </div>
      </div>
      <FieldError message={error} />
    </label>
  );
}

export default function IdCardForm({ item, campuses, activeCampusId }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some((r) => r.name === 'Super Admin');

  const { data, setData, post, processing, errors, reset, isDirty } = useForm({
    _method: isEdit ? 'put' : 'post',
    campus_id: item?.campus_id ?? activeCampusId,
    title: item?.title ?? 'Standard Student ID',
    layout_type: item?.layout_type ?? 'Portrait',
    theme_color: item?.theme_color ?? '#1e293b',
    design_template: item?.design_template ?? 'classic-solid',
    text_align: item?.text_align ?? 'center',
    photo_align: item?.photo_align ?? 'center',
    field_labels: { ...FIELD_LABEL_DEFAULTS, ...(item?.field_labels ?? {}) },
    show_blood_group: item?.show_blood_group ?? true,
    show_address: item?.show_address ?? false,
    show_phone: item?.show_phone ?? true,
    back_side_content: item?.back_side_content ?? 'If found, please return to the school administration.',
    is_active: item?.is_active ?? true,
    logo_image: null,
    signature_image: null,
    background_image: null,
    remove_logo_image: false,
    remove_signature_image: false,
    remove_background_image: false,
  });

  const [logoPreview, setLogoPreview] = useState(item?.logo_image ? `/storage/${item.logo_image}` : null);
  const [sigPreview, setSigPreview] = useState(item?.signature_image ? `/storage/${item.signature_image}` : null);
  const [bgPreview, setBgPreview] = useState(item?.background_image ? `/storage/${item.background_image}` : null);
  const [imageErrors, setImageErrors] = useState({ logo: '', signature: '', background: '' });
  const [previewSide, setPreviewSide] = useState('front');

  const fileInputRefs = { logo: useRef(), signature: useRef(), background: useRef() };
  const objectUrls = useRef([]);

  useEffect(() => {
    return () => objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const currentCampusName = campuses?.find((c) => String(c.id) === String(data.campus_id))?.name || item?.campus?.name || 'Assigned Campus';

  function validateImage(file) {
    if (!ACCEPTED_TYPES.includes(file.type)) return 'Please choose a JPG, PNG, or WEBP image.';
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) return `Image must be smaller than ${MAX_IMAGE_MB}MB.`;
    return '';
  }

  function handleImageChange(key, field, removeFlagField, file, setPreview) {
    if (!file) return;
    const error = validateImage(file);
    setImageErrors((prev) => ({ ...prev, [key]: error }));
    if (error) return;

    const url = URL.createObjectURL(file);
    objectUrls.current.push(url);
    setData((prevData) => ({ ...prevData, [field]: file, [removeFlagField]: false }));
    setPreview(url);
  }

  function removeImage(key, field, removeFlagField, setPreview, hadSavedFile) {
    setData((prevData) => ({ ...prevData, [field]: null, [removeFlagField]: hadSavedFile }));
    setPreview(null);
    setImageErrors((prev) => ({ ...prev, [key]: '' }));
    if (fileInputRefs[key].current) fileInputRefs[key].current.value = '';
  }

  function selectTemplate(template) {
    const nextLayout = template.orientation === 'any' ? data.layout_type : template.orientation;
    setData((prev) => ({ ...prev, design_template: template.key, layout_type: nextLayout }));
  }

  function submit(e) {
    e.preventDefault();
    if (Object.values(imageErrors).some(Boolean)) return;

    const options = {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        Swal.fire({ icon: 'success', title: isEdit ? 'Template updated' : 'Template created', timer: 1500, showConfirmButton: false });
        if (!isEdit) reset();
      },
      onError: () => {
        Swal.fire({ icon: 'error', title: 'Please check the form', text: 'Some fields need your attention before this can be saved.' });
      },
    };

    if (isEdit) {
      post(route('admin.documents.idcards.update', item.id), options);
    } else {
      post(route('admin.documents.idcards.store'), options);
    }
  }

  const backLength = data.back_side_content?.length ?? 0;
  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";

  return (
    <AuthenticatedLayout>
      <Head title={isEdit ? 'Edit ID Card' : 'Create ID Card'} />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Documents / ID Cards</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">{isEdit ? 'Edit ID Card Template' : 'Create Live ID Card Template'}</h1>
          </div>
          <Link href={route('admin.documents.idcards.index')} className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm">
            <Icon name="arrow-left" className="w-4 h-4" /> Back to List
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ================= LEFT SIDE: EDIT FORM ================= */}
          <div className="w-full lg:w-[65%] shrink-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">Template Settings</h3>
            </div>

            <form onSubmit={submit} className="p-6 space-y-8" noValidate>
              
              {/* Design Gallery */}
              <div>
                <strong className="text-sm font-bold text-slate-800 block mb-3">Card Design (Shape & Style)</strong>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {CARD_TEMPLATES.map((tpl) => {
                    const geo = thumbGeometry(tpl, data.layout_type);
                    return (
                      <button
                        type="button"
                        key={tpl.key}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all bg-white hover:-translate-y-0.5 ${data.design_template === tpl.key ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-slate-200 hover:border-indigo-300'}`}
                        onClick={() => selectTemplate(tpl)}
                      >
                        <div className="overflow-hidden rounded bg-slate-100 flex items-center justify-center pointer-events-none mb-2 shadow-sm" style={{ width: THUMB_WIDTH, height: geo.thumbHeight }}>
                          <div style={{ transform: `scale(${geo.scale})`, transformOrigin: 'top left', width: geo.width, height: geo.height }}>
                            <IdCardPreview
                              side="front"
                              templateKey={tpl.key}
                              layoutType={data.layout_type}
                              themeColor={data.theme_color}
                              textAlign={data.text_align}
                              photoAlign={data.photo_align}
                              fieldLabels={data.field_labels}
                              showBloodGroup={data.show_blood_group}
                              showPhone={data.show_phone}
                              showAddress={data.show_address}
                              logoPreview={logoPreview}
                              sigPreview={sigPreview}
                              bgPreview={bgPreview}
                            />
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 leading-tight">{tpl.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Campus *</label>
                  {isSuperAdmin ? (
                    <select value={data.campus_id} onChange={(e) => setData('campus_id', e.target.value)} required className={inputClass}>
                      <option value="" disabled>Select Campus</option>
                      {campuses?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  ) : (
                    <div className="px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 flex items-center gap-2">
                      <Icon name="building" className="w-4 h-4" /> {currentCampusName}
                    </div>
                  )}
                  <FieldError message={errors.campus_id} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Template Title *</label>
                  <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} maxLength={100} required className={inputClass} />
                  <FieldError message={errors.title} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Layout Orientation *</label>
                  <select value={data.layout_type} onChange={(e) => setData('layout_type', e.target.value)} className={inputClass}>
                    <option value="Portrait">Portrait (Vertical)</option>
                    <option value="Landscape">Landscape (Horizontal)</option>
                  </select>
                  <FieldError message={errors.layout_type} />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Primary Theme Color *</label>
                  <div className="flex items-center gap-4">
                    <input type="color" value={data.theme_color} onChange={(e) => setData('theme_color', e.target.value)} className="w-12 h-10 p-0.5 rounded cursor-pointer border border-slate-300" />
                    <input type="text" value={data.theme_color} onChange={(e) => setData('theme_color', e.target.value)} className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none" />
                    <div className="flex items-center gap-2 ml-4">
                      {THEME_PRESETS.map((preset) => (
                        <button
                          type="button"
                          key={preset.value}
                          title={preset.name}
                          className={`w-6 h-6 rounded-full cursor-pointer hover:scale-110 transition-transform border-2 ${data.theme_color?.toLowerCase() === preset.value.toLowerCase() ? 'border-indigo-600 scale-110 shadow-sm' : 'border-transparent'}`}
                          style={{ background: preset.value }}
                          onClick={() => setData('theme_color', preset.value)}
                        />
                      ))}
                    </div>
                  </div>
                  <FieldError message={errors.theme_color} />
                </div>

                {/* Alignment */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Photo / Logo Alignment</label>
                  <AlignPicker value={data.photo_align} onChange={(v) => setData('photo_align', v)} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name &amp; Text Alignment</label>
                  <AlignPicker value={data.text_align} onChange={(v) => setData('text_align', v)} />
                </div>

                {/* File Uploads */}
                <ImageField
                  fullWidth
                  label="School Logo"
                  inputRef={fileInputRefs.logo}
                  preview={logoPreview}
                  error={imageErrors.logo || errors.logo_image}
                  onChange={(file) => handleImageChange('logo', 'logo_image', 'remove_logo_image', file, setLogoPreview)}
                  onRemove={() => removeImage('logo', 'logo_image', 'remove_logo_image', setLogoPreview, !!item?.logo_image)}
                />

                <ImageField
                  fullWidth
                  label="Authority Signature"
                  inputRef={fileInputRefs.signature}
                  preview={sigPreview}
                  error={imageErrors.signature || errors.signature_image}
                  onChange={(file) => handleImageChange('signature', 'signature_image', 'remove_signature_image', file, setSigPreview)}
                  onRemove={() => removeImage('signature', 'signature_image', 'remove_signature_image', setSigPreview, !!item?.signature_image)}
                />

                <ImageField
                  fullWidth
                  label="Card Background / Watermark (Optional)"
                  inputRef={fileInputRefs.background}
                  preview={bgPreview}
                  error={imageErrors.background || errors.background_image}
                  onChange={(file) => handleImageChange('background', 'background_image', 'remove_background_image', file, setBgPreview)}
                  onRemove={() => removeImage('background', 'background_image', 'remove_background_image', setBgPreview, !!item?.background_image)}
                />

                {/* Field Labels */}
                <div className="sm:col-span-2">
                  <strong className="text-sm font-bold text-slate-800 block mb-3 border-b border-slate-200 pb-2">Custom Field Labels</strong>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {Object.keys(FIELD_LABEL_DEFAULTS).map((key) => (
                      <div key={key}>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{FIELD_LABEL_DEFAULTS[key]}</label>
                        <input
                          type="text"
                          maxLength={24}
                          value={data.field_labels?.[key] ?? FIELD_LABEL_DEFAULTS[key]}
                          onChange={(e) => setData('field_labels', { ...data.field_labels, [key]: e.target.value })}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Display Toggles */}
                <div className="sm:col-span-2 flex flex-wrap gap-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={data.show_blood_group} onChange={(e) => setData('show_blood_group', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                    <span className="text-sm font-semibold text-slate-700">Show Blood Group</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={data.show_phone} onChange={(e) => setData('show_phone', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                    <span className="text-sm font-semibold text-slate-700">Show Phone</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={data.show_address} onChange={(e) => setData('show_address', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                    <span className="text-sm font-semibold text-slate-700">Show Address</span>
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Back Side Terms &amp; Conditions</label>
                  <textarea
                    rows="3"
                    value={data.back_side_content}
                    maxLength={BACK_CONTENT_LIMIT}
                    onChange={(e) => setData('back_side_content', e.target.value)}
                    className={`${inputClass} resize-none`}
                  ></textarea>
                  <div className="flex justify-between items-center mt-1">
                    <FieldError message={errors.back_side_content} />
                    <span className="text-[11px] font-bold text-slate-400 ml-auto">{backLength}/{BACK_CONTENT_LIMIT}</span>
                  </div>
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
            
            <div className="flex bg-slate-100 p-1 rounded-xl mb-4 shadow-inner border border-slate-200">
              <button type="button" className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${previewSide === 'front' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setPreviewSide('front')}>Front View</button>
              <button type="button" className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${previewSide === 'back' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setPreviewSide('back')}>Back View</button>
            </div>

            <div className="p-4 bg-slate-200/50 rounded-2xl shadow-inner border border-slate-200 flex justify-center w-full overflow-x-auto">
              <div className="shadow-2xl rounded-xl overflow-hidden ring-1 ring-slate-900/5">
                <IdCardPreview
                  side={previewSide}
                  templateKey={data.design_template}
                  layoutType={data.layout_type}
                  themeColor={data.theme_color}
                  textAlign={data.text_align}
                  photoAlign={data.photo_align}
                  fieldLabels={data.field_labels}
                  showBloodGroup={data.show_blood_group}
                  showPhone={data.show_phone}
                  showAddress={data.show_address}
                  backContent={data.back_side_content}
                  logoPreview={logoPreview}
                  sigPreview={sigPreview}
                  bgPreview={bgPreview}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <Icon name="info" className="w-4 h-4 text-indigo-500" /> Preview uses sample data — actual cards pull real records.
            </div>

          </div>

        </div>
      </div>
    </AuthenticatedLayout>
  );
}