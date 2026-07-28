import Icon from '@/Components/Icons';

export default function ShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Interview Details</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Applicant</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>{item.applicant?.name}</div>
              <div style={{ fontSize: '13px', color: '#1d4ed8' }}>Applied for: {item.applicant?.job_post?.title}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Interviewer</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.interviewer_name}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Status</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.status}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Date & Time</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.interview_date} at {item.interview_time}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Location</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.location || 'N/A'}</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Remarks / Feedback</div>
            <div style={{ fontSize: '14px', color: '#334155', background: '#f1f5f9', padding: '12px', borderRadius: '6px', minHeight: '60px', whiteSpace: 'pre-wrap' }}>
              {item.remarks || 'No remarks provided.'}
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
