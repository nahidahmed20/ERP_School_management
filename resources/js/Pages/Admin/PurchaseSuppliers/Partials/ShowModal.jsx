import Icon from '@/Components/Icons';

export default function ShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Supplier Details</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ width: '50px', height: '50px', background: '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="box" style={{ fontSize: '24px', color: '#64748b' }} />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>{item.name}</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Contact Person: {item.contact_person || 'N/A'}</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: item.is_active ? '#15803d' : '#64748b', marginTop: '4px' }}>
                {item.is_active ? 'Active' : 'Inactive'}
              </div>
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

          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Company Address</div>
            <div style={{ fontSize: '14px', color: '#334155', background: '#f1f5f9', padding: '12px', borderRadius: '6px', minHeight: '50px', whiteSpace: 'pre-wrap' }}>
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
