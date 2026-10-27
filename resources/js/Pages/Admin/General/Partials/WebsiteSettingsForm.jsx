import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import Icon from '@/Components/Icons';
import usePhotoPreview from '@/Hooks/usePhotoPreview';

const sections = [
  {
    id: 'school',
    title: 'School information',
    description: 'School name and the short text shown in the site header.',
    fields: [['school_name', 'School full name', 'text'], ['school_short_name', 'Short name', 'text'], ['school_tagline', 'Header tagline', 'text']],
    textareas: [],
    images: [],
  },
  {
    id: 'contact',
    title: 'Contact details',
    description: 'Public contact information shown on the website.',
    fields: [['primary_phone', 'Primary mobile', 'tel'], ['secondary_phone', 'Secondary mobile', 'tel'], ['email', 'Public email', 'email']],
    textareas: [['address', 'School address'], ['footer_description', 'Footer description']],
    images: [],
  },
  {
    id: 'admissions',
    title: 'Admissions',
    description: 'Current admission session and deadline displayed to visitors.',
    fields: [['admission_session', 'Admission session', 'text'], ['admission_deadline', 'Admission deadline', 'text']],
    textareas: [],
    images: [],
  },
  {
    id: 'homepage',
    title: 'Homepage content',
    description: 'Main homepage message, school leadership quote and social links.',
    fields: [
      ['hero_eyebrow', 'Small heading', 'text'], ['hero_title', 'Main heading', 'text'],
      ['principal_name', 'Principal / Head name', 'text'], ['facebook_url', 'Facebook URL', 'url'],
      ['youtube_url', 'YouTube URL', 'url'], ['linkedin_url', 'LinkedIn URL', 'url'],
    ],
    textareas: [['hero_description', 'Homepage description'], ['principal_message', 'Principal message']],
    images: [],
  },
  {
    id: 'branding',
    title: 'Logo & appearance',
    description: 'Shared logos, browser icon, website colors and footer text.',
    fields: [['primary_color', 'Website primary color', 'color'], ['accent_color', 'Website accent color', 'color'], ['powered_by_text', 'Powered by text', 'text'], ['copyright_text', 'Copyright text', 'text']],
    textareas: [],
    images: [['logo', 'Website header logo'], ['footer_logo', 'Website footer logo'], ['admin_logo', 'Admin portal logo'], ['favicon', 'Browser icon (favicon)']],
  },
];

function BrandingImage({ imageKey, label, settings, data, setData, error }) {
  const preview = usePhotoPreview(data[imageKey], data[`remove_${imageKey}`] ? null : settings[imageKey]);
  return <div className="rounded-xl border border-slate-200 p-4">
    <label htmlFor={`branding-${imageKey}`} className="mb-3 block text-sm font-bold text-slate-800">{label}</label>
    {preview && <img src={preview} alt={`${label} preview`} className="mb-3 h-20 max-w-full rounded-lg object-contain" />}
    <input id={`branding-${imageKey}`} type="file" accept={imageKey === 'favicon' ? '.png,.jpg,.jpeg,.webp,.ico' : '.png,.jpg,.jpeg,.webp'}
      onChange={event => { setData(imageKey, event.target.files[0] || null); setData(`remove_${imageKey}`, false); }}
      className="block w-full text-xs text-slate-500 file:mr-2 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:font-semibold file:text-indigo-700" />
    <p className="mt-2 text-xs text-slate-500">{imageKey === 'favicon' ? 'Up to 1 MB. PNG or ICO recommended.' : 'PNG, JPEG or WebP, up to 4 MB. Transparent PNG works well for logos.'}</p>
    {settings[imageKey] && <label className="mt-3 flex items-center gap-2 text-xs text-rose-600"><input type="checkbox" checked={data[`remove_${imageKey}`]} onChange={event => { setData(`remove_${imageKey}`, event.target.checked); if (event.target.checked) setData(imageKey, null); }} /> Remove current image</label>}
    {error && <span role="alert" className="mt-1 block text-xs text-rose-600">{error}</span>}
  </div>;
}

export default function WebsiteSettingsForm({ settings, onClose }) {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const { data, setData, post, processing, errors } = useForm({
    ...Object.fromEntries(Object.keys(settings).map(key => [key, settings[key] ?? ''])),
    logo: null, footer_logo: null, admin_logo: null, favicon: null,
    remove_logo: false, remove_footer_logo: false, remove_admin_logo: false, remove_favicon: false,
  });
  const submit = event => {
    event.preventDefault();
    post(route('admin.general.website.update'), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: onClose,
      onError: validationErrors => {
        const key = Object.keys(validationErrors)[0];
        const section = sections.find(item =>
          item.fields.some(([field]) => field === key)
          || item.textareas.some(([field]) => field === key)
          || item.images.some(([field]) => field === key)
          || (key === 'file' && item.id === 'branding')
        );
        if (section) setActiveSection(section.id);
      },
    });
  };
  const section = sections.find(item => item.id === activeSection) ?? sections[0];

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm" onClick={onClose}>
    <form onSubmit={submit} onClick={e => e.stopPropagation()} className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7"><div><h2 className="text-xl font-bold text-slate-900">School & Website Settings</h2><p className="mt-1 text-sm text-slate-500">বিষয় অনুযায়ী tab বেছে তথ্য পরিবর্তন করুন। এগুলো সব campus-এর shared settings।</p></div><button type="button" aria-label="Close website settings" onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"><Icon name="close" className="h-4 w-4" /></button></div>
      <div className="overflow-x-auto border-b border-slate-200 px-5 sm:px-7">
        <div className="flex min-w-max gap-2 py-3" aria-label="Website settings categories">
          {sections.map(item => <button key={item.id} type="button" aria-pressed={activeSection === item.id} onClick={() => setActiveSection(item.id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${activeSection === item.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {item.title}
          </button>)}
        </div>
      </div>
      <div className="overflow-y-auto p-5 sm:p-7">
        {errors.file && <p role="alert" className="mb-4 text-sm text-rose-700">{errors.file}</p>}
        <div className="mb-5">
          <h3 className="text-lg font-bold text-slate-900">{section.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{section.description}</p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {section.fields.map(([key, label, type]) => <label key={key}><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span><input type={type} value={data[key] ?? ''} onChange={e => setData(key, e.target.value)} className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-indigo-500 focus:ring-indigo-500" />{errors[key] && <span className="mt-1 block text-xs text-rose-600">{errors[key]}</span>}</label>)}
          {section.textareas.map(([key, label]) => <label key={key} className="md:col-span-2"><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span><textarea rows={3} value={data[key] ?? ''} onChange={e => setData(key, e.target.value)} className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-indigo-500 focus:ring-indigo-500" />{errors[key] && <span className="mt-1 block text-xs text-rose-600">{errors[key]}</span>}</label>)}
        </div>
        {section.images.length > 0 && <div className="mt-7 grid grid-cols-1 gap-5 border-t border-slate-200 pt-6 md:grid-cols-2">
          {section.images.map(([key, label]) => <BrandingImage key={key} imageKey={key} label={label} settings={settings} data={data} setData={setData} error={errors[key]} />)}
        </div>}
      </div>
      <div className="flex justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-7"><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700">Cancel</button><button disabled={processing} className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{processing ? 'Saving...' : 'Save all settings'}</button></div>
    </form>
  </div>;
}
