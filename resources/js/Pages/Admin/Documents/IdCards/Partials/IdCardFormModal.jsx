import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function IdCardFormModal({ item, campuses, activeCampusId, onClose }) {
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    title: item?.title ?? '',
    layout_type: item?.layout_type ?? 'Portrait',
    theme_color: item?.theme_color ?? '#1e293b',
    back_side_content: item?.back_side_content ?? 'If found, please return to the school administration.',
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    if (item) put(route('admin.documents.idcards.update', item.id), { onSuccess: onClose });
    else post(route('admin.documents.idcards.store'), { onSuccess: onClose });
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={e => e.stopPropagation()}>
        <div className="mm-modal-head"><h3>{item ? 'Edit ID Card' : 'Create ID Card'}</h3><button className="icon-btn" onClick={onClose}><Icon name="close" /></button></div>
        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">
            <label style={{ gridColumn: '1 / -1' }}><span>Campus *</span>
              <select value={data.campus_id} onChange={e => setData('campus_id', e.target.value)} disabled={!isSuperAdmin}>
                {campuses?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label><span>Template Title *</span><input value={data.title} onChange={e => setData('title', e.target.value)} required /></label>
            <label><span>Layout Type *</span>
              <select value={data.layout_type} onChange={e => setData('layout_type', e.target.value)}>
                <option value="Portrait">Portrait (Vertical)</option>
                <option value="Landscape">Landscape (Horizontal)</option>
              </select>
            </label>
            <label style={{ gridColumn: '1 / -1' }}><span>Theme Color *</span><input type="color" value={data.theme_color} onChange={e => setData('theme_color', e.target.value)} /></label>
            <label style={{ gridColumn: '1 / -1' }}><span>Back Side Terms/Info</span>
              <textarea rows="3" value={data.back_side_content} onChange={e => setData('back_side_content', e.target.value)}></textarea>
            </label>
          </div>
          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
