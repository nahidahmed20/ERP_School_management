import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function CustomFieldFormModal({ item, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin';

  const { data, setData, post, put, processing, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    target_model: item?.target_model ?? 'Student',
    field_label: item?.field_label ?? '',
    field_type: item?.field_type ?? 'text',
    options: item?.options ?? '',
    is_required: item?.is_required ?? false,
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.workflow-customfields.update', item.id), options);
    else post(route('admin.workflow-customfields.store'), options);
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={e => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Custom Field' : 'Add Custom Field'}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">
            <label style={{ gridColumn: '1 / -1' }}><span>Campus (Optional)</span>
              <select value={data.campus_id || ''} onChange={(e) => setData('campus_id', e.target.value)} disabled={!isSuperAdmin}>
                <option value="">Global / All</option>
                {campuses?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>

            <label><span>Assign Field To *</span>
              <select value={data.target_model} onChange={e => setData('target_model', e.target.value)}>
                <option value="Student">Student Profile</option>
                <option value="Teacher">Teacher Profile</option>
                <option value="Staff">Staff Profile</option>
                <option value="Parent">Parent Profile</option>
              </select>
            </label>

            <label><span>Field Label (Name) *</span>
              <input type="text" value={data.field_label} onChange={e => setData('field_label', e.target.value)} required placeholder="e.g. Blood Group" />
            </label>

            <label><span>Field Type *</span>
              <select value={data.field_type} onChange={e => setData('field_type', e.target.value)}>
                <option value="text">Text (Short Answer)</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="select">Dropdown Select</option>
                <option value="checkbox">Checkbox</option>
              </select>
            </label>

            <label><span>Required Field?</span>
              <div style={{ marginTop: '10px' }}>
                <label className="mm-checkbox">
                  <input type="checkbox" checked={data.is_required} onChange={e => setData('is_required', e.target.checked)} /> Make this field mandatory (*)
                </label>
              </div>
            </label>

            {(data.field_type === 'select' || data.field_type === 'checkbox') && (
              <label style={{ gridColumn: '1 / -1' }}><span>Options (Comma separated) *</span>
                <input type="text" value={data.options} onChange={e => setData('options', e.target.value)} required placeholder="e.g. A+, B+, AB+, O+" />
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>Separate each option with a comma.</span>
              </label>
            )}

            <label className="mm-checkbox" style={{ gridColumn: '1 / -1' }}>
              <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} /> Active Field
            </label>

          </div>
          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>
            {processing ? 'Saving...' : (isEdit ? 'Update Field' : 'Save Field')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
