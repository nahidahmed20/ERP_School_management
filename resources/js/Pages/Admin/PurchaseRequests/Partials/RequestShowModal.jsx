import React from 'react';
import Icon from '@/Components/Icons';

export default function RequestShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Purchase Request Details</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div className="mm-modal-body" style={{ padding: '20px' }}>
          <div className="mm-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '15px' }}>

            <div style={{ gridColumn: '1 / -1', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Title / Purpose</span>
              <strong style={{ fontSize: '18px', color: '#111827' }}>{item.title}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Requested By</span>
              <strong style={{ fontSize: '15px', color: '#111827' }}>{item.requester?.name}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Status</span>
              <strong style={{ fontSize: '15px', color: item.status === 'Rejected' ? '#b91c1c' : item.status === 'Approved' ? '#15803d' : '#d97706' }}>
                {item.status}
              </strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Estimated Amount</span>
              <strong style={{ fontSize: '16px', color: '#047857' }}>৳ {item.estimated_amount}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Expected Delivery Date</span>
              <strong style={{ fontSize: '15px', color: '#111827' }}>{item.expected_date}</strong>
            </div>

            <div style={{ gridColumn: '1 / -1', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Item Description / Details</span>
              <p style={{ margin: '5px 0 0', color: '#374151', whiteSpace: 'pre-wrap' }}>{item.description}</p>
            </div>

            {item.admin_remark && (
              <div style={{ gridColumn: '1 / -1', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                <span style={{ fontSize: '12px', color: '#991b1b', display: 'block' }}>Admin Remark</span>
                <p style={{ margin: '5px 0 0', color: '#7f1d1d' }}>{item.admin_remark}</p>
              </div>
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
