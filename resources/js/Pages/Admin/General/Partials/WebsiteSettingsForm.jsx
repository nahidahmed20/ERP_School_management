import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';
import usePhotoPreview from '@/Hooks/usePhotoPreview';

const fields = [
  ['school_name', 'School full name', 'text'], ['school_short_name', 'Short name', 'text'],
  ['school_tagline', 'Header tagline', 'text'], ['primary_phone', 'Primary mobile', 'tel'],
  ['secondary_phone', 'Secondary mobile', 'tel'], ['email', 'Public email', 'email'],
  ['admission_session', 'Admission session', 'text'], ['admission_deadline', 'Admission deadline', 'text'],
  ['facebook_url', 'Facebook URL', 'url'], ['youtube_url', 'YouTube URL', 'url'],
  ['linkedin_url', 'LinkedIn URL', 'url'], ['powered_by_text', 'Powered by text', 'text'],
  ['hero_eyebrow', 'Hero small heading', 'text'], ['hero_title', 'Hero main heading', 'text'],
  ['principal_name', 'Principal / Head name', 'text'], ['primary_color', 'Website primary color', 'color'], ['accent_color', 'Website accent color', 'color'],
];
const images = [['logo', 'School logo — website & admin portal'], ['footer_logo', 'Website footer logo'], ['favicon', 'Browser icon (favicon)']];

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
  const { data, setData, post, processing, errors } = useForm({
    ...Object.fromEntries(Object.keys(settings).map(key => [key, settings[key] ?? ''])),
    logo: null, footer_logo: null, favicon: null,
    remove_logo: false, remove_footer_logo: false, remove_favicon: false,
  });
  const submit = event => {
    event.preventDefault();
    post(route('admin.general.website.update'), { forceFormData: true, preserveScroll: true, onSuccess: onClose });
  };

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm" onClick={onClose}>
    <form onSubmit={submit} onClick={e => e.stopPropagation()} className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7"><div><h2 className="text-xl font-bold text-slate-900">School Logo & Website Settings</h2><p className="mt-1 text-sm text-slate-500">Logo ও school name frontend, login এবং admin portal-এ ব্যবহার হবে। এটি সব campus-এর shared branding।</p></div><button type="button" aria-label="Close branding settings" onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"><Icon name="close" className="h-4 w-4" /></button></div>
      <div className="overflow-y-auto p-5 sm:p-7">
        {errors.file && <p role="alert" className="mb-4 text-sm text-rose-700">{errors.file}</p>}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {fields.map(([key, label, type]) => <label key={key}><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span><input type={type} value={data[key] ?? ''} onChange={e => setData(key, e.target.value)} className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-indigo-500 focus:ring-indigo-500" />{errors[key] && <span className="mt-1 block text-xs text-rose-600">{errors[key]}</span>}</label>)}
          {['hero_description', 'principal_message', 'address', 'footer_description', 'copyright_text'].map(key => <label key={key} className={key === 'copyright_text' ? '' : 'md:col-span-2'}><span className="mb-1.5 block text-sm font-semibold capitalize text-slate-700">{key.replaceAll('_', ' ')}</span><textarea rows={['hero_description','principal_message','footer_description'].includes(key) ? 3 : 2} value={data[key] ?? ''} onChange={e => setData(key, e.target.value)} className="w-full rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-indigo-500 focus:ring-indigo-500" />{errors[key] && <span className="mt-1 block text-xs text-rose-600">{errors[key]}</span>}</label>)}
        </div>
        <div className="mt-7 grid grid-cols-1 gap-5 border-t border-slate-200 pt-6 md:grid-cols-3">
          {images.map(([key, label]) => <BrandingImage key={key} imageKey={key} label={label} settings={settings} data={data} setData={setData} error={errors[key]} />)}
        </div>
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-7"><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700">Cancel</button><button disabled={processing} className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{processing ? 'Saving...' : 'Save website settings'}</button></div>
    </form>
  </div>;
}
