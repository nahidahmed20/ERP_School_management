import Icon from '@/Components/Icons';

export default function AuditLogDetailsModal({ log, onClose }) {
  // Extract pure model name without namespace
  const modelName = log.model_type.split('\\').pop();

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" style={{ maxWidth: '800px', width: '90%' }} onClick={e => e.stopPropagation()}>
        <div className="mm-modal-head" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
          <div>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              Audit Log Details <span className="badge-outline" style={{ textTransform: 'uppercase' }}>{log.action}</span>
            </h3>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '5px' }}>
              Action performed on <strong>{modelName} (ID: {log.model_id})</strong> at {new Date(log.created_at).toLocaleString()}
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>

          <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Performed By</div>
              <strong style={{ color: '#0f172a' }}>{log.user ? `${log.user.name} (${log.user.email})` : 'System / Automated Task'}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>IP Address</div>
              <strong style={{ color: '#0f172a' }}>{log.ip_address || 'N/A'}</strong>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Old Values (If any) */}
            {(log.action === 'updated' || log.action === 'deleted') && (
              <div>
                <h4 style={{ margin: '0 0 10px 0', color: '#dc2626', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Icon name="minus-circle" /> Previous Data (Old Values)
                </h4>
                <pre style={{ background: '#fef2f2', color: '#991b1b', padding: '15px', borderRadius: '8px', overflowX: 'auto', fontSize: '12px', border: '1px solid #fecaca' }}>
                  {log.old_values ? JSON.stringify(log.old_values, null, 2) : 'No old data recorded.'}
                </pre>
              </div>
            )}

            {/* New Values (If any) */}
            {(log.action === 'created' || log.action === 'updated') && (
              <div>
                <h4 style={{ margin: '0 0 10px 0', color: '#16a34a', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Icon name="plus-circle" /> New Data (Changed Values)
                </h4>
                <pre style={{ background: '#f0fdf4', color: '#166534', padding: '15px', borderRadius: '8px', overflowX: 'auto', fontSize: '12px', border: '1px solid #bbf7d0' }}>
                  {log.new_values ? JSON.stringify(log.new_values, null, 2) : 'No new data recorded.'}
                </pre>
              </div>
            )}
          </div>

        </div>

        <div className="mm-modal-foot mt-2">
          <button type="button" className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
