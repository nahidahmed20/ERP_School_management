import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';

export default function DueFees({ dueAssignments, totalDue, classes, filters }) {
  const [classId, setClassId] = useState(filters.class_id || '');
  const [sectionId, setSectionId] = useState(filters.section_id || '');
  const [dateUntil, setDateUntil] = useState(filters.date_until || '');

  const applyFilters = (e) => {
    e.preventDefault();
    router.get(route('admin.reports.due_fees'), {
      class_id: classId,
      section_id: sectionId,
      date_until: dateUntil
    }, { preserveState: true });
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedClass = classes.find(c => c.id == classId);

  return (
    <AuthenticatedLayout header={<div className="page-head"><h1>Due Fees Report</h1><p style={{ color: '#64748b', marginTop: '4px' }}>নির্দিষ্ট তারিখ পর্যন্ত শিক্ষার্থীদের বকেয়া ফি এর তালিকা।</p></div>}>
      <Head title="Due Fees Report" />

      {/* Filters (Print করার সময় হাইড হয়ে যাবে) */}
      <div className="card mm-card no-print" style={{ padding: '24px', borderRadius: '12px', marginBottom: '24px', borderTop: '4px solid #ef4444', background: '#fff' }}>
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: '600' }}>
          <Icon name="filter" style={{ width: '18px', height: '18px' }} />
          <span>Filter Report</span>
        </div>
        
        <form onSubmit={applyFilters} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Class</label>
            <select className="custom-input" value={classId} onChange={e => { setClassId(e.target.value); setSectionId(''); }} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155' }}>
              <option value="">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Section (Optional)</label>
            <select className="custom-input" value={sectionId} onChange={e => setSectionId(e.target.value)} disabled={!classId} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: classId ? '#f8fafc' : '#f1f5f9', color: '#334155', cursor: !classId ? 'not-allowed' : 'pointer' }}>
              <option value="">All Sections</option>
              {selectedClass?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Due Date Until</label>
            <input className="custom-input" type="date" value={dateUntil} onChange={e => setDateUntil(e.target.value)} required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155' }} />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn action-btn" style={{ flex: 1, padding: '10px 16px', background: '#0f172a', color: '#fff', borderRadius: '8px', fontWeight: '600', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Icon name="search" style={{ width: '16px', height: '16px' }} /> Generate
            </button>
            <button type="button" onClick={handlePrint} className="btn btn-outline print-btn" style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Print Report">
              <Icon name="printer" />
            </button>
          </div>
        </form>
      </div>

      {/* Report Content (Printable Area) */}
      <div className="card mm-card printable-area" style={{ padding: '32px', borderRadius: '12px', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        
        {/* Print Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '24px' }}>Due Fees Report <span style={{ color: '#64748b', fontSize: '18px', fontWeight: 'normal' }}>(বকেয়া তালিকা)</span></h2>
          <div style={{ display: 'inline-flex', gap: '16px', background: '#f8fafc', padding: '8px 16px', borderRadius: '24px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#475569' }}>
            <span>Calculated Until: <strong style={{ color: '#0f172a' }}>{dateUntil || 'N/A'}</strong></span>
            <span style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: '16px' }}>
              Class: <strong style={{ color: '#0f172a' }}>{classId ? classes.find(c => c.id == classId)?.name : 'All Classes'}</strong>
              {sectionId && ` | Section: ${selectedClass?.sections?.find(s => s.id == sectionId)?.name}`}
            </span>
          </div>
        </div>

        {/* Total Summary */}
        <div className="summary-box" style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)', border: '1px solid #fecaca', padding: '24px', borderRadius: '12px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
              <Icon name="wallet" />
            </div>
            <div>
              <span style={{ fontSize: '13px', color: '#dc2626', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Pending Amount</span>
              <div style={{ fontSize: '14px', color: '#991b1b', marginTop: '2px' }}>মোট বকেয়া টাকার পরিমাণ</div>
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="tk">৳</span>{Number(totalDue).toLocaleString()}
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <table className="mm-table custom-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
            <thead>
              <tr>
                <th style={{ padding: '16px', width: '50px', textAlign: 'center' }}>SL</th>
                <th style={{ padding: '16px' }}>Student Info</th>
                <th style={{ padding: '16px' }}>Guardian Contact</th>
                <th style={{ padding: '16px' }}>Fee Group</th>
                <th style={{ padding: '16px', textAlign: 'center' }}>Due Date</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Due Amount</th>
              </tr>
            </thead>
            <tbody>
              {dueAssignments.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', background: '#ecfdf5', color: '#059669', padding: '12px 24px', borderRadius: '30px', fontWeight: '600', fontSize: '15px' }}>
                      🎉 এই ফিল্টারে কোনো শিক্ষার্থীর বকেয়া নেই!
                    </div>
                  </td>
                </tr>
              ) : (
                dueAssignments.map((assignment, index) => (
                  <tr key={assignment.id}>
                    <td style={{ padding: '16px', color: '#64748b', textAlign: 'center', fontWeight: '500' }}>
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>
                        {assignment.student?.first_name} {assignment.student?.last_name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>
                          Class {assignment.student?.current_enrollment?.school_class?.name} 
                          {assignment.student?.current_enrollment?.section && ` (${assignment.student?.current_enrollment?.section?.name})`}
                        </span>
                        <span>Roll: <strong style={{color: '#475569'}}>{assignment.student?.current_enrollment?.roll_no || '--'}</strong></span>
                        <span style={{ color: '#cbd5e1' }}>|</span>
                        <span>Adm: <strong style={{color: '#475569'}}>{assignment.student?.admission_no || '--'}</strong></span>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '600', color: '#334155', fontSize: '14px' }}>
                        {assignment.student?.guardian?.father_name || 'N/A'}
                      </div>
                      <div style={{ color: '#0284c7', fontSize: '13px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Icon name="phone" style={{ width: '12px', height: '12px' }}/> {assignment.student?.guardian?.father_phone || '--'}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                        {assignment.fee_group?.name}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{ color: '#ef4444', fontSize: '13px', fontWeight: '600', background: '#fef2f2', padding: '4px 10px', borderRadius: '6px' }}>
                        {assignment.due_date}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold', color: '#dc2626', fontSize: '16px' }}>
                      <span className="tk">৳</span>{Number(assignment.due_amount).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Styles & Print CSS */}
      <style>{`
        /* টাকা সিম্বল ফিক্স (কোনোভাবেই বাঁকা হবে না) */
        .tk {
          font-family: 'SolaimanLipi', 'Noto Sans Bengali', Arial, sans-serif !important;
          font-style: normal !important;
          font-weight: 500 !important;
          display: inline-block;
          margin-right: 2px;
          line-height: 1;
        }

        /* কাস্টম ইনপুট ফোকাস ইফেক্ট */
        .custom-input:focus {
          outline: none;
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
        }

        /* বাটন হোভার ইফেক্ট */
        .action-btn:hover { background: #1e293b !important; transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .action-btn:active { transform: translateY(0); }
        .print-btn:hover { background: #f8fafc !important; border-color: #94a3b8 !important; }

        /* টেবিল স্টাইল */
        .custom-table th {
          background: #f8fafc;
          border-bottom: 2px solid #e2e8f0;
          color: #475569;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .custom-table tbody tr {
          border-bottom: 1px solid #f1f5f9;
          transition: background-color 0.2s ease;
        }
        .custom-table tbody tr:hover {
          background-color: #f8fafc;
        }
        .custom-table tbody tr:last-child {
          border-bottom: none;
        }

        /* প্রিন্ট অপশন */
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; border: none !important; box-shadow: none !important; }
          .no-print { display: none !important; }
          .summary-box { border: 1px solid #000 !important; background: transparent !important; }
        }
      `}</style>
    </AuthenticatedLayout>
  );
}