import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function TicketFormModal({ campuses, activeCampusId, onClose }) {
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin';

  const { data, setData, post, processing, reset } = useForm({
    campus_id: activeCampusId,
    requester_name: '',
    requester_type: 'Student',
    subject: '',
    description: '',
    priority: 'Medium',
  });

  function submit(e) {
    e.preventDefault();
    post(route('admin.communication.helpdesk.store'), { onSuccess: () => { reset(); onClose(); } });
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={e => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Create New Ticket</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">
            <label style={{ gridColumn: '1 / -1' }}><span>Campus (Optional)</span>
              <select value={data.campus_id || ''} onChange={(e) => setData('campus_id', e.target.value)} disabled={!isSuperAdmin}>
                <option value="">Global / System</option>
                {campuses?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label><span>Requester Name *</span>
              <input type="text" value={data.requester_name} onChange={e => setData('requester_name', e.target.value)} required />
            </label>
            <label><span>Requester Type *</span>
              <select value={data.requester_type} onChange={e => setData('requester_type', e.target.value)}>
                <option value="Student">Student</option>
                <option value="Parent">Parent</option>
                <option value="Teacher">Teacher</option>
                <option value="Staff">Staff</option>
              </select>
            </label>
            <label style={{ gridColumn: '1 / -1' }}><span>Subject *</span>
              <input type="text" value={data.subject} onChange={e => setData('subject', e.target.value)} required placeholder="e.g. Cannot view marksheets" />
            </label>
            <label style={{ gridColumn: '1 / -1' }}><span>Description *</span>
              <textarea rows="4" value={data.description} onChange={e => setData('description', e.target.value)} required></textarea>
            </label>
            <label><span>Priority</span>
              <select value={data.priority} onChange={e => setData('priority', e.target.value)}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High (Urgent)</option>
              </select>
            </label>
          </div>
          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>Submit Ticket</button>
          </div>
        </form>
      </div>
    </div>
  );
}
