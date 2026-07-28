import Icon from '@/Components/Icons';

export default function ShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Job Post Details</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Job Title</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>{item.title}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Status</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: item.status === 'Open' ? '#15803d' : '#b91c1c' }}>
                {item.status}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Department</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.department || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Employment Type</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.employment_type}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Vacancies</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.vacancies} Position(s)</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Deadline</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#d97706' }}>{item.deadline}</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Description / Requirements</div>
            <div style={{ fontSize: '14px', color: '#334155', background: '#f1f5f9', padding: '12px', borderRadius: '6px', minHeight: '80px', whiteSpace: 'pre-wrap' }}>
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