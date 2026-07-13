import Icon from '@/Components/Icons';

export default function CampusViewModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()}>

        {/* Premium Header */}
        <div className="mm-view-head">
          <div className="mm-view-icon">
            <Icon name="building" className="mm-view-icon-svg" />
          </div>
          <div className="mm-view-head-text">
            <div className="mm-vh-label">{item.name}</div>
            <div className="mm-vh-key">Campus Code: {item.code}</div>
          </div>
          <button className="icon-btn" style={{ marginLeft: 'auto' }} onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        {/* Details Section */}
        <div className="mm-view-section">
          <div className="mm-view-section-title">Contact & Location</div>
          <div className="mm-view-grid">
            <div className="mm-view-item">
              <div className="mm-view-item-label">
                <Icon name="phone" /> Phone Number
              </div>
              <div className="mm-view-item-value">{item.phone || <span className="muted">Not Provided</span>}</div>
            </div>

            <div className="mm-view-item">
              <div className="mm-view-item-label">
                <Icon name="mail" /> Email Address
              </div>
              <div className="mm-view-item-value">{item.email || <span className="muted">Not Provided</span>}</div>
            </div>

            <div className="mm-view-item full">
              <div className="mm-view-item-label">
                <Icon name="map-pin" /> Physical Address
              </div>
              <div className="mm-view-item-value">{item.address || <span className="muted">Not Provided</span>}</div>
            </div>
          </div>
        </div>

        <div className="mm-view-section">
          <div className="mm-view-section-title">Additional Info</div>
          <div className="mm-view-grid">
            <div className="mm-view-item">
              <div className="mm-view-item-label">
                <Icon name="calendar" /> Established Year
              </div>
              <div className="mm-view-item-value">{item.established_year || <span className="muted">N/A</span>}</div>
            </div>

            <div className="mm-view-item">
              <div className="mm-view-item-label">
                <Icon name="check-circle" /> Current Status
              </div>
              <div className="mm-view-item-value">
                <span className={`mm-status ${item.is_active ? 'is-active' : 'is-inactive'}`}>
                  {item.is_active ? 'Active' : 'Inactive'}
                </span>
                {item.is_main && <span className="mm-tag mm-tag-parent" style={{ marginLeft: '8px' }}>Main Campus</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="mm-modal-foot">
          <button type="button" className="btn btn-outline" onClick={onClose}>Close window</button>
        </div>

      </div>
    </div>
  );
}
