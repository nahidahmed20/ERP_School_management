import React from 'react';
import Icon from '@/Components/Icons';

export default function ItemShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Item Details</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div className="mm-modal-body" style={{ padding: '20px' }}>
          <div className="mm-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '15px' }}>

            <div style={{ gridColumn: '1 / -1', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Item Name & Code</span>
              <strong style={{ fontSize: '18px', color: '#111827', display: 'block' }}>{item.name}</strong>
              {item.item_code && <span style={{ fontSize: '14px', color: '#4f46e5' }}>Code: {item.item_code}</span>}
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Category</span>
              <strong style={{ fontSize: '15px', color: '#111827' }}>{item.category}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Current Stock (Unit)</span>
              <strong style={{ fontSize: '16px', color: item.quantity <= 5 ? '#b91c1c' : '#047857' }}>
                {item.quantity} {item.unit}
              </strong>
            </div>

            <div style={{ gridColumn: '1 / -1', padding: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Available Variants</span>
              <div style={{ display: 'flex', gap: '30px', marginTop: '5px' }}>
                  <div>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Sizes: </span>
                      <strong style={{ color: '#111827' }}>
                          {item.size && item.size.length > 0 ? item.size.join(', ') : 'N/A'}
                      </strong>
                  </div>
                  <div>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Colors: </span>
                      <strong style={{ color: '#111827' }}>
                          {item.color && item.color.length > 0 ? item.color.join(', ') : 'N/A'}
                      </strong>
                  </div>
              </div>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Purchase Price (Cost)</span>
              <strong style={{ fontSize: '16px', color: '#111827' }}>৳ {item.purchase_price}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a' }}>
              <span style={{ fontSize: '12px', color: '#92400e', display: 'block' }}>Selling Price (POS)</span>
              <strong style={{ fontSize: '16px', color: '#92400e' }}>৳ {item.selling_price}</strong>
            </div>

            <div style={{ gridColumn: '1 / -1', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Description</span>
              <p style={{ margin: '5px 0 0', color: '#374151' }}>{item.description || 'কোনো বর্ণনা দেওয়া নেই।'}</p>
            </div>

            <div style={{ gridColumn: '1 / -1', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Status</span>
              <span className={`mm-status ${item.is_active ? 'is-active' : 'is-inactive'}`} style={{ marginTop: '5px', display: 'inline-block' }}>
                {item.is_active ? 'Active' : 'Inactive'}
              </span>
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
