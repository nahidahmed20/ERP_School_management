import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function MenuItemFormModal({ item, groups, parents, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    menu_group_id: item?.menu_group_id ?? (groups[0]?.id ?? ''),
    parent_id: item?.parent_id ?? '',
    key: item?.key ?? '',
    label: item?.label ?? '',
    icon: item?.icon ?? '',
    route_name: item?.route_name ?? '',
    badge_count: item?.badge_count ?? '',
    order: item?.order ?? 0,
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = {
      onSuccess: () => { reset(); onClose(); },
    };
    isEdit
      ? put(route('admin.menu.update', item.id), options)
      : post(route('admin.menu.store'), options);
  }

  const filteredParents = parents.filter((p) => p.menu_group_id == data.menu_group_id);

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">
            <label>
              <span>Group</span>
              <select value={data.menu_group_id} onChange={(e) => setData('menu_group_id', e.target.value)}>
                {groups.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
              </select>
              {errors.menu_group_id && <em>{errors.menu_group_id}</em>}
            </label>

            <label>
              <span>Parent (submenu হলে বাছাই করুন)</span>
              <select value={data.parent_id} onChange={(e) => setData('parent_id', e.target.value)}>
                <option value="">— None (Top-level item) —</option>
                {filteredParents.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </label>

            <label>
              <span>Key (unique)</span>
              <input value={data.key} onChange={(e) => setData('key', e.target.value)} placeholder="e.g. students.list" />
              {errors.key && <em>{errors.key}</em>}
            </label>

            <label>
              <span>Label</span>
              <input value={data.label} onChange={(e) => setData('label', e.target.value)} placeholder="e.g. Student List" />
              {errors.label && <em>{errors.label}</em>}
            </label>

            <label>
              <span>Icon (শুধু parent item এর জন্য)</span>
              <input value={data.icon} onChange={(e) => setData('icon', e.target.value)} placeholder="e.g. cap, book, wallet" />
            </label>

            <label>
              <span>Route Name</span>
              <input value={data.route_name} onChange={(e) => setData('route_name', e.target.value)} placeholder="e.g. students.index" />
            </label>

            <label>
              <span>Badge Count</span>
              <input type="number" min="0" value={data.badge_count} onChange={(e) => setData('badge_count', e.target.value)} />
            </label>

            <label>
              <span>Order</span>
              <input type="number" min="0" value={data.order} onChange={(e) => setData('order', e.target.value)} />
            </label>

            <label className="mm-checkbox">
              <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
              <span>Active</span>
            </label>
          </div>

          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>
              {isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
