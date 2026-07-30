import React from 'react';
import Icon from '@/Components/Icons';

export default function LogShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
        <div className="mm-modal-head">
          <h3>Medical Visit Details</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="mm-modal-body" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '15px' }}>
             <div>
                <div style={{ color: '#64748b', fontSize: '12px' }}>Patient Name</div>
                <strong style={{ fontSize: '16px' }}>{item.patient?.name}</strong>
             </div>
             <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#64748b', fontSize: '12px' }}>Date & Time</div>
                <strong>{new Date(item.visit_time).toLocaleString()}</strong>
             </div>
          </div>
          <table className="mm-table" style={{ width: '100%', border: '1px solid #e2e8f0' }}>
            <tbody>
              <tr><td style={{ width: '35%', color: '#64748b' }}>Room:</td><td><strong>{item.room?.room_number}</strong></td></tr>
              <tr><td style={{ color: '#64748b' }}>Symptoms:</td><td>{item.symptoms}</td></tr>
              <tr><td style={{ color: '#64748b' }}>Diagnosis:</td><td>{item.diagnosis || 'N/A'}</td></tr>
              <tr><td style={{ color: '#64748b' }}>Treatment Given:</td><td>{item.treatment_given || 'N/A'}</td></tr>
              <tr><td style={{ color: '#64748b' }}>Action Taken:</td><td><span className="badge-outline">{item.action_taken}</span></td></tr>
            </tbody>
          </table>
        </div>
        <div className="mm-modal-foot mt-2" style={{ padding: '15px 20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}