import Icon from '@/Components/Icons';

export default function ShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Transaction Details</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ width: '50px', height: '50px', background: item.status === 'Completed' ? '#dcfce7' : (item.status === 'Failed' ? '#fee2e2' : '#fef3c7'), color: item.status === 'Completed' ? '#15803d' : (item.status === 'Failed' ? '#b91c1c' : '#d97706'), borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={item.status === 'Completed' ? 'check' : (item.status === 'Failed' ? 'close' : 'clock')} style={{ fontSize: '24px' }} />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a' }}>
                {item.amount} {item.currency}
              </div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>TrxID: <span style={{fontFamily: 'monospace', color: '#1d4ed8'}}>{item.transaction_id}</span></div>
            </div>
            <div style={{ marginLeft: 'auto', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', color: item.status === 'Completed' ? '#15803d' : (item.status === 'Failed' ? '#b91c1c' : '#d97706') }}>
              {item.status}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Gateway</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.gateway?.name || 'Manual Entry'}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Payment Method</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.payment_method || 'N/A'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Reference No (Invoice/ID)</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.reference_no || 'N/A'}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Transaction Date</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.transaction_date}</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Notes / Reason</div>
            <div style={{ fontSize: '14px', color: '#334155', background: '#f1f5f9', padding: '12px', borderRadius: '6px', minHeight: '50px', whiteSpace: 'pre-wrap' }}>
              {item.note || 'No additional notes.'}
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