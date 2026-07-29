import Icon from '@/Components/Icons';

export default function ShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Gateway Credentials</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
            {item.logo ? (
                <img src={`/storage/${item.logo}`} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
            ) : (
                <div style={{ width: '60px', height: '60px', background: '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="card" style={{ fontSize: '24px' }} />
                </div>
            )}
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>{item.name}</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Slug: {item.slug}</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: item.mode === 'live' ? '#b91c1c' : '#d97706' }}>
                {item.mode} MODE
              </div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: item.is_active ? '#15803d' : '#64748b', marginTop: '4px' }}>
                {item.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>API Key / Store ID</div>
            <div style={{ fontSize: '14px', fontFamily: 'monospace', color: '#0f172a', background: '#f1f5f9', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
              {item.api_key || 'Not provided'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>API Secret / Password</div>
            <div style={{ fontSize: '14px', fontFamily: 'monospace', color: '#0f172a', background: '#f1f5f9', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
              {item.api_secret ? '************************' : 'Not provided'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Webhook Secret</div>
            <div style={{ fontSize: '14px', fontFamily: 'monospace', color: '#0f172a', background: '#f1f5f9', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
              {item.webhook_secret ? '************************' : 'Not provided'}
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