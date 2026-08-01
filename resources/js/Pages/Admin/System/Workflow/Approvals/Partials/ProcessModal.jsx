import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function ProcessModal({ item, onClose }) {
  const { data, setData, put, processing } = useForm({
    status: item.status,
    comment: '',
  });

  function submit(e) {
    e.preventDefault();
    put(route('admin.workflow-approvals.update', item.id), { onSuccess: () => onClose() });
  }

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
        <div className="mm-modal-head" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
          <div>
            <h3 style={{ margin: 0 }}>Review Request</h3>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Submitted by {item.requester_name}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div style={{ padding: '20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>{item.title} <span className="badge-outline ml-2">{item.type}</span></h4>
          <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>{item.details}</p>
        </div>

        {/* Approval History Timeline */}
        {item.approval_chain && item.approval_chain.length > 0 && (
          <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>Workflow History</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {item.approval_chain.map((step, idx) => (
                <div key={idx} style={{ padding: '10px', background: '#f1f5f9', borderRadius: '6px', borderLeft: '3px solid #4f46e5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>
                    <strong>{step.user}</strong>
                    <span>{new Date(step.date).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#1e293b' }}>
                    <strong>{step.action}</strong>
                    {step.comment && <div style={{ marginTop: '4px', fontStyle: 'italic', color: '#475569' }}>"{step.comment}"</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={submit} style={{ padding: '20px' }}>
          <div className="mm-form-grid">
            <label style={{ gridColumn: '1 / -1' }}><span>Action / Decision *</span>
              <select value={data.status} onChange={e => setData('status', e.target.value)} required>
                <option value="Pending">Pending</option>
                <option value="In Review">Mark as In Review</option>
                <option value="Approved">Approve Request</option>
                <option value="Rejected">Reject Request</option>
              </select>
            </label>
            <label style={{ gridColumn: '1 / -1' }}><span>Remarks / Comments (Optional)</span>
              <textarea rows="2" value={data.comment} onChange={e => setData('comment', e.target.value)} placeholder="Explain reason for approval or rejection..."></textarea>
            </label>
          </div>
          <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={processing}>
            <Icon name="check" /> {processing ? 'Updating...' : 'Update Workflow'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
