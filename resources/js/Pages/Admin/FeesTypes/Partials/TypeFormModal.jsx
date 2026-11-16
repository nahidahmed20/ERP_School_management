import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function TypeFormModal({ item, feeGroup, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: item?.name ?? '',
    amount: item?.amount ?? '',
    description: item?.description ?? '',
    is_active: item ? !!item.is_active : true, 
    });

  function submit(e) {
    e.preventDefault();
    const options = {
      onSuccess: () => { reset(); onClose(); },
    };
    if (isEdit) {
      put(route('admin.fees-types.update', item.id), options);
    } else {
      post(route('admin.fees-types.store', feeGroup.id), options);
    }
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Fee Item' : 'Add Fee Item'}</h3>
          <button className="icon-btn" onClick={onClose} disabled={processing}>
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Fee Name (Item) <span style={{color:'red'}}>*</span></span>
              <input
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                autoFocus
                placeholder="e.g. ID Card Fee, Exam Fee"
                required
              />
              {errors.name && <em>{errors.name}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Amount (TK) <span style={{color:'red'}}>*</span></span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={data.amount}
                onChange={(e) => setData('amount', e.target.value)}
                placeholder="e.g. 500"
                required
              />
              {errors.amount && <em>{errors.amount}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              <span>Description</span>
              <textarea
                rows="2"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Short details about this fee..."
              />
              {errors.description && <em>{errors.description}</em>}
            </label>

            <label className="mm-checkbox" style={{ gridColumn: '1 / -1' }}>
              <input
                type="checkbox"
                checked={data.is_active}
                onChange={(e) => setData('is_active', e.target.checked)}
              />
              Active Item
            </label>

          </div>

          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={processing}>
              {processing ? 'Saving...' : (isEdit ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
