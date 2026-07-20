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
      Swal.fire({ icon: 'warning', title: 'Oops...', text: 'দয়া করে ক্লাস সিলেক্ট করুন!' });
      return;
    }
    router.get(route('admin.fees-studentfees.index'), {
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
    post(route('admin.fees-studentfees.store'), {
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
        router.delete(route('admin.fees-studentfees.destroy', assignmentId), { preserveScroll: true });
      }
    });
  };

  const selectedClass = classes.find(c => c.id == classId);

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Finance & Accounts</span>
            <h1>Assign Student Fees</h1>
            <p className="desc">শিক্ষার্থীদের বিভিন্ন ফি গ্রুপ (যেমন: মাসিক ফি, ভর্তি ফি) অ্যাসাইন করুন।</p>
          </div>
        </div>
      }
    >
      <Head title="Assign Student Fees" />

      {/* Step 1: Filter Students */}
      <div className="card mm-card" style={{ background: '#fff', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="search" /> ১. শিক্ষার্থী খুঁজুন (Filter Students)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Class <span style={{color:'red'}}>*</span></label>
            <select value={classId} onChange={e => { setClassId(e.target.value); setSectionId(''); }} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <option value="">-- Select Class --</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Section (Optional)</label>
            <select value={sectionId} onChange={e => setSectionId(e.target.value)} disabled={!classId} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <option value="">-- All Sections --</option>
              {selectedClass?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button className="btn" onClick={fetchStudents} style={{ padding: '10px 20px', background: '#0f172a', color: '#fff', borderRadius: '6px' }}>
            Fetch Students
          </button>
        </div>
      </div>

      {/* Step 2: Assign Form & Table */}
      {students && students.length > 0 && (
        <form onSubmit={handleAssignSubmit}>
          <div className="card mm-card" style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="check-circle" /> ২. ফি নির্ধারণ করুন (Assign Fee Setup)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Select Fee Group <span style={{color:'red'}}>*</span></label>
                <select value={data.fee_group_id} onChange={e => setData('fee_group_id', e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}>
                  <option value="">-- Select Fee Group --</option>
                  {feeGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                {errors.fee_group_id && <span style={{ color: 'red', fontSize: '12px' }}>{errors.fee_group_id}</span>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>Due Date <span style={{color:'red'}}>*</span></label>
                <input type="date" value={data.due_date} onChange={e => setData('due_date', e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }} />
                {errors.due_date && <span style={{ color: 'red', fontSize: '12px' }}>{errors.due_date}</span>}
              </div>
            </div>
          </div>

          <div className="card mm-card" style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '15px', color: '#1e293b' }}>
                শিক্ষার্থী তালিকা <span style={{ color: '#64748b', fontSize: '13px' }}>(Total: {students.length})</span>
              </h4>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4f46e5' }}>Selected: {data.student_ids.length}</span>
            </div>

            <div className="mm-table-wrap" style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
              <table className="mm-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#fff', position: 'sticky', top: 0, zIndex: 10, borderBottom: '2px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '15px', width: '50px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        onChange={toggleAll}
                        checked={students.length > 0 && data.student_ids.length === students.length}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                    </th>
                    <th style={{ padding: '15px' }}>Admission No</th>
                    <th style={{ padding: '15px' }}>Student Name</th>
                    <th style={{ padding: '15px' }}>Class (Roll)</th>
                    <th style={{ padding: '15px' }}>Already Assigned Fees (Unpaid)</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9', background: data.student_ids.includes(student.id) ? '#f0fdf4' : 'transparent', transition: 'all 0.2s' }}>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.student_ids.includes(student.id)}
                          onChange={() => toggleStudent(student.id)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '15px', fontWeight: '600' }}>{student.admission_no}</td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '12px', fontWeight: 'bold' }}>
                            {student.first_name[0]}
                          </div>
                          {student.first_name} {student.last_name}
                        </div>
                      </td>
                      <td style={{ padding: '15px', color: '#64748b' }}>
                        {student.current_enrollment?.school_class?.name} - {student.current_enrollment?.roll_no || 'N/A'}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {student.fee_assignments?.filter(fa => fa.status === 'unpaid').map(assignment => (
                            <div key={assignment.id} style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ color: '#b45309', fontWeight: '600' }}>{assignment.fee_group?.name}</span>
                              <button
                                type="button"
                                onClick={() => handleRevoke(assignment.id)}
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}
                                title="Revoke/Cancel this fee"
                              >
                                <Icon name="close" style={{ fontSize: '12px' }} />
                              </button>
                            </div>
                          ))}
                          {student.fee_assignments?.filter(fa => fa.status === 'unpaid').length === 0 && (
                            <span style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>No pending fees</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={processing || data.student_ids.length === 0} className="btn" style={{ padding: '12px 30px', background: '#4f46e5', color: '#fff', borderRadius: '8px', fontWeight: '700', fontSize: '15px', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)' }}>
                {processing ? 'Assigning...' : `Assign Fee to ${data.student_ids.length} Students`}
              </button>
            </div>
          </div>
        </form>
      )}
    </AuthenticatedLayout>
  );
}
