import React from 'react';
import Icon from '@/Components/Icons';

export default function AssetShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Asset Details</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div className="mm-modal-body" style={{ padding: '20px' }}>
          <div className="mm-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '15px' }}>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Asset Tag (Barcode)</span>
              <strong style={{ fontSize: '18px', color: '#111827', letterSpacing: '1px' }}>{item.asset_tag}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Asset Name</span>
              <strong style={{ fontSize: '16px', color: '#111827' }}>{item.name}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Category</span>
              <strong style={{ fontSize: '15px', color: '#374151' }}>{item.category || 'N/A'}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Current Status</span>
              <strong style={{
                  fontSize: '15px',
                  color: ['Damaged', 'Lost'].includes(item.status) ? '#b91c1c' : item.status === 'Available' ? '#15803d' : '#0369a1'
              }}>
                {item.status}
              </strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
              <span style={{ fontSize: '12px', color: '#065f46', display: 'block' }}>Assigned To (User)</span>
              <strong style={{ fontSize: '16px', color: '#047857' }}>{item.assignee?.name || 'Not Assigned'}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Location / Room</span>
              <strong style={{ fontSize: '15px', color: '#111827' }}>{item.location || 'N/A'}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Purchase Date</span>
              <strong style={{ fontSize: '15px', color: '#374151' }}>{item.purchase_date || 'N/A'}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Cost / Value</span>
              <strong style={{ fontSize: '15px', color: '#374151' }}>৳ {item.cost}</strong>
            </div>

            <div style={{ gridColumn: '1 / -1', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Notes & Conditions</span>
              <p style={{ margin: '5px 0 0', color: '#374151', whiteSpace: 'pre-wrap' }}>{item.note || 'No notes available.'}</p>
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
