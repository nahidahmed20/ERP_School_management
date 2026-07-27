import React from 'react';
import Icon from '@/Components/Icons';

export default function VehicleShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Vehicle & Route Details</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div className="mm-modal-body" style={{ padding: '20px' }}>
          <div className="mm-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            
            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Vehicle Number (Reg. No)</span>
              <strong style={{ fontSize: '16px', color: '#111827' }}>{item.vehicle_number}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Vehicle Model</span>
              <strong style={{ fontSize: '16px', color: '#111827' }}>{item.vehicle_model || 'N/A'}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Driver Name</span>
              <strong style={{ fontSize: '16px', color: '#111827' }}>{item.driver_name}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Driver Phone</span>
              <strong style={{ fontSize: '16px', color: '#111827' }}>{item.driver_phone}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Capacity</span>
              <strong style={{ fontSize: '16px', color: '#111827' }}>{item.capacity} Seats</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Status</span>
              <span className={`mm-status ${item.is_active ? 'is-active' : 'is-inactive'}`}>
                {item.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div style={{ gridColumn: '1 / -1', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Route Details</span>
              <strong style={{ fontSize: '15px', color: '#111827' }}>{item.route_name}</strong>
            </div>

            <div style={{ gridColumn: '1 / -1', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Notes</span>
              <p style={{ margin: '5px 0 0', color: '#374151' }}>{item.note || 'কোনো নোট দেওয়া নেই।'}</p>
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