import React from 'react';
import Icon from '@/Components/Icons';

export default function LessonShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Lesson / Study Material</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div className="mm-modal-body" style={{ padding: '20px' }}>

          <div style={{ padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '8px', marginBottom: '15px' }}>
            <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Course</span>
            <strong style={{ fontSize: '16px', color: '#111827' }}>{item.course?.title}</strong>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#1f2937', fontSize: '20px' }}>{item.title}</h4>
            <span className={`mm-status ${item.is_active ? 'is-active' : 'is-inactive'}`}>
              {item.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>

            {/* Video Link Box */}
            <div style={{ padding: '15px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', color: '#991b1b', fontWeight: 'bold', marginBottom: '5px' }}>
                <Icon name="play-circle" style={{ width: '16px' }} /> Video Material
              </span>
              {item.video_url ? (
                <a href={item.video_url} target="_blank" rel="noreferrer" style={{ color: '#dc2626', textDecoration: 'underline', wordBreak: 'break-all' }}>
                  {item.video_url}
                </a>
              ) : (
                <span style={{ color: '#ef4444', fontSize: '13px' }}>No video link provided.</span>
              )}
            </div>

            {/* Document Box */}
            <div style={{ padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', color: '#075985', fontWeight: 'bold', marginBottom: '5px' }}>
                <Icon name="download" style={{ width: '16px' }} /> File / PDF
              </span>
              {item.document_path ? (
                <a href={`/storage/${item.document_path}`} target="_blank" rel="noreferrer" style={{ display: 'inline-block', backgroundColor: '#0284c7', color: '#fff', padding: '5px 12px', borderRadius: '4px', textDecoration: 'none', fontSize: '13px' }}>
                  Download Material
                </a>
              ) : (
                <span style={{ color: '#0ea5e9', fontSize: '13px' }}>No file attached.</span>
              )}
            </div>

          </div>

          {/* Details / Text */}
          <div style={{ padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <span style={{ fontSize: '14px', color: '#374151', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Description / Reading Text:</span>
            <p style={{ margin: '0', color: '#4b5563', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {item.description || 'No additional text details.'}
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
