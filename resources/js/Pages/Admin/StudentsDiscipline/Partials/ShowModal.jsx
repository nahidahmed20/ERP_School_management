import Icon from '@/Components/Icons';

export default function ShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Record Details</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Student Info Box */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Student Details</div>
            <strong style={{ fontSize: '16px', color: '#0f172a' }}>
              {item.student?.first_name} {item.student?.last_name || ''}
            </strong>
            <div style={{ fontSize: '14px', color: '#475569', marginTop: '4px' }}>
              Admission No: {item.student?.admission_no} <br/>
              Class: {item.student?.current_enrollment?.school_class?.name}
            </div>
          </div>

          {/* Record Details */}
          <div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Title / Subject</div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>{item.title}</div>
          </div>

          <div style={{ display: 'flex', gap: '30px' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Type</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.type}</div>
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Incident Date</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.incident_date}</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Description</div>
            <div style={{ fontSize: '14px', color: '#334155', background: '#f1f5f9', padding: '10px', borderRadius: '6px', minHeight: '50px' }}>
              {item.description || 'No description provided.'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Action Taken</div>
            <div style={{ fontSize: '14px', color: '#334155', background: '#f1f5f9', padding: '10px', borderRadius: '6px' }}>
              {item.action_taken || 'No action recorded.'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Reported By</div>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.reported_by || 'N/A'}</div>
          </div>

        </div>

        <div className="mm-modal-foot mt-2">
            <button type="button" className="btn btn-outline" onClick={onClose}>Close</button>
            </div>
      </div>
    </div>
  );
}