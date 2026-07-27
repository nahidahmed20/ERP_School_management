import React from 'react';
import Icon from '@/Components/Icons';

export default function AllocationShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Allocation Details</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div className="mm-modal-body" style={{ padding: '20px' }}>
          <div className="mm-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            
            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Passenger Name</span>
              <strong style={{ fontSize: '16px', color: '#111827' }}>{item.user?.name}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Passenger Email</span>
              <strong style={{ fontSize: '16px', color: '#111827' }}>{item.user?.email || 'N/A'}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Vehicle Assigned</span>
              <strong style={{ fontSize: '16px', color: '#111827' }}>{item.vehicle?.vehicle_number}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Monthly Fare</span>
              <strong style={{ fontSize: '16px', color: '#047857' }}>৳ {item.monthly_fare}</strong>
            </div>

            <div style={{ gridColumn: '1 / -1', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Pickup Point</span>
              <strong style={{ fontSize: '15px', color: '#111827' }}>{item.pickup_point}</strong>
            </div>

            <div style={{ gridColumn: '1 / -1', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Route Details</span>
              <strong style={{ fontSize: '15px', color: '#111827' }}>{item.vehicle?.route_name}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Status</span>
              <span className={`mm-status ${item.is_active ? 'is-active' : 'is-inactive'}`}>
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