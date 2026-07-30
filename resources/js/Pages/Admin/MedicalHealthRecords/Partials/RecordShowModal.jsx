import React from 'react';
import Icon from '@/Components/Icons';

export default function RecordShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="mm-modal-head">
          <h3>Health Record Details</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="mm-modal-body" style={{ padding: '20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #e2e8f0' }}>
             <h2 style={{ margin: '0 0 5px 0' }}>{item.user?.name}</h2>
             <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
               Blood Group: {item.blood_group || 'Unknown'}
             </span>
          </div>
          <table className="mm-table" style={{ width: '100%' }}>
            <tbody>
              <tr><td style={{ color: '#64748b', width: '40%' }}>Height:</td><td><strong>{item.height || 'N/A'}</strong></td></tr>
              <tr><td style={{ color: '#64748b' }}>Weight:</td><td><strong>{item.weight || 'N/A'}</strong></td></tr>
              <tr><td style={{ color: '#64748b' }}>Allergies:</td><td>{item.allergies || 'None reported'}</td></tr>
              <tr><td style={{ color: '#64748b' }}>Chronic Conditions:</td><td>{item.chronic_conditions || 'None reported'}</td></tr>
              <tr><td style={{ color: '#64748b' }}>Emergency Contact:</td><td><strong>{item.emergency_contact || 'N/A'}</strong></td></tr>
            </tbody>
          </table>
        </div>
        <div className="mm-modal-foot mt-2" style={{ padding: '15px 20px', display: 'flex', justifyContent: 'center' }}>
          <button className="btn btn-outline" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>Close</button>
        </div>
      </div>
    </div>
  );
}