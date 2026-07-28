import Icon from '@/Components/Icons';

export default function ShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Applicant Details</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Name</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>{item.name}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Applied For</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1d4ed8' }}>{item.job_post?.title}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Phone Number</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.phone}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Email</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.email || 'N/A'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Status</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.status}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Applied Date</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.applied_date}</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Cover Letter / Remarks</div>
            <div style={{ fontSize: '14px', color: '#334155', background: '#f1f5f9', padding: '12px', borderRadius: '6px', minHeight: '60px', whiteSpace: 'pre-wrap' }}>
              {item.cover_letter || 'No remarks provided.'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Resume / CV</div>
            {item.resume ? (
              <a href={`/storage/${item.resume}`} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display: 'inline-flex', gap: '6px', marginTop: '4px' }}>
                <Icon name="download" /> View / Download CV
              </a>
            ) : (
              <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>No CV attached.</div>
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