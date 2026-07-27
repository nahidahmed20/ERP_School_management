import React from 'react';
import Icon from '@/Components/Icons';

export default function OnlineExamShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Online Exam Details</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div className="mm-modal-body" style={{ padding: '20px' }}>
          <div className="mm-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '15px' }}>

            <div style={{ gridColumn: '1 / -1', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Exam Title</span>
              <strong style={{ fontSize: '18px', color: '#111827' }}>{item.title}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Class</span>
              <strong style={{ fontSize: '15px', color: '#111827' }}>{item.school_class?.name}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Subject</span>
              <strong style={{ fontSize: '15px', color: '#111827' }}>{item.subject?.name}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
              <span style={{ fontSize: '12px', color: '#065f46', display: 'block' }}>Schedule</span>
              <strong style={{ fontSize: '15px', color: '#047857' }}>{item.exam_date}</strong>
              <div style={{ fontSize: '13px', color: '#064e3b' }}>{item.start_time} to {item.end_time}</div>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Duration</span>
              <strong style={{ fontSize: '16px', color: '#111827' }}>{item.duration_minutes} Minutes</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Marks (Total / Passing)</span>
              <strong style={{ fontSize: '16px', color: '#111827' }}>{item.total_marks} / {item.passing_marks}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Publish Status</span>
              <span style={{
                  backgroundColor: item.is_published ? '#dcfce7' : '#fef3c7',
                  color: item.is_published ? '#15803d' : '#d97706',
                  padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold'
              }}>
                {item.is_published ? 'Published' : 'Draft'}
              </span>
            </div>

            <div style={{ gridColumn: '1 / -1', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Instructions</span>
              <p style={{ margin: '5px 0 0', color: '#374151', whiteSpace: 'pre-wrap' }}>{item.description || 'No instructions provided.'}</p>
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
