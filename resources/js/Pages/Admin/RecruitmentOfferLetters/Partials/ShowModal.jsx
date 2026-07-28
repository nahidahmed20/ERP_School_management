import Icon from '@/Components/Icons';

export default function ShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Offer Letter Details</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Applicant Name</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>{item.applicant?.name}</div>
              <div style={{ fontSize: '13px', color: '#1d4ed8' }}>Position: {item.applicant?.job_post?.title}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Salary Offered</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.salary_offered}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Candidate Status</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: item.status === 'Accepted' ? '#15803d' : (item.status === 'Declined' ? '#b91c1c' : '#d97706') }}>
                {item.status}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Issue Date</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.issue_date}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Joining Date</div>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.joining_date}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Valid Until</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#d97706' }}>{item.valid_until}</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Terms & Conditions / Note</div>
            <div style={{ fontSize: '14px', color: '#334155', background: '#f1f5f9', padding: '12px', borderRadius: '6px', minHeight: '60px', whiteSpace: 'pre-wrap' }}>
              {item.terms_conditions || 'No terms provided.'}
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
