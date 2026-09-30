import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';
import { useState } from 'react';

export default function CmsFormModal({ item, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, processing, reset, transform, isDirty } = useForm({
    _method: isEdit ? 'put' : 'post',
    campus_id: item?.campus_id ?? activeCampusId,
    title: item?.title ?? '',
    slug: item?.slug ?? '',
    content_type: item?.content_type ?? 'Page',
    content_body: item?.content_body ?? '',
    is_published: item?.is_published ?? true,
    featured_image: null,
  });

  const [preview, setPreview] = useState(item?.featured_image ? `/storage/${item.featured_image}` : null);

  const handleImage = (e) => {
    const file = e.target.files[0];
    setData('featured_image', file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setData('featured_image', null);
    setPreview(null);
  };

  function submit(e) {
    e.preventDefault();

    transform((currentData) => ({
      ...currentData,
      campus_id: currentData.campus_id || activeCampusId
    }));

    const routeName = isEdit ? route('admin.communication.cms.update', item.id) : route('admin.communication.cms.store');

    post(routeName, {
      onSuccess: () => { reset(); onClose(); }
    });
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>

      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Web Content' : 'Create Web Content'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure CMS page details, slug, and body.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div className="sm:col-span-2">
                <label className={labelClass}>Campus Bounds</label>
                <select
                  value={data.campus_id || ''}
                  onChange={(e) => setData('campus_id', e.target.value)}
                  disabled={!isSuperAdmin}
                  className={`${inputClass} ${!isSuperAdmin ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'}`}
                >
                  <option value="">Global Website (All Campuses)</option>
                  {campuses?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {!isSuperAdmin && <small className="text-xs text-slate-400 mt-1 block">You can only create content for your active campus.</small>}
              </div>

              <div>
                <label className={labelClass}>Title / Headline <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={data.title}
                  onChange={e => setData('title', e.target.value)}
                  required
                  autoFocus
                  placeholder="e.g. About Us"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Content Type <span className="text-rose-500">*</span></label>
                <select value={data.content_type} onChange={e => setData('content_type', e.target.value)} className={`${inputClass} bg-white font-semibold text-indigo-700`}>
                  <option value="Page">Custom Page</option>
                  <option value="Blog">Blog Post</option>
                  <option value="News">School News</option>
                  <option value="Article">Article</option>
                  <option value="Notice">Notice / Announcement</option>
                  <option value="Banner">Homepage Banner</option>
                  <option value="Event">Website Event</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>URL Slug (Leave empty to auto-generate)</label>
                <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                  <span className="px-4 py-2.5 text-xs font-semibold text-slate-400 bg-slate-100 border-r border-slate-200 flex items-center select-none">
                    yoursite.com/
                  </span>
                  <input
                    type="text"
                    value={data.slug}
                    onChange={e => setData('slug', e.target.value)}
                    placeholder="e.g. about-us"
                    className="flex-1 px-4 py-2.5 bg-transparent border-0 text-sm text-slate-700 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Content Body HTML</label>
                <textarea
                  rows="6"
                  value={data.content_body}
                  onChange={e => setData('content_body', e.target.value)}
                  placeholder="Write your HTML or plain text content here..."
                  className={`${inputClass} resize-none font-mono text-xs leading-relaxed`}
                />
              </div>

              {/* Featured Image with Preview & Remove Button */}
              <div className="sm:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className={labelClass}>Featured Image (Banner/Thumbnail)</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2">
                  {preview ? (
                    <div className="relative group shrink-0">
                      <img src={preview} alt="Preview" className="w-24 h-16 object-cover rounded-lg border border-slate-300 shadow-sm" />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove Image"
                      >
                        <Icon name="x" className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-16 bg-white flex items-center justify-center rounded-lg border border-slate-200 text-slate-300 shrink-0">
                      <Icon name="image" className="w-6 h-6" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 transition-all border border-slate-200 rounded-xl bg-white cursor-pointer"
                  />
                </div>
              </div>

              {/* Publish Toggle */}
              <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer group w-max">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={data.is_published}
                      onChange={(e) => setData('is_published', e.target.checked)}
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-0 checked:bg-emerald-600 checked:border-emerald-600 cursor-pointer transition-colors"
                    />
                    <svg className="absolute w-3.5 h-3.5 top-[3px] left-[3px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Published (Visible on website immediately)</span>
                </label>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
            <span className="text-sm font-bold text-amber-500">{isDirty ? 'Unsaved changes' : ''}</span>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} disabled={processing} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm active:scale-95">
                Cancel
              </button>
              <button type="submit" disabled={processing} className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
                {processing ? (
                  <><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Saving...</>
                ) : (
                  <><Icon name="save" className="w-4 h-4" /> Save Content</>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
