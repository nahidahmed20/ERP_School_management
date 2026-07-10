import Icon from '@/Components/Icons';

export default function ViewModal({ item, onClose }) {
  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-sm" onClick={(e) => e.stopPropagation()}>

        <div className="mm-view-head">
          <div className="mm-view-icon">
            <Icon name={item.icon || 'grid'} className="mm-view-icon-svg" />
          </div>
          <div className="mm-view-head-text">
            <div className="mm-vh-label">{item.label}</div>
            <div className="mm-vh-key">{item.key}</div>
          </div>
          <button className="icon-btn" style={{ marginLeft: 'auto' }} onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        <div className="mm-view-section">
          <div className="mm-view-section-title">Placement</div>
          <div className="mm-view-grid">
            <div className="mm-view-item">
              <span className="mm-view-item-label"><Icon name="grid" /> Group</span>
              <span className="mm-view-item-value">{item.group}</span>
            </div>
            <div className="mm-view-item">
              <span className="mm-view-item-label"><Icon name="chevron" /> Parent</span>
              <span className={`mm-view-item-value ${!item.parent ? 'muted' : ''}`}>
                {item.parent ?? 'Top-level item'}
              </span>
            </div>
            <div className="mm-view-item">
              <span className="mm-view-item-label"><Icon name="settings" /> Order</span>
              <span className="mm-view-item-value">{item.order}</span>
            </div>
            <div className="mm-view-item">
              <span className="mm-view-item-label"><Icon name="eye" /> Status</span>
              <span className={`mm-status ${item.is_active ? 'is-active' : 'is-inactive'}`} style={{ width: 'fit-content' }}>
                {item.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div className="mm-view-section">
          <div className="mm-view-section-title">Routing &amp; Display</div>
          <div className="mm-view-grid">
            <div className="mm-view-item full">
              <span className="mm-view-item-label"><Icon name="search" /> Route Name</span>
              <span className="mm-view-item-value">
                {item.route_name ? <code>{item.route_name}</code> : <span className="muted">Not set</span>}
              </span>
            </div>
            <div className="mm-view-item">
              <span className="mm-view-item-label"><Icon name="grid" /> Icon</span>
              <span className={`mm-view-item-value ${!item.icon ? 'muted' : ''}`}>
                {item.icon ?? 'None (submenu item)'}
              </span>
            </div>
            <div className="mm-view-item">
              <span className="mm-view-item-label"><Icon name="chart" /> Badge Count</span>
              <span className={`mm-view-item-value ${!item.badge_count ? 'muted' : ''}`}>
                {item.badge_count ?? '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="mm-modal-foot">
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
