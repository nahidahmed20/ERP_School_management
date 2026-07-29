import Icon from '@/Components/Icons';

export default function ShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Maintenance Details</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ width: '50px', height: '50px', background: '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="settings" style={{ fontSize: '24px', color: '#64748b' }} />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>{item.title}</div>
              <div style={{ fontSize: '14px', color: '#1d4ed8', fontWeight: '500', marginTop: '2px' }}>Asset: {item.asset?.name}</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#b91c1c' }}>
                {item.cost} BDT
              </div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: item.status === 'Completed' ? '#15803d' : (item.status === 'In Progress' ? '#1d4ed8' : '#d97706'), marginTop: '4px', textTransform: 'uppercase' }}>
                {item.status}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Maintenance Type</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.maintenance_type}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Service Provider</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.service_provider || 'In-house'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Start Date</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.start_date}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>End Date</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.end_date || 'Ongoing'}</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Task Details / Notes</div>
            <div style={{ fontSize: '14px', color: '#334155', background: '#f1f5f9', padding: '12px', borderRadius: '6px', minHeight: '50px', whiteSpace: 'pre-wrap' }}>
              {item.details || 'No details provided.'}
            </div>
          </div>

        </div>

        <div className="mm-modal-foot mt-2">
          <button type="button" className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
