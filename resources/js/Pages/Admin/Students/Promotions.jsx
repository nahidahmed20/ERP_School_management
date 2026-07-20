import { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

export default function Promotions({ sessions, classes, students, filters }) {
  const { flash } = usePage().props;

  // Search Filters
  const [currentSession, setCurrentSession] = useState(filters.current_session_id ?? '');
  const [currentClass, setCurrentClass] = useState(filters.current_class_id ?? '');
  const [currentSection, setCurrentSection] = useState(filters.current_section_id ?? '');

  // Fetch Students Form
  const fetchStudents = () => {
    if (!currentSession || !currentClass || !currentSection) {
      Swal.fire({ icon: 'warning', title: 'Oops...', text: 'দয়া করে বর্তমান সেশন, ক্লাস এবং সেকশন সিলেক্ট করুন!' });
      return;
    }
    router.get(route('admin.students.promotions'), {
      current_session_id: currentSession,
      current_class_id: currentClass,
      current_section_id: currentSection,
    }, { preserveState: true });
  };

  // Promotion Form (Submit to next class)
  const { data, setData, post, processing } = useForm({
    next_session_id: '',
    next_class_id: '',
    next_section_id: '',
    students: students || []
  });

  useEffect(() => {
    setData('students', students || []);
  }, [students]);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000 });
  }, [flash]);

  const handleStatusChange = (index, status) => {
    const updatedStudents = [...data.students];
    updatedStudents[index].promote_status = status;
    setData('students', updatedStudents);
  };

  const handlePromotionSubmit = (e) => {
    e.preventDefault();
    if (!data.next_session_id || !data.next_class_id || !data.next_section_id) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'পরবর্তী সেশন, ক্লাস এবং সেকশন সিলেক্ট করা বাধ্যতামূলক!' });
      return;
    }
    post(route('admin.students.promotions.store'), {
      data: {
        ...data,
        current_class_id: currentClass,
        current_section_id: currentSection
      }
    });
  };

  const selectedCurrentClass = classes.find(c => c.id == currentClass);
  const selectedNextClass = classes.find(c => c.id == data.next_class_id);

  // Reusable styles for inputs
  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: '8px',
    border: '1px solid #e2e8f0', backgroundColor: '#f8fafc',
    fontSize: '14px', color: '#334155', outline: 'none',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', transition: 'all 0.2s ease'
  };

  const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow" style={{ color: '#4f46e5', fontWeight: '700' }}>Academics</span>
            <h1 style={{ color: '#0f172a', marginTop: '4px' }}>Student Promotions</h1>
            <p className="desc" style={{ color: '#64748b' }}>শিক্ষার্থীদের নতুন শিক্ষাবর্ষ ও ক্লাসে উন্নীত (Promote) করুন।</p>
          </div>
        </div>
      }
    >
      <Head title="Student Promotions" />

      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>

        {/* Step 1: Filter/Fetch Students */}
        <div className="card mm-card" style={{ background: '#ffffff', padding: '28px', borderRadius: '16px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <span style={{ background: '#f1f5f9', color: '#475569', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold', fontSize: '14px' }}>1</span>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b', fontWeight: '700' }}>বর্তমান ক্লাসের তথ্য (Current Class)</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', alignItems: 'end' }}>
            <div>
              <label style={labelStyle}>Current Session <span style={{ color: '#ef4444' }}>*</span></label>
              <select value={currentSession} onChange={e => setCurrentSession(e.target.value)} style={inputStyle}>
                <option value="">-- Select Session --</option>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Current Class <span style={{ color: '#ef4444' }}>*</span></label>
              <select value={currentClass} onChange={e => { setCurrentClass(e.target.value); setCurrentSection(''); }} style={inputStyle}>
                <option value="">-- Select Class --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Current Section <span style={{ color: '#ef4444' }}>*</span></label>
              <select value={currentSection} onChange={e => setCurrentSection(e.target.value)} disabled={!currentClass} style={{ ...inputStyle, opacity: !currentClass ? 0.6 : 1 }}>
                <option value="">-- Select Section --</option>
                {selectedCurrentClass?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <button className="btn" onClick={fetchStudents} style={{ padding: '12px 24px', background: '#0f172a', color: '#fff', borderRadius: '8px', fontWeight: '600', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.2)' }}>
              Fetch Students
            </button>
          </div>
        </div>

        {/* Step 2: Display Students & Select Next Class */}
        {students && students.length > 0 && (
          <form onSubmit={handlePromotionSubmit}>

            {/* Setup Next Class */}
            <div className="card mm-card" style={{ background: '#f8fafc', padding: '28px', borderRadius: '16px', marginBottom: '24px', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#4f46e5' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <span style={{ background: '#e0e7ff', color: '#4f46e5', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold', fontSize: '14px' }}>2</span>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#312e81', fontWeight: '700' }}>প্রমোশন সেটআপ (Promote To)</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>Next Session <span style={{ color: '#ef4444' }}>*</span></label>
                  <select value={data.next_session_id} onChange={e => setData('next_session_id', e.target.value)} required style={{...inputStyle, background: '#fff', borderColor: '#c7d2fe'}}>
                    <option value="">-- Select Next Session --</option>
                    {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Next Class <span style={{ color: '#ef4444' }}>*</span></label>
                  <select value={data.next_class_id} onChange={e => { setData('next_class_id', e.target.value); setData('next_section_id', ''); }} required style={{...inputStyle, background: '#fff', borderColor: '#c7d2fe'}}>
                    <option value="">-- Select Next Class --</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Next Section <span style={{ color: '#ef4444' }}>*</span></label>
                  <select value={data.next_section_id} onChange={e => setData('next_section_id', e.target.value)} required disabled={!data.next_class_id} style={{...inputStyle, background: '#fff', borderColor: '#c7d2fe', opacity: !data.next_class_id ? 0.6 : 1}}>
                    <option value="">-- Select Next Section --</option>
                    {selectedNextClass?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Student List Table */}
            <div className="card mm-card" style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9' }}>
              <div className="mm-table-wrap" style={{ overflowX: 'auto' }}>
                <table className="mm-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <tr>
                      <th style={{ padding: '16px 20px', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Admission No</th>
                      <th style={{ padding: '16px 20px', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Student Name</th>
                      <th style={{ padding: '16px 20px', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Roll</th>
                      <th style={{ padding: '16px 20px', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Promotion Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.students.map((student, index) => (
                      <tr key={student.student_id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontWeight: '600', color: '#334155', fontSize: '13px' }}>
                            {student.admission_no}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', fontWeight: '600', color: '#1e293b' }}>{student.name}</td>
                        <td style={{ padding: '16px 20px', color: '#64748b' }}>{student.roll_no || 'N/A'}</td>
                        <td style={{ padding: '16px 20px' }}>

                          {/* Beautiful Radio Badges */}
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <label style={{
                              display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', border: '1px solid',
                              background: student.promote_status === 'promote' ? '#dcfce7' : '#fff',
                              color: student.promote_status === 'promote' ? '#166534' : '#64748b',
                              borderColor: student.promote_status === 'promote' ? '#bbf7d0' : '#cbd5e1'
                            }}>
                              <input type="radio" name={`status-${student.student_id}`} checked={student.promote_status === 'promote'} onChange={() => handleStatusChange(index, 'promote')} style={{ margin: 0, accentColor: '#16a34a' }} /> Promote
                            </label>

                            <label style={{
                              display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', border: '1px solid',
                              background: student.promote_status === 'retain' ? '#fef3c7' : '#fff',
                              color: student.promote_status === 'retain' ? '#b45309' : '#64748b',
                              borderColor: student.promote_status === 'retain' ? '#fde68a' : '#cbd5e1'
                            }}>
                              <input type="radio" name={`status-${student.student_id}`} checked={student.promote_status === 'retain'} onChange={() => handleStatusChange(index, 'retain')} style={{ margin: 0, accentColor: '#d97706' }} /> Retain
                            </label>

                            <label style={{
                              display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', border: '1px solid',
                              background: student.promote_status === 'leave' ? '#fee2e2' : '#fff',
                              color: student.promote_status === 'leave' ? '#b91c1c' : '#64748b',
                              borderColor: student.promote_status === 'leave' ? '#fecaca' : '#cbd5e1'
                            }}>
                              <input type="radio" name={`status-${student.student_id}`} checked={student.promote_status === 'leave'} onChange={() => handleStatusChange(index, 'leave')} style={{ margin: 0, accentColor: '#dc2626' }} /> Leave
                            </label>
                          </div>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Submit Button Area */}
              <div style={{ padding: '24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={processing} className="btn" style={{
                  padding: '14px 32px', background: processing ? '#818cf8' : '#4f46e5', color: '#fff', borderRadius: '10px',
                  fontWeight: '600', fontSize: '15px', border: 'none', cursor: processing ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)'
                }}>
                  {processing ? 'Processing...' : 'Save Promotions'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Empty State (Beautiful Error Box) */}
        {filters.current_session_id && students && students.length === 0 && (
          <div style={{ background: '#fff', border: '1px dashed #cbd5e1', padding: '48px 24px', textAlign: 'center', borderRadius: '16px', color: '#475569' }}>
            <div style={{ width: '64px', height: '64px', background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon name="warning" style={{ fontSize: '28px', color: '#ef4444' }} />
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1e293b' }}>কোনো শিক্ষার্থী পাওয়া যায়নি!</h3>
            <p style={{ margin: 0, fontSize: '15px' }}>নির্বাচিত ক্লাস এবং সেকশনে বর্তমানে কোনো শিক্ষার্থী ভর্তি নেই। দয়া করে অন্য ক্লাস সিলেক্ট করুন।</p>
          </div>
        )}

      </div>
    </AuthenticatedLayout>
  );
}
