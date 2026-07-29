import React from 'react';
import Icon from '@/Components/Icons';

export default function SaleShowModal({ sale, onClose }) {
  if (!sale) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div className="mm-modal mm-modal-lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
        <div className="mm-modal-head">
          <h3>Sale Details - {sale.invoice_number}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <div className="mm-modal-body" style={{ padding: '20px', maxHeight: '75vh', overflowY: 'auto' }}>

          {/* Top Info Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #e2e8f0' }}>
            <div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Customer</div>
                <strong style={{ fontSize: '16px', color: '#0f172a' }}>{sale.customer_name}</strong>
                {sale.customer_phone && <div style={{ fontSize: '13px', color: '#475569' }}>{sale.customer_phone}</div>}
            </div>
            <div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Date & Time</div>
                <strong style={{ fontSize: '16px', color: '#0f172a' }}>{new Date(sale.created_at).toLocaleString()}</strong>
            </div>
            <div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Sold By</div>
                <strong style={{ fontSize: '16px', color: '#0f172a' }}>{sale.seller?.name || 'Admin'}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Payment Status</div>
                <span style={{
                  padding: '4px 12px',
                  background: sale.due_amount > 0 ? '#fee2e2' : '#dcfce7',
                  color: sale.due_amount > 0 ? '#b91c1c' : '#15803d',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}>
                  {sale.due_amount > 0 ? 'Due' : 'Paid'} ({sale.payment_method})
                </span>
            </div>
          </div>

          {/* Sold Items Table */}
          <h4 style={{ marginBottom: '12px', color: '#334155' }}>Items Sold</h4>
          <table className="mm-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <thead style={{ background: '#f8fafc', textAlign: 'left' }}>
                  <tr>
                      <th style={{ padding: '10px 15px', borderBottom: '1px solid #e2e8f0', width: '40%' }}>Product</th>
                      <th style={{ padding: '10px 15px', borderBottom: '1px solid #e2e8f0', width: '20%' }}>Variant</th>
                      <th style={{ padding: '10px 15px', borderBottom: '1px solid #e2e8f0', width: '10%' }}>Qty</th>
                      <th style={{ padding: '10px 15px', borderBottom: '1px solid #e2e8f0', width: '15%' }}>Price</th>
                      <th style={{ padding: '10px 15px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', width: '15%' }}>Subtotal</th>
                  </tr>
              </thead>
              <tbody>
                  {sale.items?.map(item => (
                      <tr key={item.id}>
                          <td style={{ padding: '10px 15px', borderBottom: '1px solid #e2e8f0' }}>
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.product?.name}</div>
                              {item.product?.item_code && <div style={{ fontSize: '12px', color: '#4f46e5' }}>{item.product.item_code}</div>}
                          </td>
                          <td style={{ padding: '10px 15px', borderBottom: '1px solid #e2e8f0', fontSize: '13px' }}>
                              {item.size && <div>Size: <strong>{item.size}</strong></div>}
                              {item.color && <div>Color: <strong>{item.color}</strong></div>}
                              {(!item.size && !item.color) && '-'}
                          </td>
                          <td style={{ padding: '10px 15px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>{item.quantity}</td>
                          <td style={{ padding: '10px 15px', borderBottom: '1px solid #e2e8f0' }}>৳ {Number(item.unit_price).toFixed(2)}</td>
                          <td style={{ padding: '10px 15px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 'bold' }}>৳ {Number(item.subtotal).toFixed(2)}</td>
                      </tr>
                  ))}
              </tbody>
          </table>

          {/* Payment Summary */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
             <div style={{ width: '300px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                     <span style={{ color: '#64748b' }}>Subtotal:</span>
                     <strong>৳ {Number(sale.subtotal).toFixed(2)}</strong>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#b91c1c' }}>
                     <span>Discount:</span>
                     <strong>- ৳ {Number(sale.discount).toFixed(2)}</strong>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #cbd5e1', fontSize: '16px' }}>
                     <span style={{ color: '#0f172a', fontWeight: 'bold' }}>Total:</span>
                     <strong style={{ color: '#16a34a' }}>৳ {Number(sale.total_amount).toFixed(2)}</strong>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                     <span style={{ color: '#64748b' }}>Paid Amount:</span>
                     <strong>৳ {Number(sale.paid_amount).toFixed(2)}</strong>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b91c1c' }}>
                     <span>Due Amount:</span>
                     <strong>৳ {Number(sale.due_amount).toFixed(2)}</strong>
                 </div>
             </div>
          </div>

        </div>

        {/* Modal Footer with Print Button */}
        <div className="mm-modal-foot mt-2" style={{ padding: '15px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
          <a href={route('admin.sales.invoice', sale.id)} target="_blank" rel="noreferrer" className="btn" style={{ background: '#4f46e5', borderColor: '#4f46e5', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <Icon name="printer" /> Print Invoice
          </a>
          <button type="button" className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
