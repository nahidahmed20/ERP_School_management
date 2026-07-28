import React from 'react';
import Icon from '@/Components/Icons';

export default function InvoiceShowModal({ item, onClose }) {
  if (!item) return null;

  const totalPayable = (parseFloat(item.amount) - parseFloat(item.discount || 0)) + parseFloat(item.fine || 0);

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Invoice Details</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div className="mm-modal-body" style={{ padding: '20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px' }}>
            <div>
              <span style={{ fontSize: '13px', color: '#6b7280', display: 'block' }}>Invoice No</span>
              <strong style={{ fontSize: '20px', color: '#111827' }}>{item.invoice_no}</strong>
            </div>
            <div>
              <span style={{ fontSize: '13px', color: '#6b7280', display: 'block', textAlign: 'right' }}>Status</span>
              <span style={{ 
                  backgroundColor: item.status === 'Paid' ? '#dcfce7' : item.status === 'Unpaid' ? '#fef3c7' : '#e0f2fe', 
                  color: item.status === 'Paid' ? '#15803d' : item.status === 'Unpaid' ? '#d97706' : '#0369a1',
                  padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold'
              }}>
                {item.status}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            
            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Student Name</span>
              <strong style={{ fontSize: '15px', color: '#111827' }}>{item.student?.first_name} {item.student?.last_name}</strong>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Admission No: {item.student?.admission_no}</div>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Fee Group</span>
              <strong style={{ fontSize: '15px', color: '#111827' }}>{item.fee_group?.name}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Invoice Date</span>
              <strong style={{ fontSize: '14px', color: '#374151' }}>{item.invoice_date}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
              <span style={{ fontSize: '12px', color: '#991b1b', display: 'block' }}>Due Date</span>
              <strong style={{ fontSize: '14px', color: '#b91c1c' }}>{item.due_date}</strong>
            </div>

          </div>

          <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Base Amount:</span>
              <strong>৳ {item.amount}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#047857' }}>
              <span>Discount:</span>
              <strong>- ৳ {item.discount || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#b91c1c' }}>
              <span>Fine:</span>
              <strong>+ ৳ {item.fine || 0}</strong>
            </div>
            <hr style={{ border: '0', borderTop: '1px solid #e5e7eb', margin: '10px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: '#111827' }}>
              <strong>Total Payable:</strong>
              <strong style={{ color: '#047857' }}>৳ {totalPayable}</strong>
            </div>
          </div>

          {item.note && (
            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Notes</span>
              <p style={{ margin: '3px 0 0', color: '#374151' }}>{item.note}</p>
            </div>
          )}

        </div>

        <div className="mm-modal-foot mt-2">
          <button type="button" className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}