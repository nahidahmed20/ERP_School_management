import React from 'react';
import Icon from '@/Components/Icons';

export default function TranscriptShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '95%' }}>
        <div className="mm-modal-head">
          <h3>Transcript Preview: {item.title}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div className="mm-modal-body" style={{ padding: '20px', background: '#cbd5e1', display: 'flex', justifyContent: 'center' }}>

          {/* A4 Paper Simulation */}
          <div style={{
            width: '100%',
            maxWidth: '650px',
            background: '#fff',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            padding: '40px',
            fontFamily: 'Arial, sans-serif',
            color: '#0f172a'
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #1e293b', paddingBottom: '15px', marginBottom: '20px' }}>
              <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase' }}>Academic Transcript</h1>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#475569' }}>{item.header_text || 'Official Record of Student Progress'}</h3>
            </div>

            {/* Student Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', marginBottom: '20px' }}>
              <div><strong>Student Name:</strong> [ Student Name ]</div>
              <div><strong>Student ID:</strong> [ ID Number ]</div>
              <div><strong>Class/Program:</strong> [ Class Name ]</div>
              <div><strong>Grading System:</strong> {item.grading_system}</div>
            </div>

            {/* Mock Grades Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'left' }}>Subject</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center' }}>Marks</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center' }}>Grade</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center' }}>GPA</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px' }}>Mathematics</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center' }}>85</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center' }}>A+</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center' }}>5.0</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px' }}>English</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center' }}>78</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center' }}>A</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center' }}>4.0</td>
                </tr>
              </tbody>
            </table>

            <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '14px', marginBottom: '40px' }}>
              CGPA / Total: [ Calculated Value ]
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px', fontSize: '12px' }}>
              <div style={{ borderTop: '1px solid #0f172a', paddingTop: '5px', width: '150px', textAlign: 'center' }}>Prepared By</div>
              <div style={{ borderTop: '1px solid #0f172a', paddingTop: '5px', width: '150px', textAlign: 'center' }}>Head of Institution</div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '11px', color: '#64748b' }}>
              {item.footer_text || 'This transcript is invalid without the official seal and signature.'}
            </div>

          </div>
        </div>

        <div className="mm-modal-foot mt-2" style={{ padding: '15px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn btn-outline" onClick={() => window.print()}><Icon name="printer" /> Print Demo</button>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
