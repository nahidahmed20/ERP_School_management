import Icon from '@/Components/Icons';

export default function ShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Refund Details</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ width: '50px', height: '50px', background: '#fee2e2', color: '#b91c1c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="refresh" style={{ fontSize: '24px' }} />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#b91c1c' }}>
                {item.amount} {item.transaction?.currency || 'BDT'}
              </div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Original Trx: <span style={{fontFamily: 'monospace'}}>{item.transaction?.transaction_id}</span></div>
            </div>
            <div style={{ marginLeft: 'auto', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', color: item.status === 'Refunded' ? '#4338ca' : (item.status === 'Rejected' ? '#b91c1c' : '#d97706') }}>
              {item.status}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Original Paid Amount</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>
                {item.transaction?.amount || '0'} {item.transaction?.currency}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Refund Date</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.refund_date || 'Not yet refunded'}</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Reason for Refund</div>
            <div style={{ fontSize: '14px', color: '#334155', background: '#f1f5f9', padding: '12px', borderRadius: '6px', minHeight: '60px', whiteSpace: 'pre-wrap' }}>
              {item.reason}
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