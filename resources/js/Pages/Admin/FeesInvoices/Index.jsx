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
    // সিম্পল প্রিন্ট লজিক (ভবিষ্যতে চাইলে আলাদা PDF পেজ করা যাবে)
    const printContent = `
      <div style="font-family: Arial; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd;">
        <h2 style="text-align: center;">School Management ERP</h2>
        <h4 style="text-align: center;">Money Receipt</h4>
        <hr/>
        <p><strong>Date:</strong> ${payment.payment_date}</p>
        <p><strong>Trx ID:</strong> ${payment.transaction_id || 'N/A'}</p>
        <p><strong>Student:</strong> ${payment.student?.first_name} (${payment.student?.admission_no})</p>
        <p><strong>Fee Group:</strong> ${payment.fee_assignment?.fee_group?.name}</p>
        <p><strong>Method:</strong> ${payment.payment_method}</p>
        <hr/>
        <h3 style="text-align: right;">Amount Paid: ৳${payment.amount_paid}</h3>
      </div>
    `;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <AuthenticatedLayout header={<div className="page-head"><h1>Invoices & Transactions</h1><p>সকল পেমেন্ট ও লেনদেনের তালিকা এবং মানি রিসিট।</p></div>}>
      <Head title="Invoices" />

      <div className="card mm-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="text" placeholder="Search by Admission No or Name..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyFilters()} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', width: '300px' }} />
          <button className="btn" onClick={applyFilters}>Search</button>
        </div>
      </div>

      <div className="card mm-card">
        <table className="mm-table" style={{ width: '100%', textAlign: 'left' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Student Info</th>
              <th>Fee Detail</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.data.map(payment => (
              <tr key={payment.id}>
                <td>{payment.payment_date}</td>
                <td>
                  <strong>{payment.student?.first_name}</strong>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Adm: {payment.student?.admission_no}</div>
                </td>
                <td>{payment.fee_assignment?.fee_group?.name}</td>
                <td>{payment.payment_method}</td>
                <td style={{ fontWeight: 'bold', color: '#16a34a' }}>৳{payment.amount_paid}</td>
                <td>
                  <button onClick={() => handlePrint(payment)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }}>
                    <Icon name="printer" /> Print
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '20px' }}><Pagination meta={payments} /></div>
      </div>
    </AuthenticatedLayout>
  );
}
