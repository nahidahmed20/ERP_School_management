import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';

export default function Index({ payments, filters }) {
  const [search, setSearch] = useState(filters.search ?? '');

  const applyFilters = () => {
    router.get(route('admin.fees.invoices'), { search }, { preserveState: true });
  };

  const handlePrint = (payment) => {
    // Standard ERP variables (Adjust based on your actual backend relationships)
    const schoolName = "Your School Name Here";
    const schoolAddress = "123 Education Street, City, Country | Phone: +880 1234 567 890";
    const receiptNo = payment.transaction_id || `RCPT-${payment.id}`;
    const studentName = payment.student?.first_name + ' ' + (payment.student?.last_name || '');
    const admissionNo = payment.student?.admission_no || 'N/A';
    const className = payment.student?.class?.name || 'N/A';
    const rollNo = payment.student?.roll_no || 'N/A';
    const feeGroup = payment.fee_assignment?.fee_group?.name || 'General Fee';

    const printContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Money Receipt - ${receiptNo}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .receipt-container {
            max-width: 800px;
            margin: 20px auto;
            padding: 30px;
            border: 1px solid #ccc;
            background: #fff;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #2c3e50;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .school-name {
            font-size: 26px;
            font-weight: bold;
            color: #2c3e50;
            margin: 0;
            text-transform: uppercase;
          }
          .school-address {
            font-size: 13px;
            color: #555;
            margin-top: 5px;
          }
          .receipt-title {
            display: inline-block;
            background: #2c3e50;
            color: #fff;
            padding: 6px 20px;
            font-weight: bold;
            border-radius: 4px;
            margin-top: 15px;
            letter-spacing: 1px;
          }
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
            font-size: 14px;
          }
          .info-box {
            width: 48%;
          }
          .info-table {
            width: 100%;
          }
          .info-table td {
            padding: 4px 0;
          }
          .info-table td:first-child {
            font-weight: bold;
            width: 120px;
          }
          .fee-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 14px;
          }
          .fee-table th, .fee-table td {
            border: 1px solid #ddd;
            padding: 10px 12px;
          }
          .fee-table th {
            background-color: #f8f9fa;
            text-align: left;
            font-weight: bold;
            color: #2c3e50;
          }
          .text-right {
            text-align: right !important;
          }
          .text-center {
            text-align: center !important;
          }
          .totals-wrapper {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 40px;
          }
          .totals-table {
            width: 300px;
            border-collapse: collapse;
            font-size: 14px;
          }
          .totals-table td {
            padding: 6px 10px;
            border-bottom: 1px solid #eee;
          }
          .totals-table tr:last-child td {
            border-bottom: none;
            font-weight: bold;
            font-size: 16px;
            background-color: #f8f9fa;
          }
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 70px;
          }
          .signature-box {
            text-align: center;
          }
          .signature-line {
            border-top: 1px dashed #333;
            width: 180px;
            padding-top: 5px;
            font-size: 14px;
            font-weight: bold;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; }
            .receipt-container { border: none; padding: 0; margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <!-- Header -->
          <div class="header">
            <h1 class="school-name">${schoolName}</h1>
            <div class="school-address">${schoolAddress}</div>
            <div class="receipt-title">MONEY RECEIPT</div>
          </div>

          <!-- Student & Payment Info -->
          <div class="info-section">
            <div class="info-box">
              <table class="info-table">
                <tr><td>Student Name</td><td>: ${studentName}</td></tr>
                <tr><td>Admission No</td><td>: ${admissionNo}</td></tr>
                <tr><td>Class & Roll</td><td>: ${className} (Roll: ${rollNo})</td></tr>
              </table>
            </div>
            <div class="info-box">
              <table class="info-table">
                <tr><td>Receipt No</td><td>: ${receiptNo}</td></tr>
                <tr><td>Date</td><td>: ${payment.payment_date}</td></tr>
                <tr><td>Method</td><td>: ${payment.payment_method}</td></tr>
              </table>
            </div>
          </div>

          <!-- Fee Details Table -->
          <table class="fee-table">
            <thead>
              <tr>
                <th width="10%" class="text-center">Sl</th>
                <th width="50%">Fee Description</th>
                <th width="20%" class="text-center">Month/Year</th>
                <th width="20%" class="text-right">Amount (৳)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-center">1</td>
                <td>${feeGroup}</td>
                <td class="text-center">${new Date(payment.payment_date).toLocaleString('default', { month: 'short', year: 'numeric' })}</td>
                <td class="text-right">${Number(payment.amount_paid).toFixed(2)}</td>
              </tr>
              <!-- You can loop through multiple fee items here if you have payment.items -->
            </tbody>
          </table>

          <!-- Totals -->
          <div class="totals-wrapper">
            <table class="totals-table">
              <tr>
                <td>Sub Total</td>
                <td class="text-right">৳${Number(payment.amount_paid).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Discount / Fine</td>
                <td class="text-right">৳0.00</td>
              </tr>
              <tr>
                <td><strong>Total Paid</strong></td>
                <td class="text-right"><strong>৳${Number(payment.amount_paid).toFixed(2)}</strong></td>
              </tr>
            </table>
          </div>

          <!-- Signatures -->
          <div class="signatures">
            <div class="signature-box">
              <div class="signature-line">Student / Guardian</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">Authorized Signature</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Allow styles to load before printing
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <h1>Invoices & Transactions</h1>
          <p>সকল পেমেন্ট ও লেনদেনের তালিকা এবং মানি রিসিট।</p>
        </div>
      }
    >
      <Head title="Invoices" />

      <div className="card mm-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Search by Admission No or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            style={{
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              width: '300px',
            }}
          />
          <button
            className="btn"
            onClick={applyFilters}
            style={{
              background: '#2c3e50',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Search
          </button>
        </div>
      </div>

      <div className="card mm-card">
        <table className="mm-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '12px' }}>Date</th>
              <th style={{ padding: '12px' }}>Student Info</th>
              <th style={{ padding: '12px' }}>Fee Detail</th>
              <th style={{ padding: '12px' }}>Method</th>
              <th style={{ padding: '12px' }}>Amount</th>
              <th style={{ padding: '12px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.data.map((payment) => (
              <tr key={payment.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{payment.payment_date}</td>
                <td style={{ padding: '12px' }}>
                  <strong>
                    {payment.student?.first_name} {payment.student?.last_name}
                  </strong>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Adm: {payment.student?.admission_no}
                  </div>
                </td>
                <td style={{ padding: '12px' }}>{payment.fee_assignment?.fee_group?.name}</td>
                <td style={{ padding: '12px' }}>{payment.payment_method}</td>
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#16a34a' }}>
                  ৳{payment.amount_paid}
                </td>
                <td style={{ padding: '12px' }}>
                  <button
                    onClick={() => handlePrint(payment)}
                    className="btn btn-outline"
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      background: 'white',
                    }}
                  >
                    <Icon name="printer" /> Print
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ padding: '20px' }}>
          <Pagination meta={payments} />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}