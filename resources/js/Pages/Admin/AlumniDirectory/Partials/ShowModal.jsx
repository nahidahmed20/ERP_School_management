import Icon from '@/Components/Icons';

export default function ShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Alumni Details</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
            {item.photo ? (
                <img src={`/storage/${item.photo}`} alt={item.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <Icon name="user" style={{ fontSize: '32px' }} />
                </div>
            )}
            <div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>{item.name}</div>
              <div style={{ fontSize: '14px', color: '#1d4ed8', fontWeight: '500' }}>Batch of {item.passing_year}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Phone Number</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.phone}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Email Address</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.email || 'N/A'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Current Profession</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.current_profession || 'N/A'}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Organization</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.organization || 'N/A'}</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Current Address</div>
            <div style={{ fontSize: '14px', color: '#334155', background: '#f1f5f9', padding: '12px', borderRadius: '6px', minHeight: '50px' }}>
              {item.address || 'Address not provided.'}
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
