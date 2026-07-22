import { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

export default function Index({ classes, students, filters }) {
  const { flash } = usePage().props;

  const [classId, setClassId] = useState(filters.class_id);
  const [sectionId, setSectionId] = useState(filters.section_id);
  const [attendanceDate, setAttendanceDate] = useState(filters.date);

  const { data, setData, post, processing } = useForm({
    class_id: classId,
    section_id: sectionId,
    date: attendanceDate,
    attendances: [],
    selected_students: []
  });

  useEffect(() => {
    if (students && students.length > 0) {
      setData(prev => ({
        ...prev,
        class_id: classId,
        section_id: sectionId,
        date: attendanceDate,
        attendances: students.map(s => ({
          student_id: s.id,
          status: s.attendance_status || 'present',
          remarks: s.remarks || ''
        }))
      }));
    } else {
      setData('attendances', []);
    }
  }, [students]);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000 });
  }, [flash]);

  const fetchStudents = (e) => {
    e.preventDefault();
    if (!classId) return Swal.fire({ icon: 'warning', title: 'Oops', text: 'দয়া করে ক্লাস সিলেক্ট করুন!' });
    
    router.get(route('admin.student-attendance.index'), {
      class_id: classId,
      section_id: sectionId,
      date: attendanceDate
    }, { preserveState: true });
  };

  const handleStatusChange = (studentId, status) => {
    const newAttendances = data.attendances.map(att => 
      att.student_id === studentId ? { ...att, status } : att
    );
    setData('attendances', newAttendances);
  };

  const handleRemarksChange = (studentId, remarks) => {
    const newAttendances = data.attendances.map(att => 
      att.student_id === studentId ? { ...att, remarks } : att
    );
    setData('attendances', newAttendances);
  };

  const markAll = (status) => {
    const newAttendances = data.attendances.map(att => ({ ...att, status }));
    setData('attendances', newAttendances);
  };

  const submitAttendance = (e) => {
    e.preventDefault();
    post(route('admin.student-attendance.store'));
  };

 const handleSendAbsentSms = () => {
    if (data.selected_students.length === 0) {
      return Swal.fire({ icon: 'warning', title: 'Oops!', text: 'দয়া করে কমপক্ষে ১ জন স্টুডেন্ট সিলেক্ট করুন!' });
    }

    const selectedDate = attendanceDate || new Date().toISOString().split('T')[0]; 

    Swal.fire({
      title: '<span style="color: #1e293b; font-weight: 800; font-size: 1.5rem;">Send Absent SMS?</span>',
      html: `<p style="color: #64748b; font-size: 0.95rem; margin-top: 6px;">নির্বাচিত <strong>${data.selected_students.length}</strong> জন শিক্ষার্থীর অভিভাবককে SMS পাঠানো হবে!<br><strong style="color: #4f46e5;">Are you sure?</strong></p>`,
      icon: 'question',
      iconColor: '#4f46e5',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#f1f5f9',
      confirmButtonText: '<span style="font-weight: 700;">Yes, Send SMS</span>',
      cancelButtonText: '<span style="color: #475569; font-weight: 700;">Cancel</span>',
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-2xl shadow-2xl border border-gray-100 p-6',
        confirmButton: 'px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 transition-all font-semibold mr-3',
        cancelButton: 'px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-semibold'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(route('admin.attendance.send-absent-sms'), { 
          date: selectedDate,
          student_ids: data.selected_students 
        }, {
          preserveScroll: true,
        });
      }
    });
  };

  const selectedClass = classes.find(c => c.id == classId);

  // Status Badge Colors
  const getStatusColor = (status, currentStatus) => {
    const isSelected = status === currentStatus;
    switch(status) {
      case 'present': return isSelected ? { bg: '#16a34a', text: '#fff', border: '#16a34a' } : { bg: '#fff', text: '#16a34a', border: '#16a34a' };
      case 'absent': return isSelected ? { bg: '#dc2626', text: '#fff', border: '#dc2626' } : { bg: '#fff', text: '#dc2626', border: '#dc2626' };
      case 'late': return isSelected ? { bg: '#d97706', text: '#fff', border: '#d97706' } : { bg: '#fff', text: '#d97706', border: '#d97706' };
      case 'half_day': return isSelected ? { bg: '#2563eb', text: '#fff', border: '#2563eb' } : { bg: '#fff', text: '#2563eb', border: '#2563eb' };
      default: return { bg: '#fff', text: '#000', border: '#ccc' };
    }
  };

  return (
    
    
    <AuthenticatedLayout 
      header={
        <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0 }}>Daily Attendance</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>শিক্ষার্থীদের প্রতিদিনের উপস্থিতি ও অনুপস্থিতির রেকর্ড রাখুন।</p>
          </div>
          
          {/* 🆕 Send Absent SMS Button */}
          <button 
            onClick={handleSendAbsentSms}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              padding: '10px 20px', background: '#e11d48', color: '#fff', 
              borderRadius: '8px', fontWeight: 'bold', border: 'none', 
              cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(225, 29, 72, 0.2)' 
            }}
          >
            <Icon name="mail" style={{ width: '18px', height: '18px' }} />
            Send Absent SMS
          </button>
        </div>
      }
    >

      <Head title="Student Attendance" />

      {/* Filter Form */}
      <div className="card mm-card" style={{ padding: '24px', borderRadius: '12px', marginBottom: '24px', borderTop: '4px solid #0f172a' }}>
        <form onSubmit={fetchStudents} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Attendance Date *</label>
            <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Class *</label>
            <select value={classId} onChange={e => { setClassId(e.target.value); setSectionId(''); }} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <option value="">-- Select Class --</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Section</label>
            <select value={sectionId} onChange={e => setSectionId(e.target.value)} disabled={!classId} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <option value="">-- All Sections --</option>
              {selectedClass?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button type="submit" className="btn" style={{ padding: '10px', background: '#0f172a', color: '#fff', borderRadius: '6px' }}>Fetch Students</button>
        </form>
      </div>

      {/* Attendance Form */}
      {students && students.length > 0 && (
        <form onSubmit={submitAttendance} className="card mm-card" style={{ padding: '0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Student List (Total: {students.length})</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => markAll('present')} style={{ padding: '6px 12px', background: '#dcfce7', color: '#16a34a', border: '1px solid #16a34a', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>Mark All Present</button>
              <button type="button" onClick={() => markAll('absent')} style={{ padding: '6px 12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>Mark All Absent</button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="mm-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fff', borderBottom: '2px solid #e2e8f0' }}>
                  
                  {/* 🆕 Select All Checkbox */}
                  <th style={{ padding: '15px', width: '50px', textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      title="Select All"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setData('selected_students', students.map(s => s.id));
                        } else {
                          setData('selected_students', []);
                        }
                      }}
                      checked={data.selected_students?.length === students.length && students.length > 0}
                      style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#4f46e5' }}
                    />
                  </th>

                  <th style={{ padding: '15px' }}>Roll / Adm</th>
                  <th style={{ padding: '15px' }}>Student Name</th>
                  <th style={{ padding: '15px', minWidth: '280px' }}>Attendance Status</th>
                  <th style={{ padding: '15px' }}>Remarks</th>
                </tr>
              </thead>
              
              <tbody>
                {students.map((student, index) => {
                  const currentAtt = data.attendances.find(a => a.student_id === student.id);
                  if (!currentAtt) return null;

                  const isChecked = data.selected_students?.includes(student.id) || false;

                  return (
                    <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setData('selected_students', [...(data.selected_students || []), student.id]);
                            } else {
                              setData('selected_students', (data.selected_students || []).filter(id => id !== student.id));
                            }
                          }}
                          style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#4f46e5' }}
                        />
                      </td>

                      <td style={{ padding: '15px', color: '#64748b' }}>
                        <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{student.current_enrollment?.roll_no || '--'}</span> <br/>
                        <span style={{ fontSize: '12px' }}>{student.admission_no}</span>
                      </td>
                      
                      <td style={{ padding: '15px', fontWeight: '600' }}>
                        {student.first_name} {student.last_name}
                      </td>
                      
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {[
                            { value: 'present', label: 'P', title: 'Present' },
                            { value: 'absent', label: 'A', title: 'Absent' },
                            { value: 'late', label: 'L', title: 'Late' },
                            { value: 'half_day', label: 'HD', title: 'Half Day' }
                          ].map(opt => {
                            const colors = getStatusColor(opt.value, currentAtt.status);
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                title={opt.title}
                                onClick={() => handleStatusChange(student.id, opt.value)}
                                style={{
                                  width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`,
                                  borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      
                      <td style={{ padding: '15px' }}>
                        <input 
                          type="text" 
                          placeholder="Reason..." 
                          value={currentAtt.remarks} 
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                          style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                        />
                      </td>
                      
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          <div style={{ padding: '20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={processing} className="btn" style={{ padding: '12px 30px', background: '#4f46e5', color: '#fff', borderRadius: '8px', fontWeight: '700', fontSize: '15px' }}>
              {processing ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </form>
      )}
    </AuthenticatedLayout>
  );
}