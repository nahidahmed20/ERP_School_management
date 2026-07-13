import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function BranchFormModal({ item, onClose }) {
  const isEdit = !!item;
  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: item?.name ?? '',
    code: item?.code ?? '',
    phone: item?.phone ?? '',
    email: item?.email ?? '',
    address: item?.address ?? '',
    is_main: item?.is_main ?? false,
    status: item?.status ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    isEdit ? put(route('admin.branches.update', item.id), options) : post(route('admin.branches.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Branch' : 'Add Branch'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">
            <label>Name<input value={data.name} onChange={(e) => setData('name', e.target.value)} />{errors.name && <em>{errors.name}</em>}</label>
            <label>Code<input value={data.code} onChange={(e) => setData('code', e.target.value)} />{errors.code && <em>{errors.code}</em>}</label>
            <label>Phone<input value={data.phone} onChange={(e) => setData('phone', e.target.value)} />{errors.phone && <em>{errors.phone}</em>}</label>
            <label>Email<input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />{errors.email && <em>{errors.email}</em>}</label>
            <label style={{ gridColumn: '1 / -1' }}>Address<textarea rows="2" value={data.address} onChange={(e) => setData('address', e.target.value)} />{errors.address && <em>{errors.address}</em>}</label>
            <label className="mm-checkbox"><input type="checkbox" checked={data.is_main} onChange={(e) => setData('is_main', e.target.checked)} /> Main Branch</label>
            <label className="mm-checkbox"><input type="checkbox" checked={data.status} onChange={(e) => setData('status', e.target.checked)} /> Active</label>
          </div>
          <div className="mm-modal-foot">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{isEdit ? 'Update' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
