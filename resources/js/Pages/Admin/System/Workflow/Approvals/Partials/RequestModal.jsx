import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function RequestModal({ campuses, activeCampusId, onClose }) {
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin';

  const { data, setData, post, processing, reset } = useForm({
    campus_id: activeCampusId,
    title: '',
    type: 'Leave',
    requester_name: auth?.user?.name || '',
    details: '',
  });

  function submit(e) {
    e.preventDefault();
    post(route('admin.workflow-approvals.store'), { onSuccess: () => { reset(); onClose(); } });
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={e => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Submit New Request</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form onSubmit={submit} className="mm-form">
          <div className="mm-form-grid">
            <label style={{ gridColumn: '1 / -1' }}><span>Campus</span>
              <select value={data.campus_id || ''} onChange={(e) => setData('campus_id', e.target.value)} disabled={!isSuperAdmin}>
                <option value="">Global / System</option>
                {campuses?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label><span>Request Type *</span>
              <select value={data.type} onChange={e => setData('type', e.target.value)}>
                <option value="Leave">Leave Application</option>
                <option value="Expense">Expense / Purchase</option>
                <option value="Discount">Fee Discount</option>
                <option value="General">General Request</option>
              </select>
            </label>
            <label><span>Requester Name *</span>
              <input type="text" value={data.requester_name} onChange={e => setData('requester_name', e.target.value)} required />
            </label>
            <label style={{ gridColumn: '1 / -1' }}><span>Request Title / Subject *</span>
              <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} required placeholder="e.g. Need 3 days leave for sickness" />
            </label>
            <label style={{ gridColumn: '1 / -1' }}><span>Detailed Description *</span>
              <textarea rows="4" value={data.details} onChange={e => setData('details', e.target.value)} required></textarea>
            </label>
          </div>
          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>
            {processing ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
