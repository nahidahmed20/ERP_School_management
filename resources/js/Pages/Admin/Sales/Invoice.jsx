import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function Invoice({ sale }) {

  // পেজ লোড হওয়ার পর অটোমেটিক প্রিন্ট ডায়লগ ওপেন করতে চাইলে নিচের লাইনটি আনকমেন্ট করতে পারেন
  // useEffect(() => { window.print(); }, []);

  const handlePrint = () => {
      window.print();
  };

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Inter', sans-serif" }} className="invoice-wrapper">
      <Head title={`Invoice - ${sale.invoice_number}`} />

      {/* --- Print Styles --- */}
      <style>{`
        @media print {
            body { background-color: white !important; margin: 0; padding: 0; }
            .invoice-wrapper { padding: 0 !important; background-color: white !important; }
            .no-print { display: none !important; }
            .invoice-container { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; padding: 20px !important; }
        }
      `}</style>

      {/* --- Action Buttons (Hidden in Print) --- */}
      <div className="no-print" style={{ maxWidth: '800px', margin: '0 auto 20px', display: 'flex', justifyContent: 'space-between' }}>
          <Link href={route('admin.sales.index')} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fff' }}>
              <Icon name="arrow-left" /> Back to Sales
          </Link>
          <button onClick={handlePrint} className="btn" style={{ background: '#4f46e5', borderColor: '#4f46e5', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="printer" /> Print Invoice
          </button>
      </div>

      {/* --- Invoice Paper --- */}
      <div className="invoice-container" style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>

          {/* Header Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #f1f5f9', paddingBottom: '20px', marginBottom: '30px' }}>
              <div>
                  {/* আপনি চাইলে এখানে <img> ট্যাগ দিয়ে স্কুলের/প্রতিষ্ঠানের লোগো দিতে পারেন */}
                  <h1 style={{ margin: '0 0 5px 0', color: '#0f172a', fontSize: '28px', fontWeight: 'bold' }}>Your School/Company Name</h1>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>123 Education Street, City Name, 1200</p>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Phone: +880 1234 567890 | Email: info@yourschool.com</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                  <h2 style={{ margin: '0 0 10px 0', color: '#16a34a', fontSize: '32px', textTransform: 'uppercase', letterSpacing: '2px' }}>INVOICE</h2>
                  <div style={{ fontSize: '14px', color: '#334155', marginBottom: '3px' }}><strong>Invoice No:</strong> {sale.invoice_number}</div>
                  <div style={{ fontSize: '14px', color: '#334155' }}><strong>Date:</strong> {new Date(sale.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
          </div>

          {/* Customer & Seller Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '6px', width: '48%' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Billed To:</h4>
                  <strong style={{ fontSize: '16px', color: '#0f172a', display: 'block' }}>{sale.customer_name}</strong>
                  {sale.customer_phone && <span style={{ color: '#475569', fontSize: '14px', marginTop: '4px', display: 'block' }}>Phone: {sale.customer_phone}</span>}
              </div>
              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '6px', width: '48%' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Payment Info:</h4>
                  <div style={{ fontSize: '14px', color: '#475569', marginBottom: '4px' }}><strong>Method:</strong> {sale.payment_method}</div>
                  <div style={{ fontSize: '14px', color: '#475569', marginBottom: '4px' }}><strong>Cashier:</strong> {sale.seller?.name || 'Admin'}</div>
                  <div style={{ fontSize: '14px', color: '#475569' }}>
                      <strong>Status:</strong>
                      <span style={{ color: sale.due_amount > 0 ? '#b91c1c' : '#15803d', fontWeight: 'bold', marginLeft: '5px' }}>
                          {sale.due_amount > 0 ? 'Due' : 'Paid'}
                      </span>
                  </div>
              </div>
          </div>

          {/* Itemized Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
              <thead>
                  <tr style={{ background: '#0f172a', color: '#ffffff' }}>
                      <th style={{ padding: '12px 15px', textAlign: 'left', borderRadius: '6px 0 0 6px' }}>#</th>
                      <th style={{ padding: '12px 15px', textAlign: 'left' }}>Item Description</th>
                      <th style={{ padding: '12px 15px', textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '12px 15px', textAlign: 'right' }}>Unit Price</th>
                      <th style={{ padding: '12px 15px', textAlign: 'right', borderRadius: '0 6px 6px 0' }}>Total</th>
                  </tr>
              </thead>
              <tbody>
                  {sale.items?.map((item, index) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '12px 15px', color: '#475569' }}>{index + 1}</td>
                          <td style={{ padding: '12px 15px' }}>
                              <strong style={{ color: '#0f172a', display: 'block' }}>{item.product?.name}</strong>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>
                                  {item.product?.item_code && `Code: ${item.product.item_code}`}
                                  {item.size && ` | Size: ${item.size}`}
                                  {item.color && ` | Color: ${item.color}`}
                              </span>
                          </td>
                          <td style={{ padding: '12px 15px', textAlign: 'center', fontWeight: 'bold', color: '#334155' }}>
                              {item.quantity}
                          </td>
                          <td style={{ padding: '12px 15px', textAlign: 'right', color: '#475569' }}>
                              ৳ {Number(item.unit_price).toFixed(2)}
                          </td>
                          <td style={{ padding: '12px 15px', textAlign: 'right', fontWeight: 'bold', color: '#0f172a' }}>
                              ৳ {Number(item.subtotal).toFixed(2)}
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>

          {/* Summary Section */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '350px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 15px', color: '#475569' }}>
                      <span>Subtotal:</span>
                      <span>৳ {Number(sale.subtotal).toFixed(2)}</span>
                  </div>
                  {sale.discount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 15px', color: '#b91c1c' }}>
                          <span>Discount:</span>
                          <span>- ৳ {Number(sale.discount).toFixed(2)}</span>
                      </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 15px', background: '#f8fafc', borderRadius: '6px', marginTop: '5px', marginBottom: '10px' }}>
                      <strong style={{ fontSize: '18px', color: '#0f172a' }}>Grand Total:</strong>
                      <strong style={{ fontSize: '18px', color: '#16a34a' }}>৳ {Number(sale.total_amount).toFixed(2)}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 15px', color: '#475569' }}>
                      <span>Paid Amount:</span>
                      <strong>৳ {Number(sale.paid_amount).toFixed(2)}</strong>
                  </div>
                  {sale.due_amount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 15px', color: '#b91c1c', borderTop: '1px solid #e2e8f0', marginTop: '5px' }}>
                          <span>Due Amount:</span>
                          <strong>৳ {Number(sale.due_amount).toFixed(2)}</strong>
                      </div>
                  )}
              </div>
          </div>

          {/* Footer Area */}
          <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '2px dashed #cbd5e1', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 5px 0', color: '#0f172a', fontSize: '18px' }}>Thank you for your purchase!</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>If you have any questions about this invoice, please contact our support.</p>

              {/* Signatures (Optional) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', padding: '0 40px' }}>
                  <div style={{ borderTop: '1px solid #94a3b8', width: '150px', paddingTop: '5px', fontSize: '12px', color: '#475569' }}>Customer Signature</div>
                  <div style={{ borderTop: '1px solid #94a3b8', width: '150px', paddingTop: '5px', fontSize: '12px', color: '#475569' }}>Authorized Signature</div>
              </div>
          </div>

      </div>
    </div>
  );
}
