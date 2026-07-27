import React from 'react';
import Icon from '@/Components/Icons';

export default function HomeworkShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Homework Details</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div className="mm-modal-body" style={{ padding: '20px' }}>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#1f2937', fontSize: '20px' }}>{item.title}</h4>
            <span className={`mm-status ${item.is_active ? 'is-active' : 'is-inactive'}`}>
              {item.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Class</span>
              <strong style={{ fontSize: '15px', color: '#111827' }}>{item.school_class?.name}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Subject</span>
              <strong style={{ fontSize: '15px', color: '#111827' }}>{item.subject?.name}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <span style={{ fontSize: '12px', color: '#166534', display: 'block' }}>Assigned Date</span>
              <strong style={{ fontSize: '15px', color: '#15803d' }}>{item.homework_date}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
              <span style={{ fontSize: '12px', color: '#991b1b', display: 'block' }}>Submission Deadline</span>
              <strong style={{ fontSize: '15px', color: '#b91c1c' }}>{item.submission_date}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Total Marks</span>
              <strong style={{ fontSize: '15px', color: '#111827' }}>{item.total_marks || 'N/A'}</strong>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
              <span style={{ fontSize: '12px', color: '#075985', display: 'block' }}>Attachment</span>
              {item.document_path ? (
                <a href={`/storage/${item.document_path}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#0284c7', fontWeight: 'bold', textDecoration: 'underline', marginTop: '3px' }}>
                  <Icon name="download" style={{ width: '14px' }} /> View / Download File
                </a>
              ) : (
                <span style={{ color: '#0ea5e9', fontSize: '14px' }}>No attachment</span>
              )}
            </div>

          </div>

          <div style={{ padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <span style={{ fontSize: '14px', color: '#374151', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Instructions & Description:</span>
            <p style={{ margin: '0', color: '#4b5563', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {item.description || 'No description provided.'}
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
