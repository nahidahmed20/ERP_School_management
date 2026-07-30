import React from 'react';
import Icon from '@/Components/Icons';

export default function CertificatePrintModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
        <div className="mm-modal-head">
          <h3>Generated Certificate: {item.certificate_no}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        
        <div className="mm-modal-body" style={{ padding: '20px', background: '#e2e8f0', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '100%',
            aspectRatio: '1.414 / 1',
            background: '#fff',
            border: '10px solid #1e293b',
            padding: '40px',
            position: 'relative',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: 'center',
            fontFamily: 'serif'
          }}>
            <div>
              <h4 style={{ letterSpacing: '3px', textTransform: 'uppercase', color: '#64748b', fontSize: '14px', margin: 0 }}>Certificate ID: {item.certificate_no}</h4>
              <h1 style={{ fontSize: '28px', color: '#0f172a', margin: '10px 0 0 0', fontWeight: 'bold' }}>{item.template?.title}</h1>
            </div>

            <div style={{ fontSize: '14px', color: '#334155', lineHeight: '1.8' }}>
              <p style={{ margin: '0 0 10px 0' }}>This is proudly presented to</p>
              <h2 style={{ fontSize: '26px', color: '#4f46e5', borderBottom: '2px solid #cbd5e1', display: 'inline-block', paddingBottom: '5px', margin: '0 0 15px 0' }}>
                {item.student?.name}
              </h2>
              <div dangerouslySetInnerHTML={{ __html: item.template?.content_body }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-end', marginTop: '20px' }}>
              <div style={{ borderTop: '1px solid #94a3b8', width: '150px', paddingTop: '5px', fontSize: '12px', color: '#64748b' }}>
                Issued: {new Date(item.issue_date).toLocaleDateString()}
              </div>
              <div style={{ borderTop: '1px solid #94a3b8', width: '150px', paddingTop: '5px', fontSize: '12px', color: '#64748b' }}>
                Authorized Signature
              </div>
            </div>
          </div>
        </div>

        <div className="mm-modal-foot mt-2" style={{ padding: '15px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn btn-outline" onClick={() => window.print()}><Icon name="printer" /> Print Certificate</button>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}