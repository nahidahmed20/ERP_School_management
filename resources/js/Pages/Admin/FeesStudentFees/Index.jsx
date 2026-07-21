import { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

export default function Index({ students, classes, feeGroups, filters }) {
  const { flash } = usePage().props;

  // Search Filters
  const [classId, setClassId] = useState(filters.class_id ?? '');
  const [sectionId, setSectionId] = useState(filters.section_id ?? '');

  // Form State for Assignment
  const { data, setData, post, processing, errors, reset } = useForm({
    student_ids: [],
    fee_group_id: '',
    due_date: ''
  });

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000 });
  }, [flash]);

  // Fetch Students
  const fetchStudents = () => {
    if (!classId) {
      Swal.fire({ icon: 'warning', title: 'Oops...', text: 'দয়া করে ক্লাস সিলেক্ট করুন!' });
      return;
    }
    router.get(route('admin.studentfees.index'), {
      class_id: classId,
      section_id: sectionId,
    }, { preserveState: true });
  };

  // Toggle Single Checkbox
  const toggleStudent = (id) => {
    let selected = [...data.student_ids];
    if (selected.includes(id)) {
      selected = selected.filter(i => i !== id);
    } else {
      selected.push(id);
    }
    setData('student_ids', selected);
  };

  // Toggle All Checkboxes
  const toggleAll = (e) => {
    if (e.target.checked) {
      setData('student_ids', students.map(s => s.id));
    } else {
      setData('student_ids', []);
    }
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (data.student_ids.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Warning', text: 'কমপক্ষে একজন শিক্ষার্থী সিলেক্ট করুন!' });
      return;
    }
    post(route('admin.studentfees.store'), {
      onSuccess: () => {
        setData('student_ids', []); // Clear selection after success
      }
    });
  };

  const handleRevoke = (assignmentId) => {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: "এই ফি অ্যাসাইনমেন্টটি বাতিল করা হবে!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'হ্যাঁ, বাতিল করুন'
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('admin.studentfees.destroy', assignmentId), { preserveScroll: true });
      }
    });
  };

  const selectedClass = classes.find(c => c.id == classId);

  // Reusable Input Style
  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '14px', outline: 'none', transition: 'border 0.3s ease', cursor: 'pointer' };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head" style={{ marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Finance & Accounts</span>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: '4px 0' }}>Assign Student Fees</h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>শিক্ষার্থীদের বিভিন্ন ফি গ্রুপ (যেমন: মাসিক ফি, ভর্তি ফি) অ্যাসাইন করুন।</p>
          </div>
        </div>
      }
    >
      <Head title="Assign Student Fees" />

      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Step 1: Filter Students */}
        <div style={{ background: '#ffffff', padding: '28px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', marginBottom: '32px', border: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '17px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#e0e7ff', color: '#4f46e5', borderRadius: '8px' }}>
              <Icon name="search" size="18" />
            </span>
            ১. শিক্ষার্থী খুঁজুন
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>Class <span style={{color:'#ef4444'}}>*</span></label>
              <select value={classId} onChange={e => { setClassId(e.target.value); setSectionId(''); }} style={inputStyle}>
                <option value="">-- Select Class --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>Section <span style={{color:'#94a3b8', fontWeight: 'normal'}}>(Optional)</span></label>
              <select value={sectionId} onChange={e => setSectionId(e.target.value)} disabled={!classId} style={{...inputStyle, opacity: !classId ? 0.6 : 1}}>
                <option value="">-- All Sections --</option>
                {selectedClass?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <button onClick={fetchStudents} style={{ padding: '12px 24px', background: '#0f172a', color: '#fff', borderRadius: '8px', fontWeight: '600', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.3s' }}>
              <Icon name="filter" size="16" /> Fetch Students
            </button>
          </div>
        </div>

        {/* Step 2: Assign Form & Table */}
        {students && students.length > 0 && (
          <form onSubmit={handleAssignSubmit}>
            
            {/* Fee Setup Card */}
            <div style={{ background: 'linear-gradient(145deg, #eef2ff 0%, #f5f3ff 100%)', padding: '28px', borderRadius: '16px', marginBottom: '24px', border: '1px solid #c7d2fe', boxShadow: '0 4px 15px rgba(79, 70, 229, 0.05)' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '17px', color: '#3730a3', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#c7d2fe', color: '#3730a3', borderRadius: '8px' }}>
                  <Icon name="check-circle" size="18" />
                </span>
                ২. ফি নির্ধারণ করুন
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#3730a3' }}>Select Fee Group <span style={{color:'#ef4444'}}>*</span></label>
                  <select value={data.fee_group_id} onChange={e => setData('fee_group_id', e.target.value)} required style={{...inputStyle, background: '#fff', borderColor: '#a5b4fc'}}>
                    <option value="">-- Select Fee Group --</option>
                    {feeGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                  {errors.fee_group_id && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.fee_group_id}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#3730a3' }}>Due Date <span style={{color:'#ef4444'}}>*</span></label>
                  <input type="date" value={data.due_date} onChange={e => setData('due_date', e.target.value)} required style={{...inputStyle, background: '#fff', borderColor: '#a5b4fc'}} />
                  {errors.due_date && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.due_date}</span>}
                </div>
              </div>
            </div>

            {/* Student List Table */}
            <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', border: '1px solid #f1f5f9' }}>
              <div style={{ padding: '20px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '600' }}>
                  শিক্ষার্থী তালিকা <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 'normal', marginLeft: '6px' }}>(Total: {students.length})</span>
                </h4>
                <div style={{ background: '#e0e7ff', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', color: '#4f46e5' }}>
                  Selected: {data.student_ids.length}
                </div>
              </div>

              <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr>
                      <th style={{ padding: '16px', width: '60px', textAlign: 'center', borderBottom: '2px solid #e2e8f0' }}>
                        <input type="checkbox" onChange={toggleAll} checked={students.length > 0 && data.student_ids.length === students.length} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#4f46e5' }} />
                      </th>
                      <th style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', borderBottom: '2px solid #e2e8f0' }}>Admission No</th>
                      <th style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', borderBottom: '2px solid #e2e8f0' }}>Student Name</th>
                      <th style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', borderBottom: '2px solid #e2e8f0' }}>Class (Roll)</th>
                      <th style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', borderBottom: '2px solid #e2e8f0' }}>Unpaid Fees</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => {
                      const isSelected = data.student_ids.includes(student.id);
                      return (
                        <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9', background: isSelected ? '#f5f8ff' : '#fff', transition: 'background 0.2s' }}>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <input type="checkbox" checked={isSelected} onChange={() => toggleStudent(student.id)} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#4f46e5' }} />
                          </td>
                          <td style={{ padding: '16px', fontWeight: '600', color: '#334155', fontSize: '14px' }}>
                            #{student.admission_no}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3730a3', fontSize: '14px', fontWeight: 'bold', border: '1px solid #a5b4fc' }}>
                                {student.first_name[0]}
                              </div>
                              <span style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>{student.first_name} {student.last_name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '16px', color: '#64748b', fontSize: '14px' }}>
                            <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontWeight: '500' }}>
                              {student.current_enrollment?.school_class?.name} - {student.current_enrollment?.roll_no || 'N/A'}
                            </span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {student.fee_assignments?.filter(fa => fa.status === 'unpaid').map(assignment => (
                                <div key={assignment.id} style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                                  <span style={{ color: '#d97706', fontWeight: '600' }}>{assignment.fee_group?.name}</span>
                                  <button type="button" onClick={() => handleRevoke(assignment.id)} style={{ background: '#fef3c7', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} title="Revoke this fee">
                                    <Icon name="close" size="12" />
                                  </button>
                                </div>
                              ))}
                              {student.fee_assignments?.filter(fa => fa.status === 'unpaid').length === 0 && (
                                <span style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic', background: '#f8fafc', padding: '4px 10px', borderRadius: '20px' }}>No pending fees</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Submit Button Section */}
              <div style={{ padding: '24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                {data.student_ids.length === 0 ? (
                  <span style={{ color: '#94a3b8', fontSize: '14px', marginRight: '16px' }}>Select students to assign fees</span>
                ) : null}
                <button type="submit" disabled={processing || data.student_ids.length === 0} style={{ padding: '14px 32px', background: processing || data.student_ids.length === 0 ? '#94a3b8' : 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', color: '#fff', borderRadius: '8px', fontWeight: '600', fontSize: '15px', border: 'none', cursor: processing || data.student_ids.length === 0 ? 'not-allowed' : 'pointer', boxShadow: processing || data.student_ids.length === 0 ? 'none' : '0 4px 12px rgba(79, 70, 229, 0.3)', transition: 'all 0.3s' }}>
                  {processing ? 'Assigning...' : `Assign Fee to ${data.student_ids.length} Students`}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </AuthenticatedLayout>
  );
}