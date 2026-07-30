import React from 'react';
import Icon from '@/Components/Icons';

export default function VaccineShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="mm-modal-head">
          <h3>Vaccination Details</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="mm-modal-body" style={{ padding: '20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #e2e8f0' }}>
             <Icon name="shield" style={{ fontSize: '40px', color: '#4f46e5', background: '#e0e7ff', padding: '10px', borderRadius: '50%', margin: '0 auto 10px auto' }} />
             <h2 style={{ margin: '0 0 5px 0' }}>{item.vaccine_name}</h2>
             <span style={{ color: '#64748b', fontSize: '14px' }}>Patient: <strong>{item.student?.name}</strong></span>
          </div>
          <table className="mm-table" style={{ width: '100%', border: '1px solid #e2e8f0' }}>
            <tbody>
              <tr><td style={{ color: '#64748b', width: '45%' }}>Dose Number:</td><td><strong>{item.dose_number || 'N/A'}</strong></td></tr>
              <tr><td style={{ color: '#64748b' }}>Date Administered:</td><td><strong>{new Date(item.date_administered).toLocaleDateString()}</strong></td></tr>
              <tr>
                <td style={{ color: '#64748b' }}>Next Due Date:</td>
                <td>{item.next_due_date ? <strong style={{ color: '#b91c1c' }}>{new Date(item.next_due_date).toLocaleDateString()}</strong> : 'None'}</td>
              </tr>
              {item.remarks && <tr><td style={{ color: '#64748b' }}>Remarks:</td><td>{item.remarks}</td></tr>}
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