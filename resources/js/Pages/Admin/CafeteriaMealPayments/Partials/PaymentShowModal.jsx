import React from 'react';
import Icon from '@/Components/Icons';

export default function PaymentShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="mm-modal-head">
          <h3>Payment Receipt</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        
        <div className="mm-modal-body" style={{ padding: '20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
             <Icon name="check" style={{ fontSize: '40px', color: '#16a34a', background: '#dcfce7', padding: '10px', borderRadius: '50%', margin: '0 auto' }} />
             <h2 style={{ margin: '10px 0 5px 0', color: '#0f172a' }}>৳ {Number(item.amount).toFixed(2)}</h2>
             <span style={{ color: '#64748b' }}>Payment Successful</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 0', color: '#64748b' }}>Paid By</td>
                <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 'bold' }}>{item.user?.name}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 0', color: '#64748b' }}>Date</td>
                <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 'bold' }}>{new Date(item.payment_date).toLocaleDateString()}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 0', color: '#64748b' }}>Method</td>
                <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 'bold' }}>{item.payment_method}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 0', color: '#64748b' }}>Transaction ID</td>
                <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 'bold' }}>{item.transaction_id || 'N/A'}</td>
              </tr>
              {item.remarks && (
                <tr>
                  <td colSpan="2" style={{ padding: '15px 0 0 0', color: '#475569', fontSize: '14px' }}>
                    <strong>Remarks:</strong> {item.remarks}
                  </td>
                </tr>
              )}
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