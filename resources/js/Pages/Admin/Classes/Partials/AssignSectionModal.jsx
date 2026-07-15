import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function AssignSectionModal({ schoolClass, allSections, onClose }) {
  const { data, setData, post, processing } = useForm({
    sections: schoolClass.sections?.map(s => s.id) || [],
  });

  function toggleSection(id) {
    if (data.sections.includes(id)) {
      setData('sections', data.sections.filter(s => s !== id));
    } else {
      setData('sections', [...data.sections, id]);
    }
  }

  function submit(e) {
    e.preventDefault();
    post(route('admin.classes.assign-sections', schoolClass.id), {
      onSuccess: () => onClose(),
    });
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Assign Sections to {schoolClass.name}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {allSections.map(section => (
                <label key={section.id} className="mm-checkbox" style={{ display: 'flex', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={data.sections.includes(section.id)} 
                    onChange={() => toggleSection(section.id)} 
                  />
                  {section.name}
                </label>
              ))}
              {allSections.length === 0 && <p style={{ color: '#666' }}>No active sections available.</p>}
            </div>
          </div>

          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={processing}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>{processing ? 'Saving...' : 'Save Assignments'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}