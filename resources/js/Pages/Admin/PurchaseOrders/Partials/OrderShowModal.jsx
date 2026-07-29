import React from 'react';
import Icon from '@/Components/Icons';

export default function OrderShowModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1000px' }}>
        <div className="mm-modal-head">
          <h3>Order Details - {item.order_number}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div className="mm-modal-body" style={{ padding: '20px', maxHeight: '75vh', overflowY: 'auto' }}>

          {/* Top Info Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #e2e8f0' }}>
            <div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Vendor Details</div>
                <strong style={{ fontSize: '16px', color: '#0f172a' }}>{item.vendor?.name}</strong>
            </div>
            <div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Order Date</div>
                <strong style={{ fontSize: '16px', color: '#0f172a' }}>{item.order_date}</strong>
            </div>
            <div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Expected Delivery</div>
                <strong style={{ fontSize: '16px', color: '#0f172a' }}>{item.delivery_date || 'N/A'}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Current Status</div>
                <span style={{
                  padding: '4px 12px',
                  background: item.status === 'Received' ? '#dcfce7' : item.status === 'Cancelled' ? '#fee2e2' : '#fef3c7',
                  color: item.status === 'Received' ? '#15803d' : item.status === 'Cancelled' ? '#b91c1c' : '#d97706',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}>
                  {item.status}
                </span>
            </div>
          </div>

          {/* Ordered Items Table */}
          <h4 style={{ marginBottom: '12px', color: '#334155' }}>Ordered Items</h4>
          <div style={{ overflowX: 'auto' }}>
            <table className="mm-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <thead style={{ background: '#f8fafc', textAlign: 'left' }}>
                    <tr>
                        <th style={{ padding: '12px 15px', borderBottom: '1px solid #e2e8f0', width: '35%' }}>Product Detail</th>
                        <th style={{ padding: '12px 15px', borderBottom: '1px solid #e2e8f0', width: '20%' }}>Variants</th>
                        <th style={{ padding: '12px 15px', borderBottom: '1px solid #e2e8f0', width: '15%' }}>Qty</th>
                        <th style={{ padding: '12px 15px', borderBottom: '1px solid #e2e8f0', width: '15%' }}>Unit Price</th>
                        <th style={{ padding: '12px 15px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', width: '15%' }}>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {item.items?.map(oi => (
                        <tr key={oi.id}>
                            <td style={{ padding: '12px 15px', borderBottom: '1px solid #e2e8f0' }}>
                                <div style={{ fontWeight: 600, color: '#0f172a' }}>{oi.purchase_item?.name}</div>
                                {oi.purchase_item?.item_code && <div style={{ fontSize: '12px', color: '#4f46e5', marginTop: '2px' }}>Code: {oi.purchase_item.item_code}</div>}
                            </td>
                            <td style={{ padding: '12px 15px', borderBottom: '1px solid #e2e8f0', fontSize: '13px', color: '#475569' }}>
                                {oi.size && <div style={{ marginBottom: '2px' }}>Size: <strong style={{ color: '#0f172a' }}>{oi.size}</strong></div>}
                                {oi.color && <div>Color: <strong style={{ color: '#0f172a' }}>{oi.color}</strong></div>}
                                {(!oi.size && !oi.color) && <span>-</span>}
                            </td>
                            <td style={{ padding: '12px 15px', borderBottom: '1px solid #e2e8f0', fontWeight: 500 }}>
                              {oi.quantity} <span style={{ fontSize: '12px', color: '#64748b' }}>{oi.purchase_item?.unit}</span>
                            </td>
                            <td style={{ padding: '12px 15px', borderBottom: '1px solid #e2e8f0' }}>
                              ৳ {Number(oi.unit_price).toFixed(2)}
                            </td>
                            <td style={{ padding: '12px 15px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 'bold', color: '#0f172a' }}>
                              ৳ {Number(oi.subtotal).toFixed(2)}
                            </td>
                        </tr>
                    ))}
                    {(!item.items || item.items.length === 0) && (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>কোনো আইটেম পাওয়া যায়নি</td></tr>
                    )}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan="4" style={{ textAlign: 'right', padding: '15px', fontWeight: 'bold', fontSize: '16px', color: '#334155' }}>Grand Total:</td>
                        <td style={{ textAlign: 'right', padding: '15px', fontWeight: 'bold', color: '#16a34a', fontSize: '18px', borderTop: '2px solid #e2e8f0' }}>
                          ৳ {Number(item.total_amount).toFixed(2)}
                        </td>
                    </tr>
                </tfoot>
            </table>
          </div>

          {/* Additional Notes & Address Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
             <div style={{ padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Shipping Address</span>
                <p style={{ margin: 0, color: '#374151', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                  {item.shipping_address || 'N/A'}
                </p>
             </div>
             <div style={{ padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '5px', fontWeight: 600 }}>Terms & Notes</span>
                <p style={{ margin: 0, color: '#374151', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                  {item.notes || 'N/A'}
                </p>
             </div>
          </div>

        </div>

        <div className="mm-modal-foot mt-2" style={{ borderTop: '1px solid #e2e8f0', padding: '15px 20px' }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
