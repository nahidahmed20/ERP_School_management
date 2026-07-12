import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function CampusFormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: item?.name ?? '',
    code: item?.code ?? '',
    phone: item?.phone ?? '',
    email: item?.email ?? '',
    address: item?.address ?? '',
    established_year: item?.established_year ?? '',
    is_main: item?.is_main ?? false,
    is_active: item?.is_active ?? true,
    order: item?.order ?? 0,
  });

  function submit(e) {
    e.preventDefault();
    const options = {
      onSuccess: () => { reset(); onClose(); },
    };
    if (isEdit) {
      put(route('admin.school.update', item.id), options);
    } else {
      post(route('admin.school'), options);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{isEdit ? 'Edit Campus' : 'Add Campus'}</h2>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <form onSubmit={submit} className="modal-form">
          <div className="form-row">
            <label>Name</label>
            <input value={data.name} onChange={(e) => setData('name', e.target.value)} />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-row">
            <label>Code</label>
            <input value={data.code} onChange={(e) => setData('code', e.target.value)} />
            {errors.code && <span className="field-error">{errors.code}</span>}
          </div>

          <div className="form-grid-2">
            <div className="form-row">
              <label>Phone</label>
              <input value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
            </div>
            <div className="form-row">
              <label>Email</label>
              <input value={data.email} onChange={(e) => setData('email', e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <label>Address</label>
            <textarea value={data.address} onChange={(e) => setData('address', e.target.value)} />
          </div>

          <div className="form-grid-2">
            <div className="form-row">
              <label>Established Year</label>
              <input type="number" value={data.established_year} onChange={(e) => setData('established_year', e.target.value)} />
            </div>
            <div className="form-row">
              <label>Order</label>
              <input type="number" value={data.order} onChange={(e) => setData('order', e.target.value)} />
            </div>
          </div>

          <div className="form-grid-2">
            <label className="checkbox-row">
              <input type="checkbox" checked={data.is_main} onChange={(e) => setData('is_main', e.target.checked)} />
              Main Campus
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
              Active
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>
              {isEdit ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
