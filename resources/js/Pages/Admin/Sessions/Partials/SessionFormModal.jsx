import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function SessionFormModal({ item, campuses, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? '',
    name: item?.name ?? '',
    start_date: item?.start_date ?? '',
    end_date: item?.end_date ?? '',
    is_current: item?.is_current ?? false,
    is_active: item?.is_active ?? true,
    remarks: item?.remarks ?? '',
  });

  function submit(e) {
    e.preventDefault();
    const options = {
      onSuccess: () => { reset(); onClose(); },
    };
    if (isEdit) {
      put(route('admin.sessions.update', item.id), options);
    } else {
      post(route('admin.sessions'), options);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{isEdit ? 'Edit Session' : 'Add Session'}</h2>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <form onSubmit={submit} className="modal-form">
          <div className="form-row">
            <label>Session Name (e.g. 2025-2026)</label>
            <input value={data.name} onChange={(e) => setData('name', e.target.value)} />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-row">
            <label>Campus</label>
            <select value={data.campus_id} onChange={(e) => setData('campus_id', e.target.value)}>
              <option value="">All Campuses</option>
              {campuses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="form-grid-2">
            <div className="form-row">
              <label>Start Date</label>
              <input type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} />
              {errors.start_date && <span className="field-error">{errors.start_date}</span>}
            </div>
            <div className="form-row">
              <label>End Date</label>
              <input type="date" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} />
              {errors.end_date && <span className="field-error">{errors.end_date}</span>}
            </div>
          </div>

          <div className="form-row">
            <label>Remarks</label>
            <textarea value={data.remarks} onChange={(e) => setData('remarks', e.target.value)} />
          </div>

          <div className="form-grid-2">
            <label className="checkbox-row">
              <input type="checkbox" checked={data.is_current} onChange={(e) => setData('is_current', e.target.checked)} />
              Set as Current Session
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
