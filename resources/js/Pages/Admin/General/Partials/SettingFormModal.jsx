import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

const TYPES = ['text', 'textarea', 'number', 'boolean', 'image', 'select', 'json'];

export default function SettingFormModal({ item, groups, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    group: item?.group ?? (groups[0] ?? 'general'),
    key: item?.key ?? '',
    value: item?.value ?? '',
    type: item?.type ?? 'text',
    label: item?.label ?? '',
    description: item?.description ?? '',
    order: item?.order ?? 0,
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = {
      onSuccess: () => { reset(); onClose(); },
    };
    if (isEdit) {
      put(route('admin.general.update', item.id), options);
    } else {
      post(route('admin.general'), options);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{isEdit ? 'Edit Setting' : 'Add Setting'}</h2>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <form onSubmit={submit} className="modal-form">
          <div className="form-grid-2">
            <div className="form-row">
              <label>Group</label>
              <input list="setting-groups" value={data.group} onChange={(e) => setData('group', e.target.value)} />
              <datalist id="setting-groups">
                {groups.map((g) => <option key={g} value={g} />)}
              </datalist>
            </div>
            <div className="form-row">
              <label>Type</label>
              <select value={data.type} onChange={(e) => setData('type', e.target.value)}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <label>Key</label>
            <input value={data.key} onChange={(e) => setData('key', e.target.value)} disabled={isEdit} />
            {errors.key && <span className="field-error">{errors.key}</span>}
          </div>

          <div className="form-row">
            <label>Label</label>
            <input value={data.label} onChange={(e) => setData('label', e.target.value)} />
            {errors.label && <span className="field-error">{errors.label}</span>}
          </div>

          <div className="form-row">
            <label>Value</label>
            {data.type === 'boolean' ? (
              <select value={data.value} onChange={(e) => setData('value', e.target.value)}>
                <option value="1">True</option>
                <option value="0">False</option>
              </select>
            ) : data.type === 'textarea' || data.type === 'json' ? (
              <textarea value={data.value} onChange={(e) => setData('value', e.target.value)} />
            ) : (
              <input value={data.value} onChange={(e) => setData('value', e.target.value)} />
            )}
          </div>

          <div className="form-row">
            <label>Description</label>
            <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} />
          </div>

          <div className="form-grid-2">
            <div className="form-row">
              <label>Order</label>
              <input type="number" value={data.order} onChange={(e) => setData('order', e.target.value)} />
            </div>
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
