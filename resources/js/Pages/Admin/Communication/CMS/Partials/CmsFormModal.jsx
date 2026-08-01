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

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Web Content' : 'Create Web Content'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">

            <label style={{ gridColumn: '1 / -1' }}><span>Campus (Optional)</span>
              <select value={data.campus_id || ''} onChange={(e) => setData('campus_id', e.target.value)} disabled={!isSuperAdmin}>
                <option value="">Global Website</option>
                {campuses?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>

            <label><span>Title *</span>
              <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} required autoFocus placeholder="e.g. About Us" />
            </label>

            <label><span>Content Type *</span>
              <select value={data.content_type} onChange={e => setData('content_type', e.target.value)}>
                <option value="Page">Custom Page</option>
                <option value="Notice">Notice / Announcement</option>
                <option value="Banner">Homepage Banner</option>
                <option value="Event">Website Event</option>
              </select>
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>URL Slug (Leave empty to auto-generate)</span>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                <span style={{ padding: '0 10px', color: '#64748b', borderRight: '1px solid #cbd5e1', fontSize: '14px' }}>yoursite.com/</span>
                <input type="text" value={data.slug} onChange={e => setData('slug', e.target.value)} placeholder="e.g. about-us" style={{ border: 'none', borderRadius: 0 }} />
              </div>
            </label>

            <label style={{ gridColumn: '1 / -1' }}><span>Content Body</span>
              <textarea rows="6" value={data.content_body} onChange={e => setData('content_body', e.target.value)} placeholder="Write your HTML or plain text content here..."></textarea>
            </label>

            {/* Featured Image with Preview */}
            <label style={{ gridColumn: '1 / -1' }}><span>Featured Image</span>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                {preview ? (
                  <img src={preview} alt="Preview" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                ) : (
                  <div style={{ width: '80px', height: '60px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', color: '#94a3b8', border: '1px dashed #cbd5e1' }}><Icon name="image" /></div>
                )}
                <input type="file" accept="image/*" onChange={handleImage} style={{ flex: 1 }} />
              </div>
            </label>

            <label className="mm-checkbox" style={{ gridColumn: '1 / -1' }}>
              <input type="checkbox" checked={data.is_published} onChange={e => setData('is_published', e.target.checked)} /> Published (Visible on website)
            </label>

          </div>
          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>Save Content</button>
          </div>
        </form>
      </div>
    </div>
  );
}
