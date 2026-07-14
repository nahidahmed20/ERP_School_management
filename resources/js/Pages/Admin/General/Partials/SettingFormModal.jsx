import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

const TYPES = ['text', 'textarea', 'number', 'boolean', 'image', 'select', 'json'];

export default function SettingFormModal({ item, groups, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId, // ডিফল্টভাবে বর্তমান ক্যাম্পাস
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
      post(route('admin.general.store'), options); // রাউট নেম চেক করে নিবেন (.store আছে কি না)
    }
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Setting' : 'Add Setting'}</h3>
          <button className="icon-btn" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">

            {/* --- Campus Selection --- */}
            <label style={{ gridColumn: '1 / -1' }}>
              Assign to Campus
              <select 
                value={data.campus_id || ''} 
                onChange={(e) => setData('campus_id', e.target.value)}
                disabled={!isSuperAdmin} // লোকাল এডমিন ক্যাম্পাস চেঞ্জ করতে পারবে না
              >
                <option value="" disabled>Select Campus</option>
                {campuses?.map(campus => (
                  <option key={campus.id} value={campus.id}>{campus.name}</option>
                ))}
              </select>
              {errors.campus_id && <em>{errors.campus_id}</em>}
            </label>

            <label>
              Group
              <input list="setting-groups" value={data.group} onChange={(e) => setData('group', e.target.value)} />
              <datalist id="setting-groups">
                {groups.map((g) => <option key={g} value={g} />)}
              </datalist>
            </label>

            <label>
              Type
              <select value={data.type} onChange={(e) => setData('type', e.target.value)}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>

            <label>
              Key
              <input value={data.key} onChange={(e) => setData('key', e.target.value)} disabled={isEdit} />
              {errors.key && <em>{errors.key}</em>}
            </label>

            <label>
              Label
              <input value={data.label} onChange={(e) => setData('label', e.target.value)} />
              {errors.label && <em>{errors.label}</em>}
            </label>

            <label style={{ gridColumn: (data.type === 'textarea' || data.type === 'json') ? '1 / -1' : 'auto' }}>
              Value
              {data.type === 'boolean' ? (
                <select value={data.value} onChange={(e) => setData('value', e.target.value)}>
                  <option value="1">True</option>
                  <option value="0">False</option>
                </select>
              ) : data.type === 'textarea' || data.type === 'json' ? (
                <textarea rows="4" value={data.value} onChange={(e) => setData('value', e.target.value)} />
              ) : (
                <input value={data.value} onChange={(e) => setData('value', e.target.value)} />
              )}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              Description
              <textarea rows="2" value={data.description} onChange={(e) => setData('description', e.target.value)} />
            </label>

            <label>
              Order
              <input type="number" value={data.order} onChange={(e) => setData('order', e.target.value)} />
            </label>

            <label className="mm-checkbox">
              <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
              Active
            </label>

          </div>

          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>
              {processing ? 'Saving...' : (isEdit ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}