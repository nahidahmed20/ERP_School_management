import React from 'react';
import Icon from '@/Components/Icons';

export default function QuestionShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mm-modal-head">
          <h3>Question Details</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div className="mm-modal-body" style={{ padding: '20px' }}>

          {/* Question Meta Info */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#e5e7eb', padding: '4px 10px', borderRadius: '15px', fontSize: '12px' }}>
              <strong>Class:</strong> {item.school_class?.name}
            </span>
            <span style={{ backgroundColor: '#e5e7eb', padding: '4px 10px', borderRadius: '15px', fontSize: '12px' }}>
              <strong>Subject:</strong> {item.subject?.name}
            </span>
            <span style={{ backgroundColor: '#e0f2fe', padding: '4px 10px', borderRadius: '15px', fontSize: '12px', color: '#0369a1' }}>
              <strong>Type:</strong> {item.question_type}
            </span>
            <span style={{ backgroundColor: '#dcfce7', padding: '4px 10px', borderRadius: '15px', fontSize: '12px', color: '#15803d' }}>
              <strong>Marks:</strong> {item.marks}
            </span>
          </div>

          {/* The Question */}
          <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
            <strong style={{ fontSize: '18px', color: '#111827', whiteSpace: 'pre-wrap' }}>Q: {item.question}</strong>
          </div>

          {/* Options */}
          {item.question_type === 'MCQ' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              {['a', 'b', 'c', 'd'].map(opt => (
                <div key={opt} style={{
                  padding: '12px 15px',
                  borderRadius: '8px',
                  border: item.correct_answer === opt ? '2px solid #10b981' : '1px solid #d1d5db',
                  backgroundColor: item.correct_answer === opt ? '#ecfdf5' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontWeight: 'bold', color: item.correct_answer === opt ? '#047857' : '#6b7280' }}>
                    {opt.toUpperCase()}.
                  </span>
                  <span style={{ color: '#374151', flexGrow: 1 }}>{item[`option_${opt}`] || '-'}</span>

                  {item.correct_answer === opt && (
                    <Icon name="check-circle" style={{ color: '#10b981' }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {item.question_type === 'True/False' && (
            <div style={{ padding: '15px', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', marginBottom: '20px' }}>
              <span style={{ color: '#065f46', fontWeight: 'bold' }}>Correct Answer: </span>
              <span style={{ fontSize: '16px', color: '#047857' }}>{item.correct_answer}</span>
            </div>
          )}

          {/* Explanation */}
          {item.explanation && (
            <div style={{ backgroundColor: '#fffbeb', padding: '15px', borderRadius: '8px', border: '1px solid #fde68a' }}>
              <span style={{ fontSize: '13px', color: '#92400e', display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Explanation:</span>
              <p style={{ margin: '0', color: '#b45309', whiteSpace: 'pre-wrap' }}>{item.explanation}</p>
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
