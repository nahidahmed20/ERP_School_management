import Icon from '@/Components/Icons';

export default function QueueDetailsModal({ job, onClose }) {
  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" style={{ maxWidth: '700px', width: '90%' }} onClick={e => e.stopPropagation()}>
        <div className="mm-modal-head" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
          <div>
            <h3 style={{ margin: 0 }}>Job Execution Details</h3>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Logged on {new Date(job.created_at).toLocaleString()}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Job Class</div>
              <strong style={{ color: '#0f172a' }}>{job.job_name}</strong>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Execution Status</div>
              <strong style={{ color: job.status === 'Failed' ? '#dc2626' : (job.status === 'Completed' ? '#16a34a' : '#4f46e5') }}>
                {job.status}
              </strong>
            </div>
          </div>

          <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 0', color: '#64748b', width: '30%' }}>Queue Name</td>
                <td style={{ padding: '10px 0', fontWeight: 'bold' }}>{job.queue_name}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 0', color: '#64748b' }}>Started Processing</td>
                <td style={{ padding: '10px 0', fontWeight: 'bold' }}>{job.started_at ? new Date(job.started_at).toLocaleString() : 'N/A'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 0', color: '#64748b' }}>Finished Processing</td>
                <td style={{ padding: '10px 0', fontWeight: 'bold' }}>{job.finished_at ? new Date(job.finished_at).toLocaleString() : 'N/A'}</td>
              </tr>
            </tbody>
          </table>

          {job.status === 'Failed' && job.error_message && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#dc2626', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Icon name="alert-circle" /> Exception / Error Trace
              </h4>
              <pre style={{ margin: 0, color: '#991b1b', fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {job.error_message}
              </pre>
            </div>
          )}

          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#334155', fontSize: '14px' }}>Job Payload (Data Sent)</h4>
            <pre style={{ background: '#1e293b', color: '#cbd5e1', padding: '15px', borderRadius: '8px', overflowX: 'auto', fontSize: '12px' }}>
              {job.payload ? JSON.stringify(job.payload, null, 2) : 'No payload data available.'}
            </pre>
          </div>

        </div>

        <div className="mm-modal-foot mt-2">
          <button type="button" className="btn btn-outline" onClick={onClose}>Close Details</button>
        </div>
      </div>
    </div>
  );
}
