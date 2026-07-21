import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

export default function StudentAttendance({ classes, reportData, filters }) {
  const [classId, setClassId] = useState(filters.class_id);
  const [sectionId, setSectionId] = useState(filters.section_id);
  const [month, setMonth] = useState(filters.month);
  const [year, setYear] = useState(filters.year);

  // মাসের নাম বের করার জন্য
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // বছরের লিস্ট জেনারেট করা (যেমন: 2023 থেকে 2026)
  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(5), (val, index) => currentYear - 2 + index);

  const applyFilters = (e) => {
    e.preventDefault();
    if (!classId) return Swal.fire({ icon: 'warning', title: 'Oops', text: 'দয়া করে ক্লাস সিলেক্ট করুন!' });

    router.get(route('admin.reports.student_attendance'), {
      class_id: classId,
      section_id: sectionId,
      month: month,
      year: year
    }, { preserveState: true });
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedClass = classes.find(c => c.id == classId);

  return (
    <AuthenticatedLayout header={<div className="page-head"><h1>Student Attendance Report</h1><p>মাসিক ভিত্তিতে শিক্ষার্থীদের উপস্থিতির সামারি রিপোর্ট।</p></div>}>
      <Head title="Attendance Report" />

      {/* Filters Form (Print এর সময় হাইড থাকবে) */}
      <div className="card mm-card no-print" style={{ padding: '24px', borderRadius: '12px', marginBottom: '24px', borderTop: '4px solid #0f172a' }}>
        <form onSubmit={applyFilters} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Month *</label>
            <select value={month} onChange={e => setMonth(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              {monthNames.map((m, i) => (
                <option key={i} value={String(i + 1).padStart(2, '0')}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Year *</label>
            <select value={year} onChange={e => setYear(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Class *</label>
            <select value={classId} onChange={e => { setClassId(e.target.value); setSectionId(''); }} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <option value="">-- Select --</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Section</label>
            <select value={sectionId} onChange={e => setSectionId(e.target.value)} disabled={!classId} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <option value="">-- All --</option>
              {selectedClass?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn" style={{ flex: 1, padding: '10px', background: '#0f172a', color: '#fff', borderRadius: '6px' }}>View Report</button>
            <button type="button" onClick={handlePrint} className="btn btn-outline" style={{ padding: '10px 16px', borderRadius: '6px' }} title="Print Report"><Icon name="printer" /></button>
          </div>
        </form>
      </div>

      {/* Report View (Printable Area) */}
      {reportData && reportData.length > 0 && (
        <div className="card mm-card printable-area" style={{ padding: '30px', borderRadius: '12px', background: '#fff' }}>
          
          {/* Header for Print */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>Monthly Attendance Summary</h2>
            <p style={{ margin: 0, color: '#64748b' }}>
              Month: <strong>{monthNames[parseInt(month) - 1]}, {year}</strong> <br/>
              Class: <strong>{selectedClass?.name}</strong> {sectionId && `| Section: ${selectedClass.sections.find(s => s.id == sectionId)?.name}`}
            </p>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="mm-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '12px' }}>Roll</th>
                  <th style={{ padding: '12px' }}>Admission No</th>
                  <th style={{ padding: '12px' }}>Student Name</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#16a34a' }}>Present (P)</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#dc2626' }}>Absent (A)</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#d97706' }}>Late (L)</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#2563eb' }}>Half Day</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Total Class</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((data, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{data.roll_no || '--'}</td>
                    <td style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>{data.admission_no}</td>
                    <td style={{ padding: '12px', fontWeight: '600', color: '#0f172a' }}>{data.name}</td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#16a34a', background: data.total_present > 0 ? '#f0fdf4' : 'transparent' }}>
                      {data.total_present}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#dc2626', background: data.total_absent > 0 ? '#fef2f2' : 'transparent' }}>
                      {data.total_absent}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#d97706' }}>{data.total_late}</td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#2563eb' }}>{data.total_half_day}</td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', background: '#f8fafc' }}>{data.total_working_days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Print CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; border: none !important; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </AuthenticatedLayout>
  );
}