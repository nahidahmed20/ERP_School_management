import React from 'react';
import Icon from '@/Components/Icons';

export default function OrderShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="mm-modal-head">
          <h3>Order Details: {item.order_number}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div className="mm-modal-body" style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px', background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Customer</div>
              <strong>{item.customer?.name}</strong>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Outlet</div>
              <strong>{item.outlet?.name}</strong>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Order Status</div>
              <strong>{item.status}</strong>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Payment Status</div>
              <strong style={{ color: item.payment_status === 'Paid' ? '#16a34a' : '#b91c1c' }}>{item.payment_status}</strong>
            </div>
          </div>

          <h4 style={{ marginBottom: '10px' }}>Ordered Items</h4>
          <table className="mm-table" style={{ border: '1px solid #e2e8f0' }}>
            <thead style={{ background: '#f1f5f9' }}>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {item.items?.map((food, index) => (
                <tr key={index}>
                  <td>{food.name}</td>
                  <td>{food.qty}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>৳ {(food.price * food.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ textAlign: 'right', marginTop: '15px', fontSize: '18px' }}>
            <strong>Grand Total: </strong> <span style={{ color: '#16a34a' }}>৳ {Number(item.total_amount).toFixed(2)}</span>
          </div>
        </div>
        <div className="mm-modal-foot mt-2" style={{ padding: '15px 20px' }}>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}