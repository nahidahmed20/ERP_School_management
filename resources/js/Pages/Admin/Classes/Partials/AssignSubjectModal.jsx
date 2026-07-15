import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function AssignSubjectModal({ schoolClass, allSubjects, onClose }) {
  const { data, setData, post, processing } = useForm({
    subjects: schoolClass.subjects?.map(s => s.id) || [],
  });

  function toggleSubject(id) {
    if (data.subjects.includes(id)) {
      setData('subjects', data.subjects.filter(s => s !== id));
    } else {
      setData('subjects', [...data.subjects, id]);
    }
  }

  function submit(e) {
    e.preventDefault();
    post(route('admin.classes.assign-subjects', schoolClass.id), {
      onSuccess: () => onClose(),
    });
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Assign Subjects to {schoolClass.name}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {allSubjects.map(subject => (
                <label key={subject.id} className="mm-checkbox" style={{ display: 'flex', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={data.subjects.includes(subject.id)} 
                    onChange={() => toggleSubject(subject.id)} 
                  />
                  <span>{subject.name} {subject.code && <small style={{ color: '#888' }}>({subject.code})</small>}</span>
                </label>
              ))}
              {allSubjects.length === 0 && <p style={{ color: '#666' }}>No active subjects available.</p>}
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