import React from 'react';
import Icon from '@/Components/Icons';

export default function AttemptShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Exam Result Details</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div className="mm-modal-body" style={{ padding: '20px' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>

            <div style={{ gridColumn: '1 / -1', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <span style={{ fontSize: '13px', color: '#6b7280', display: 'block' }}>Student Details</span>
              <strong style={{ fontSize: '18px', color: '#111827' }}>{item.student?.name}</strong>
              <div style={{ fontSize: '13px', color: '#4b5563' }}>Email: {item.student?.email}</div>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Exam Title</span>
              <strong style={{ fontSize: '15px', color: '#111827' }}>{item.exam?.title}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Attempt Date</span>
              <strong style={{ fontSize: '15px', color: '#111827' }}>{item.attempt_date}</strong>
            </div>

            <div style={{ padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
              <span style={{ fontSize: '13px', color: '#166534', display: 'block' }}>Obtained Marks</span>
              <strong style={{ fontSize: '24px', color: '#15803d' }}>{item.obtained_marks}</strong>
              <div style={{ fontSize: '12px', color: '#166534' }}>out of {item.exam?.total_marks}</div>
            </div>

            <div style={{
                padding: '15px',
                backgroundColor: item.status === 'Passed' ? '#ecfdf5' : (item.status === 'Failed' ? '#fef2f2' : '#fffbeb'),
                borderRadius: '8px',
                border: `1px solid ${item.status === 'Passed' ? '#a7f3d0' : (item.status === 'Failed' ? '#fecaca' : '#fde68a')}`,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}>
              <span style={{ fontSize: '13px', color: '#4b5563', display: 'block', marginBottom: '5px' }}>Final Status</span>
              <strong style={{
                  fontSize: '20px',
                  color: item.status === 'Passed' ? '#047857' : (item.status === 'Failed' ? '#b91c1c' : '#d97706')
              }}>
                {item.status}
              </strong>
            </div>

          </div>

          <div style={{ padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <span style={{ fontSize: '14px', color: '#374151', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Teacher Remarks / Feedback:</span>
            <p style={{ margin: '0', color: '#4b5563', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {item.admin_remarks || 'No remarks provided by the teacher.'}
            </p>
          </div>

        </div>

        <div className="mm-modal-foot mt-2">
          <button type="button" className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
