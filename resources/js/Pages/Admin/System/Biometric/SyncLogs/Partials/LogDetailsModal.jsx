import Icon from '@/Components/Icons';

export default function LogDetailsModal({ log, onClose }) {
  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
        <div className="mm-modal-head" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
          <div>
            <h3 style={{ margin: 0 }}>Sync Log Details</h3>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Logged at {new Date(log.created_at).toLocaleString()}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Punch Time</div>
              <strong style={{ color: '#0f172a' }}>{new Date(log.punch_time).toLocaleString()}</strong>
            </div>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Status</div>
              <strong style={{ color: log.sync_status === 'Success' ? '#16a34a' : '#dc2626' }}>{log.sync_status}</strong>
            </div>
          </div>

          <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 0', color: '#64748b' }}>User Name</td>
                <td style={{ padding: '10px 0', fontWeight: 'bold' }}>{log.enrolled_user?.user_name || 'Unknown'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 0', color: '#64748b' }}>Biometric / Machine ID</td>
                <td style={{ padding: '10px 0', fontWeight: 'bold' }}>{log.biometric_id}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 0', color: '#64748b' }}>Device Name</td>
                <td style={{ padding: '10px 0', fontWeight: 'bold' }}>{log.device?.name || 'N/A'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px 0', color: '#64748b' }}>Punch State</td>
                <td style={{ padding: '10px 0', fontWeight: 'bold' }}>{log.punch_state}</td>
              </tr>
            </tbody>
          </table>

          {log.sync_status === 'Failed' && (
            <div style={{ background: '#fef2f2', border: '1px solid #f87171', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#991b1b', fontSize: '14px' }}>Error Message</h4>
              <p style={{ margin: 0, color: '#b91c1c', fontSize: '13px' }}>{log.error_message || 'Unknown error occurred during sync.'}</p>
            </div>
          )}

          {log.raw_data && (
            <div>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#334155' }}>Raw Device Payload (JSON)</h4>
              <pre style={{ background: '#1e293b', color: '#cbd5e1', padding: '15px', borderRadius: '8px', overflowX: 'auto', fontSize: '12px' }}>
                {JSON.stringify(log.raw_data, null, 2)}
              </pre>
            </div>
          )}

        </div>
        
        <div className="mm-modal-foot mt-2">
          <button type="button" className="btn btn-outline" onClick={onClose}>Close Details</button>
        </div>
      </div>
    </div>
  );
}