import { useForm, router } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, processing, errors } = useForm({
    type: item?.type || 'Receive',
    reference_no: item?.reference_no || '',
    title: item?.title || '',
    address: item?.address || '',
    date: item?.date || new Date().toISOString().split('T')[0],
    note: item?.note || '',
    attachment: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      router.post(route('admin.frontoffice.postal.update', item.id), {
        ...data,
        _method: 'PUT',
      }, {
        onSuccess: () => onClose(),
      });
    } else {
      post(route('admin.frontoffice.postal.store'), {
        onSuccess: () => onClose(),
      });
    }
  };

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Postal Record' : 'Add Postal Record'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mm-form">
          <div className="mm-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Type (Dispatch / Receive) *</span>
                <select value={data.type} onChange={(e) => setData('type', e.target.value)} required>
                  <option value="Receive">Receive (চিঠি/পার্সেল এসেছে)</option>
                  <option value="Dispatch">Dispatch (চিঠি/পার্সেল পাঠানো হয়েছে)</option>
                </select>
              </label>

              <label>
                <span>Reference / Tracking No</span>
                <input value={data.reference_no} onChange={(e) => setData('reference_no', e.target.value)} placeholder="e.g. TRK123456" />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label>
                <span>Title / To / From *</span>
                <input value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="কার কাছ থেকে এসেছে / কাকে পাঠানো হচ্ছে" required />
                {errors.title && <em>{errors.title}</em>}
              </label>

              <label>
                <span>Date *</span>
                <input type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} required />
              </label>
            </div>

            <label>
              <span>Address</span>
              <textarea rows="2" value={data.address} onChange={(e) => setData('address', e.target.value)} placeholder="ঠিকানা..." />
            </label>

            <label>
              <span>Note / Description</span>
              <textarea rows="2" value={data.note} onChange={(e) => setData('note', e.target.value)} placeholder="বিস্তারিত..." />
            </label>

            <label>
              <span>Attachment (File/Image)</span>
              <input type="file" onChange={(e) => setData('attachment', e.target.files[0])} style={{ padding: '7px', background: '#f8fafc', border: '1px dashed #cbd5e1' }} accept=".pdf,.jpg,.jpeg,.png" />
              {errors.attachment && <em>{errors.attachment}</em>}
            </label>

          </div>
          <div className="mm-modal-foot mt-4">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : 'Save Record'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}