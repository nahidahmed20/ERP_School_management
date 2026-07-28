import Icon from '@/Components/Icons';

export default function ShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Lesson Details</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Class</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.school_class?.name}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Subject</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.subject?.name}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Status</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{item.status}</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Title / Topic</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{item.title}</div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Description</div>
            <div style={{ fontSize: '14px', color: '#334155', background: '#f1f5f9', padding: '12px', borderRadius: '6px', minHeight: '60px' }}>
              {item.description || 'No description provided.'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Attachment File</div>
            {item.attachment ? (
              <a href={`/storage/${item.attachment}`} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display: 'inline-flex', gap: '6px', marginTop: '4px' }}>
                <Icon name="download" /> Download / View File
              </a>
            ) : (
              <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>No file attached.</div>
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