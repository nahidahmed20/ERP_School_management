import Icon from '@/Components/Icons';

export default function ShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Event Details</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {item.cover_photo && (
            <div style={{ width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' }}>
              <img src={`/storage/${item.cover_photo}`} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>{item.title}</div>
            <div style={{ fontSize: '13px', color: item.status === 'Completed' ? '#15803d' : (item.status === 'Cancelled' ? '#b91c1c' : '#1d4ed8'), fontWeight: '600', marginTop: '4px' }}>
              Status: {item.status}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Date & Time</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.date} at {item.time}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Location / Venue</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.location || 'Not Specified'}</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Event Description</div>
            <div style={{ fontSize: '14px', color: '#334155', background: '#f1f5f9', padding: '12px', borderRadius: '6px', minHeight: '60px', whiteSpace: 'pre-wrap' }}>
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
