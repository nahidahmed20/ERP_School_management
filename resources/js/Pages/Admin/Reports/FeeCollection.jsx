import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';

export default function FeeCollection({ payments, totalCollection, classes, filters }) {
  const [startDate, setStartDate] = useState(filters.start_date || '');
  const [endDate, setEndDate] = useState(filters.end_date || '');
  const [classId, setClassId] = useState(filters.class_id || '');

  const applyFilters = (e) => {
    e.preventDefault();
    router.get(route('admin.reports.fees'), {
      start_date: startDate,
      end_date: endDate,
      class_id: classId
    }, { preserveState: true });
  };

  const handlePrint = () => {
    window.print();
  };

  const Taka = () => (
    <span style={{ fontFamily: '"Inter", "Roboto", "Segoe UI", Arial, sans-serif', fontStyle: 'normal', marginRight: '2px' }}>
      ৳
    </span>
  );

  return (
    <AuthenticatedLayout 
      header={
        <div className="page-head">
          <div>
            <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Reports</span>
            <h1 style={{ margin: '4px 0 0 0', color: '#0f172a', fontSize: '24px' }}>Fee Collection Report</h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '15px' }}>তারিখ এবং ক্লাস অনুযায়ী ফি কালেকশনের বিস্তারিত রিপোর্ট।</p>
          </div>
        </div>
      }
    >
      <Head title="Fee Collection Report" />

      {/* --- Filter Section --- */}
      <div className="card mm-card no-print" style={{ background: '#fff', padding: '24px', borderRadius: '16px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #f1f5f9' }}>
        <form onSubmit={applyFilters} style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end' }}>
          
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>
              <Icon name="calendar" style={{ width: '16px', color: '#94a3b8' }} /> Start Date
            </label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', transition: 'border 0.2s', fontSize: '15px' }} />
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>
              <Icon name="calendar" style={{ width: '16px', color: '#94a3b8' }} /> End Date
            </label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', transition: 'border 0.2s', fontSize: '15px' }} />
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>
              <Icon name="users" style={{ width: '16px', color: '#94a3b8' }} /> Class (Optional)
            </label>
            <select value={classId} onChange={e => setClassId(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', fontSize: '15px', color: '#0f172a' }}>
              <option value="">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', flex: '1 1 250px' }}>
            <button type="submit" className="btn" style={{ flex: 2, padding: '12px', background: '#4f46e5', color: '#fff', borderRadius: '8px', fontWeight: '600', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)' }}>
              Generate Report
            </button>
            <button type="button" onClick={handlePrint} className="btn" style={{ flex: 1, padding: '12px', background: '#fff', color: '#334155', borderRadius: '8px', fontWeight: '600', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Icon name="printer" style={{ width: '18px' }} /> Print
            </button>
          </div>
        </form>
      </div>

      {/* --- Report Content Area --- */}
      <div className="card mm-card printable-area" style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
        
        <div style={{ padding: '32px' }}>
          {/* Report Header (Visible mainly on print) */}
          <div style={{ textAlign: 'center', marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px dashed #e2e8f0' }}>
            <h2 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '28px', fontWeight: '700' }}>Fee Collection Report</h2>
            <div style={{ display: 'inline-flex', gap: '16px', color: '#64748b', fontSize: '15px', background: '#f8fafc', padding: '8px 16px', borderRadius: '20px' }}>
              <span><strong>Period:</strong> {startDate || 'N/A'} to {endDate || 'N/A'}</span>
              <span>&bull;</span>
              <span><strong>Class:</strong> {classId ? classes.find(c => c.id == classId)?.name : 'All Classes'}</span>
            </div>
          </div>

          {/* Premium Summary Widget */}
          <div className="summary-widget" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '12px', padding: '24px 32px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)' }}>
            <div>
              <div style={{ fontSize: '15px', opacity: 0.9, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Collection Amount</div>
              <div style={{ fontSize: '36px', fontWeight: '800', lineHeight: 1 }}>
                <Taka />{Number(totalCollection).toLocaleString()}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '50%' }}>
              <Icon name="currency-dollar" style={{ width: '32px', height: '32px', color: '#fff' }} />
            </div>
          </div>

          {/* Data Table */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Date & Trx ID</th>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Student Info</th>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0' }}>Fee Type</th>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Amount Paid</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}>
                      <Icon name="document-search" style={{ width: '48px', margin: '0 auto 12px auto', opacity: 0.5 }} />
                      <p style={{ fontSize: '16px', margin: 0 }}>এই নির্দিষ্ট ফিল্টারে কোনো ডাটা পাওয়া যায়নি।</p>
                    </td>
                  </tr>
                ) : (
                  payments.map((payment, index) => (
                    <tr key={payment.id} style={{ background: index % 2 === 0 ? '#ffffff' : '#fcfcfc', transition: 'background 0.2s' }}>
                      <td style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{payment.payment_date}</div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Trx: {payment.transaction_id || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{payment.student?.first_name}</div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                          Adm: {payment.student?.admission_no} &bull; Class: {payment.student?.current_enrollment?.school_class?.name}
                        </div>
                      </td>
                      <td style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ background: '#e0e7ff', color: '#4f46e5', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                          {payment.fee_assignment?.fee_group?.name}
                        </span>
                      </td>
                      <td style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', fontWeight: '700', color: '#15803d', fontSize: '16px' }}>
                        <Taka />{Number(payment.amount_paid).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- Print CSS & Global Styles --- */}
      <style>{`
        @media print {
          body { background: #fff !important; }
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            margin: 0 !important; 
            padding: 0 !important; 
            box-shadow: none !important; 
            border: none !important; 
          }
          .no-print { display: none !important; }
          
          /* Adjust summary card for print to save ink */
          .summary-widget {
            background: #fff !important;
            color: #000 !important;
            border: 2px solid #000 !important;
            box-shadow: none !important;
          }
          .summary-widget * { color: #000 !important; }
          .summary-widget svg { display: none; }
          
          /* Force table borders for print */
          table th, table td { border-bottom: 1px solid #ccc !important; }
        }
      `}</style>
    </AuthenticatedLayout>
  );
}