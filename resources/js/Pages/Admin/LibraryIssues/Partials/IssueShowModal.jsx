import React from 'react';
import Icon from '@/Components/Icons';

export default function IssueShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Issue Details</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div className="mm-modal-body" style={{ padding: '20px' }}>
          <div className="mm-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            
            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Borrower</span>
              <strong style={{ fontSize: '16px', color: '#111827' }}>{item.user?.name}</strong>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.user?.email}</div>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Book Details</span>
              <strong style={{ fontSize: '16px', color: '#111827' }}>{item.book?.title}</strong>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>ISBN: {item.book?.isbn_no || 'N/A'}</div>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Issue Date</span>
              <strong style={{ fontSize: '15px', color: '#111827' }}>{item.issue_date}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Due Date</span>
              <strong style={{ fontSize: '15px', color: '#b91c1c' }}>{item.due_date}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Return Date</span>
              <strong style={{ fontSize: '15px', color: '#15803d' }}>{item.return_date || 'Not Returned Yet'}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Fine Amount</span>
              <strong style={{ fontSize: '15px', color: item.fine_amount > 0 ? '#b91c1c' : '#374151' }}>৳ {item.fine_amount}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Status</span>
              <strong style={{ fontSize: '15px', color: '#111827' }}>{item.status}</strong>
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