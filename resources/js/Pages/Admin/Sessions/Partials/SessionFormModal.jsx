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
      post(route('admin.sessions.store'), options); 
    }
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* --- Modal Header --- */}
        <div className="mm-modal-head">
          <h3>{isEdit ? 'Edit Session' : 'Add Session'}</h3>
          <button className="icon-btn" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        {/* --- Modal Form --- */}
        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">
            
            <label>
              Session Name (e.g. 2025-2026)
              <input 
                value={data.name} 
                onChange={(e) => setData('name', e.target.value)} 
                placeholder="2025-2026"
              />
              {errors.name && <em>{errors.name}</em>}
            </label>

            <label>
              Campus
              <select 
                value={data.campus_id} 
                onChange={(e) => setData('campus_id', e.target.value)}
              >
                <option value="">All Campuses</option>
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.campus_id && <em>{errors.campus_id}</em>}
            </label>

            <label>
              Start Date
              <input 
                type="date" 
                value={data.start_date} 
                onChange={(e) => setData('start_date', e.target.value)} 
              />
              {errors.start_date && <em>{errors.start_date}</em>}
            </label>

            <label>
              End Date
              <input 
                type="date" 
                value={data.end_date} 
                onChange={(e) => setData('end_date', e.target.value)} 
              />
              {errors.end_date && <em>{errors.end_date}</em>}
            </label>

            <label style={{ gridColumn: '1 / -1' }}>
              Remarks
              <textarea 
                rows="2" 
                value={data.remarks} 
                onChange={(e) => setData('remarks', e.target.value)} 
                placeholder="Enter any remarks..."
              />
              {errors.remarks && <em>{errors.remarks}</em>}
            </label>

            <label className="mm-checkbox">
              <input 
                type="checkbox" 
                checked={data.is_current} 
                onChange={(e) => setData('is_current', e.target.checked)} 
              />
              Set as Current Session
            </label>

            <label className="mm-checkbox">
              <input 
                type="checkbox" 
                checked={data.is_active} 
                onChange={(e) => setData('is_active', e.target.checked)} 
              />
              Active
            </label>

          </div>

          {/* --- Modal Footer --- */}
          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose}>
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