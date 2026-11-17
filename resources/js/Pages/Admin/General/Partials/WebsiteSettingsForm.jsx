import { useForm } from '@inertiajs/react';
import usePhotoPreview from '@/Hooks/usePhotoPreview';

const sections = [
  {
    id: 'school', title: 'School information', description: 'School name and short text shown in the site header.',
    fields: [['school_name', 'School full name', 'text'], ['school_short_name', 'Short name', 'text'], ['school_tagline', 'Header tagline', 'text']],
    textareas: [], images: [],
  },
  {
    id: 'contact', title: 'Contact details', description: 'Public contact details shown on the website.',
    fields: [['primary_phone', 'Primary mobile', 'tel'], ['secondary_phone', 'Secondary mobile', 'tel'], ['email', 'Public email', 'email']],
    textareas: [['address', 'School address'], ['footer_description', 'Footer description']], images: [],
  },
  {
    id: 'admissions', title: 'Admissions', description: 'Admission session and deadline shown to visitors.',
    fields: [['admission_session', 'Admission session', 'text'], ['admission_deadline', 'Admission deadline', 'text']],
    textareas: [], images: [],
  },
  {
    id: 'homepage', title: 'Homepage content', description: 'Homepage message, school leadership quote and social links.',
    fields: [['hero_eyebrow', 'Small heading', 'text'], ['hero_title', 'Main heading', 'text'], ['principal_name', 'Principal / Head name', 'text'], ['facebook_url', 'Facebook URL', 'url'], ['youtube_url', 'YouTube URL', 'url'], ['linkedin_url', 'LinkedIn URL', 'url']],
    textareas: [['hero_description', 'Homepage description'], ['principal_message', 'Principal message']], images: [],
  },
  {
    id: 'branding', title: 'Logo & appearance', description: 'Shared logos, browser icon, website colors and footer text.',
    fields: [['primary_color', 'Website primary color', 'color'], ['accent_color', 'Website accent color', 'color'], ['powered_by_text', 'Powered by text', 'text'], ['copyright_text', 'Copyright text', 'text']],
    textareas: [], images: [['logo', 'Website header logo'], ['footer_logo', 'Website footer logo'], ['admin_logo', 'Admin portal logo'], ['favicon', 'Browser icon (favicon)']],
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

export default function WebsiteSettingsForm({ settings }) {
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
      onError: validationErrors => {
        const key = Object.keys(validationErrors)[0];
        const section = sections.find(item => item.fields.some(([field]) => field === key)
          || item.textareas.some(([field]) => field === key)
          || item.images.some(([field]) => field === key)
          || (key === 'file' && item.id === 'branding'));
        if (section) document.getElementById(`website-section-${section.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
    });
  };

  return <form id="school-website-settings" onSubmit={submit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
    <header className="border-b border-slate-200 pb-5">
      <h2 className="text-xl font-bold text-slate-900">School & Website Settings</h2>
      <p className="mt-1 text-sm text-slate-500">All settings are visible below. Changes apply across all campuses.</p>
    </header>
    {errors.file && <p role="alert" className="text-sm text-rose-700">{errors.file}</p>}
    <div className="space-y-8">
      {sections.map(section => <section id={`website-section-${section.id}`} key={section.id} className="scroll-mt-24 border-b border-slate-100 pb-8 last:border-0 last:pb-0">
        <div className="mb-5">
          <h3 className="text-lg font-bold text-slate-900">{section.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{section.description}</p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {section.fields.map(([key, label, type]) => <label key={key}>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
            <input type={type} value={data[key] ?? ''} onChange={event => setData(key, event.target.value)} className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
            {errors[key] && <span className="mt-1 block text-xs text-rose-600">{errors[key]}</span>}
          </label>)}
          {section.textareas.map(([key, label]) => <label key={key} className="md:col-span-2">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
            <textarea rows={3} value={data[key] ?? ''} onChange={event => setData(key, event.target.value)} className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
            {errors[key] && <span className="mt-1 block text-xs text-rose-600">{errors[key]}</span>}
          </label>)}
        </div>
        {section.images.length > 0 && <div className="mt-7 grid grid-cols-1 gap-5 border-t border-slate-200 pt-6 md:grid-cols-2">
          {section.images.map(([key, label]) => <BrandingImage key={key} imageKey={key} label={label} settings={settings} data={data} setData={setData} error={errors[key]} />)}
        </div>}
      </section>)}
    </div>
    <div className="flex justify-end border-t border-slate-200 pt-5">
      <button disabled={processing} className="w-full rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto">{processing ? 'Saving...' : 'Save all settings'}</button>
    </div>
  </form>;
}
