import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';
import { useState } from 'react';

export default function CmsFormModal({ item, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin';

  const { data, setData, post, put, processing, reset } = useForm({
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

  function submit(e) {
    e.preventDefault();
    const routeName = isEdit ? route('admin.communication.cms.update', item.id) : route('admin.communication.cms.store');
    post(routeName, { onSuccess: () => { reset(); onClose(); } });
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      
      {/* Responsive Modal Box */}
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

        {/* Form Body (Scrollable) */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="sm:col-span-2">
                <label className={labelClass}>Campus (Optional)</label>
                <select 
                  value={data.campus_id || ''} 
                  onChange={(e) => setData('campus_id', e.target.value)} 
                  disabled={!isSuperAdmin}
                  className={`${inputClass} ${!isSuperAdmin ? 'bg-slate-100 opacity-70' : 'bg-white'}`}
                >
                  <option value="">Global Website</option>
                  {campuses?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className={labelClass}>Title <span className="text-rose-500">*</span></label>
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
                <select value={data.content_type} onChange={e => setData('content_type', e.target.value)} className={`${inputClass} bg-white`}>
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
                    className="flex-1 px-4 py-2.5 bg-transparent border-0 text-sm text-slate-700 outline-none" 
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Content Body</label>
                <textarea 
                  rows="6" 
                  value={data.content_body} 
                  onChange={e => setData('content_body', e.target.value)} 
                  placeholder="Write your HTML or plain text content here..." 
                  className={`${inputClass} resize-none font-mono text-xs`} 
                />
              </div>

              {/* Featured Image with Preview */}
              <div className="sm:col-span-2">
                <label className={labelClass}>Featured Image</label>
                <div className="flex items-center gap-4">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-16 h-12 object-cover rounded-xl border border-slate-200 shadow-sm shrink-0" />
                  ) : (
                    <div className="w-16 h-12 bg-slate-100 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 shrink-0">
                      <Icon name="image" className="w-6 h-6" />
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImage} 
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all border border-slate-200 rounded-xl bg-slate-50 cursor-pointer"
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
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-0 checked:bg-indigo-600 checked:border-indigo-600 cursor-pointer transition-colors"
                    />
                    <svg className="absolute w-3.5 h-3.5 top-[3px] left-[3px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Published (Visible on website)</span>
                </label>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
              <Icon name="save" className="w-4 h-4" />
              {processing ? 'Saving...' : 'Save Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
