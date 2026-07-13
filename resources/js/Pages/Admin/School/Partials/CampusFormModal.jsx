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
      put(route('admin.campuses.update', item.id), options);
    } else {
      post(route('admin.campuses.store'), options);
    }
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Campus' : 'Add Campus'}</h3>
          <button className="icon-btn" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">

            <label>
              Name
              <input value={data.name} onChange={(e) => setData('name', e.target.value)} />
              {errors.name && <em>{errors.name}</em>}
            </label>

            <label>
              Code
              <input value={data.code} onChange={(e) => setData('code', e.target.value)} />
              {errors.code && <em>{errors.code}</em>}
            </label>

            <label>
              Phone
              <input value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
              {errors.phone && <em>{errors.phone}</em>}
            </label>

            <label>
              Email
              <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
              {errors.email && <em>{errors.email}</em>}
            </label>

            {/* Address field spans both columns */}
            <label style={{ gridColumn: '1 / -1' }}>
              Address
              <textarea rows="2" value={data.address} onChange={(e) => setData('address', e.target.value)} />
              {errors.address && <em>{errors.address}</em>}
            </label>

            <label>
              Established Year
              <input type="number" value={data.established_year} onChange={(e) => setData('established_year', e.target.value)} />
              {errors.established_year && <em>{errors.established_year}</em>}
            </label>

            <label>
              Order
              <input type="number" value={data.order} onChange={(e) => setData('order', e.target.value)} />
              {errors.order && <em>{errors.order}</em>}
            </label>

            <label className="mm-checkbox">
              <input type="checkbox" checked={data.is_main} onChange={(e) => setData('is_main', e.target.checked)} />
              Main Campus
            </label>

            <label className="mm-checkbox">
              <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
              Active
            </label>

          </div>

          <div className="mm-modal-foot mt-2">
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
