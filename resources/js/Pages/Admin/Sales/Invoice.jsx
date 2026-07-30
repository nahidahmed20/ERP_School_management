import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function Invoice({ sale }) {

  // পেজ লোড হওয়ার পর অটোমেটিক প্রিন্ট ডায়লগ ওপেন করতে চাইলে নিচের লাইনটি আনকমেন্ট করতে পারেন
  // useEffect(() => { window.print(); }, []);

  const handlePrint = () => {
      window.print();
  };

  const isDue = sale.due_amount > 0;

  // Barcode pattern derived from the actual invoice number, so every invoice's
  // "code" is genuinely its own — not a random decoration.
  const code = String(sale.invoice_number || 'INVOICE');
  const barcodeWidths = Array.from(code).map(ch => (ch.charCodeAt(0) % 4) + 1);
  const Barcode = ({ tone = 'dark' }) => (
    <span className={`barcode-mark ${tone === 'light' ? 'barcode-mark--light' : ''}`} aria-hidden="true">
      {barcodeWidths.map((w, i) => <span key={i} style={{ width: `${w}px` }} />)}
    </span>
  );

  return (
    <div className="invoice-wrapper">
      <Head title={`Invoice - ${sale.invoice_number}`} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');

        .invoice-wrapper {
          --paper: #FBFBF8;
          --page-bg: #ECEEE6;
          --ink: #1E2A22;
          --ink-soft: #445044;
          --muted: #77806F;
          --accent: #E2984A;
          --accent-dark: #B96F1F;
          --stamp-red: #BE4438;
          --stamp-green: #2C6E4E;
          --line: #DBD9CB;
          background: var(--page-bg);
          min-height: 100vh;
          padding: 40px 20px;
          font-family: 'Inter', system-ui, sans-serif;
          color: var(--ink);
        }

        .no-print { max-width: 800px; margin: 0 auto 20px; display: flex; justify-content: space-between; align-items: center; }
        .ghost-link {
          display: inline-flex; align-items: center; gap: 7px;
          color: var(--muted); font-size: 14px; font-weight: 600; text-decoration: none;
          border: 1px solid var(--line); background: var(--paper);
          padding: 10px 16px; border-radius: 6px; transition: all 0.15s ease;
        }
        .ghost-link:hover { color: var(--ink); border-color: var(--accent-dark); }
        .print-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--ink); color: var(--accent); border: none;
          font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 13.5px;
          letter-spacing: 0.03em; text-transform: uppercase;
          padding: 11px 20px; border-radius: 6px; cursor: pointer; transition: all 0.15s ease;
        }
        .print-btn:hover { background: #14201A; transform: translateY(-1px); }

        .receipt-tear {
          max-width: 800px; margin: 0 auto; height: 12px;
          background:
            linear-gradient(135deg, var(--paper) 25%, transparent 25.5%) 0 0 / 14px 14px repeat-x,
            linear-gradient(225deg, var(--paper) 25%, transparent 25.5%) 0 0 / 14px 14px repeat-x;
        }
        .receipt-tear-bottom { transform: rotate(180deg); }

        .invoice-paper {
          max-width: 800px; margin: 0 auto; background: var(--paper);
          padding: 44px 44px 36px; position: relative; overflow: hidden;
          border-left: 1px solid var(--line); border-right: 1px solid var(--line);
        }

        .barcode-mark { display: inline-flex; align-items: flex-end; gap: 2px; height: 16px; }
        .barcode-mark span { display: block; height: 100%; background: var(--ink); }

        .status-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 10.5px;
          text-transform: uppercase; letter-spacing: 0.1em;
          padding: 4px 10px; border-radius: 999px;
          border: 1px solid var(--stamp-red); color: var(--stamp-red); background: rgba(190,68,56,0.07);
          -webkit-print-color-adjust: exact; print-color-adjust: exact;
        }
        .status-badge.paid { border-color: var(--stamp-green); color: var(--stamp-green); background: rgba(44,110,78,0.07); }

        .inv-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px dashed var(--line); padding-bottom: 22px; margin-bottom: 28px; }
        .inv-company { margin: 0 0 6px 0; color: var(--ink); font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 700; }
        .inv-address { margin: 0; color: var(--muted); font-size: 13px; line-height: 1.6; }
        .inv-eyebrow { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); display: flex; align-items: center; gap: 8px; justify-content: flex-end; margin-bottom: 8px; }
        .inv-number { font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: 700; color: var(--ink); text-align: right; }
        .inv-date { font-family: 'JetBrains Mono', monospace; font-size: 12.5px; color: var(--muted); text-align: right; margin-top: 4px; }

        .stub-row { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 28px; }
        .stub-card { border: 1px dashed var(--line); border-radius: 6px; padding: 16px 18px; width: 100%; }
        .stub-label { margin: 0 0 8px 0; color: var(--muted); font-family: 'Space Grotesk', sans-serif; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.12em; }
        .stub-name { font-size: 15px; color: var(--ink); font-weight: 700; display: block; }
        .stub-line { color: var(--ink-soft); font-size: 13px; margin-top: 5px; display: block; }
        .status-paid { color: var(--stamp-green); font-weight: 700; }
        .status-due { color: var(--stamp-red); font-weight: 700; }

        .inv-table { width: 100%; border-collapse: collapse; margin-bottom: 26px; }
        .inv-table thead tr { background: var(--ink); color: var(--paper); }
        .inv-table th { padding: 11px 14px; text-align: left; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
        .inv-table td { padding: 13px 14px; border-bottom: 1px dashed var(--line); vertical-align: top; }
        .inv-table tbody tr:last-child td { border-bottom: none; }
        .inv-item-name { color: var(--ink); font-weight: 700; font-size: 14px; display: block; }
        .inv-item-meta { font-size: 11.5px; color: var(--muted); font-family: 'JetBrains Mono', monospace; }
        .num-cell { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }

        .inv-summary { display: flex; justify-content: flex-end; }
        .inv-summary-box { width: 340px; }
        .sum-row { display: flex; justify-content: space-between; padding: 7px 4px; color: var(--ink-soft); font-size: 14px; }
        .sum-row .num-cell { color: var(--ink-soft); font-weight: 600; }
        .sum-row.discount { color: var(--stamp-red); }
        .sum-row.discount .num-cell { color: var(--stamp-red); }

        .grand-total {
          display: flex; justify-content: space-between; align-items: center;
          background: var(--ink); border-radius: 6px; padding: 15px 18px; margin: 8px 0 12px;
          -webkit-print-color-adjust: exact; print-color-adjust: exact;
        }
        .grand-total-label { font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #9AA592; }
        .grand-total-value { font-family: 'JetBrains Mono', monospace; font-size: 22px; font-weight: 700; color: var(--accent); }

        .sum-row.due { border-top: 1px dashed var(--line); margin-top: 6px; padding-top: 12px; color: var(--stamp-red); font-weight: 700; }
        .sum-row.due .num-cell { color: var(--stamp-red); }

        .inv-footer { margin-top: 44px; padding-top: 20px; border-top: 1px dashed var(--line); text-align: center; }
        .inv-thanks { margin: 0 0 6px 0; color: var(--ink); font-family: 'Space Grotesk', sans-serif; font-size: 17px; font-weight: 700; }
        .inv-note { margin: 0; color: var(--muted); font-size: 13px; }
        .inv-signrow { display: flex; justify-content: space-between; margin-top: 56px; padding: 0 30px; }
        .inv-sign { border-top: 1px dotted var(--line); width: 160px; padding-top: 6px; font-size: 11.5px; color: var(--muted); font-family: 'JetBrains Mono', monospace; text-align: center; }

        @media print {
          body { background: white !important; margin: 0; padding: 0; }
          .invoice-wrapper { padding: 0 !important; background: white !important; }
          .no-print, .receipt-tear { display: none !important; }
          .invoice-paper { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; border: none !important; padding: 20px !important; }
          .inv-table thead tr { background: white !important; color: var(--ink) !important; border-bottom: 2px solid var(--ink) !important; }
          .grand-total { background: white !important; border: 2px solid var(--ink) !important; }
          .grand-total-value { color: var(--ink) !important; }
          .grand-total-label { color: var(--muted) !important; }
        }
      `}</style>

      {/* --- Action Buttons (Hidden in Print) --- */}
      <div className="no-print">
          <Link href={route('admin.sales.index')} className="ghost-link">
              <Icon name="arrow-left" style={{ fontSize: '13px' }} /> Back to Sales
          </Link>
          <button onClick={handlePrint} className="print-btn">
              <Icon name="printer" style={{ fontSize: '16px' }} /> Print Invoice
          </button>
      </div>

      <div className="receipt-tear" />

      {/* --- Invoice Paper --- */}
      <div className="invoice-paper">

          {/* Header Section */}
          <div className="inv-header">
              <div>
                  {/* আপনি চাইলে এখানে <img> ট্যাগ দিয়ে স্কুলের/প্রতিষ্ঠানের লোগো দিতে পারেন */}
                  <h1 className="inv-company">Your School/Company Name</h1>
                  <p className="inv-address">123 Education Street, City Name, 1200</p>
                  <p className="inv-address">Phone: +880 1234 567890 &nbsp;·&nbsp; Email: info@yourschool.com</p>
              </div>
              <div>
                  <div className="inv-eyebrow"><Icon name="receipt" style={{ fontSize: '13px' }} /> Invoice</div>
                  <Barcode />
                  <div className="inv-number" style={{ marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      {sale.invoice_number}
                      <span className={`status-badge ${!isDue ? 'paid' : ''}`}>
                          <Icon name={isDue ? 'alert-circle' : 'check-circle'} style={{ fontSize: '11px' }} />
                          {isDue ? 'Due' : 'Paid'}
                      </span>
                  </div>
                  <div className="inv-date">
                      {new Date(sale.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
              </div>
          </div>

          {/* Customer & Seller Info */}
          <div className="stub-row">
              <div className="stub-card">
                  <h4 className="stub-label">Billed To</h4>
                  <strong className="stub-name">{sale.customer_name}</strong>
                  {sale.customer_phone && <span className="stub-line">Phone: {sale.customer_phone}</span>}
              </div>
              <div className="stub-card">
                  <h4 className="stub-label">Payment Info</h4>
                  <span className="stub-line" style={{ marginTop: 0 }}><strong>Method:</strong> {sale.payment_method}</span>
                  <span className="stub-line"><strong>Cashier:</strong> {sale.seller?.name || 'Admin'}</span>
                  <span className="stub-line">
                      <strong>Status:</strong>{' '}
                      <span className={isDue ? 'status-due' : 'status-paid'}>{isDue ? 'Due' : 'Paid'}</span>
                  </span>
              </div>
          </div>

          {/* Itemized Table */}
          <table className="inv-table">
              <thead>
                  <tr>
                      <th style={{ width: '6%' }}>#</th>
                      <th style={{ width: '44%' }}>Item Description</th>
                      <th style={{ width: '12%', textAlign: 'center' }}>Qty</th>
                      <th style={{ width: '18%', textAlign: 'right' }}>Unit Price</th>
                      <th style={{ width: '20%', textAlign: 'right' }}>Total</th>
                  </tr>
              </thead>
              <tbody>
                  {sale.items?.map((item, index) => (
                      <tr key={item.id}>
                          <td className="num-cell" style={{ color: 'var(--muted)' }}>{index + 1}</td>
                          <td>
                              <span className="inv-item-name">{item.product?.name}</span>
                              <span className="inv-item-meta">
                                  {item.product?.item_code && `Code: ${item.product.item_code}`}
                                  {item.size && ` · Size: ${item.size}`}
                                  {item.color && ` · Color: ${item.color}`}
                              </span>
                          </td>
                          <td className="num-cell" style={{ textAlign: 'center', fontWeight: 700 }}>{item.quantity}</td>
                          <td className="num-cell" style={{ textAlign: 'right' }}>৳ {Number(item.unit_price).toFixed(2)}</td>
                          <td className="num-cell" style={{ textAlign: 'right', fontWeight: 700 }}>৳ {Number(item.subtotal).toFixed(2)}</td>
                      </tr>
                  ))}
              </tbody>
          </table>

          {/* Summary Section */}
          <div className="inv-summary">
              <div className="inv-summary-box">
                  <div className="sum-row">
                      <span>Subtotal</span>
                      <span className="num-cell">৳ {Number(sale.subtotal).toFixed(2)}</span>
                  </div>
                  {sale.discount > 0 && (
                      <div className="sum-row discount">
                          <span>Discount</span>
                          <span className="num-cell">− ৳ {Number(sale.discount).toFixed(2)}</span>
                      </div>
                  )}

                  <div className="grand-total">
                      <span className="grand-total-label">Grand Total</span>
                      <span className="grand-total-value">৳ {Number(sale.total_amount).toFixed(2)}</span>
                  </div>

                  <div className="sum-row">
                      <span>Paid Amount</span>
                      <span className="num-cell">৳ {Number(sale.paid_amount).toFixed(2)}</span>
                  </div>
                  {isDue && (
                      <div className="sum-row due">
                          <span>Due Amount</span>
                          <span className="num-cell">৳ {Number(sale.due_amount).toFixed(2)}</span>
                      </div>
                  )}
              </div>
          </div>

          {/* Footer Area */}
          <div className="inv-footer">
              <h3 className="inv-thanks">Thank you for your purchase!</h3>
              <p className="inv-note">If you have any questions about this invoice, please contact our support.</p>

              <div className="inv-signrow">
                  <div className="inv-sign">Customer Signature</div>
                  <div className="inv-sign">Authorized Signature</div>
              </div>
          </div>

      </div>

      <div className="receipt-tear receipt-tear-bottom" />
    </div>
  );
}