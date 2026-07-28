import Icon from '@/Components/Icons';

export default function ShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Call Log Details</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Name</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>{item.name}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Call Type</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.call_type}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Phone Number</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.phone}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Call Date</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.date}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Duration</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.call_duration || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Next Follow-up Date</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#d97706' }}>{item.next_follow_up_date || 'N/A'}</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Description</div>
            <div style={{ fontSize: '14px', color: '#334155', background: '#f1f5f9', padding: '12px', borderRadius: '6px', minHeight: '60px' }}>
              {item.description || 'No description provided.'}
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