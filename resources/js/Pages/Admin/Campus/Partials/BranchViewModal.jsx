import Icon from '@/Components/Icons';

export default function BranchViewModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mm-view-head">
          <div className="mm-view-icon"><Icon name="building" className="mm-view-icon-svg" /></div>
          <div className="mm-view-head-text">
            <div className="mm-vh-label">{item.name}</div>
            <div className="mm-vh-key">Branch Code: {item.code}</div>
          </div>
          <button className="icon-btn" style={{ marginLeft: 'auto' }} onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="mm-view-section">
          <div className="mm-view-section-title">Contact & Location</div>
          <div className="mm-view-grid">
            <div className="mm-view-item"><div className="mm-view-item-label"><Icon name="phone" /> Phone</div><div className="mm-view-item-value">{item.phone || <span className="muted">N/A</span>}</div></div>
            <div className="mm-view-item"><div className="mm-view-item-label"><Icon name="mail" /> Email</div><div className="mm-view-item-value">{item.email || <span className="muted">N/A</span>}</div></div>
            <div className="mm-view-item full"><div className="mm-view-item-label"><Icon name="map-pin" /> Address</div><div className="mm-view-item-value">{item.address || <span className="muted">N/A</span>}</div></div>
          </div>
        </div>
        <div className="mm-view-section">
          <div className="mm-view-section-title">Status</div>
          <div className="mm-view-grid">
            <div className="mm-view-item">
              <div className="mm-view-item-value">
                <span className={`mm-status ${item.status ? 'is-active' : 'is-inactive'}`}>{item.status ? 'Active' : 'Inactive'}</span>
                {item.is_main && <span className="mm-tag mm-tag-parent" style={{ marginLeft: '8px' }}>Main Branch</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="mm-modal-foot"><button type="button" className="btn btn-outline" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}
