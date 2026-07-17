import { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

export default function Index({ date, staffs, attendances }) {
  const { flash } = usePage().props;
  const [selectedDate, setSelectedDate] = useState(date);

  // Inertia Form Setup
  const { data, setData, post, processing } = useForm({
    date: date,
    attendances: []
  });

  // ১. ডেট এবং হাজিরা লিস্ট দুটোকেই প্রপ্সের সাথে সিঙ্ক রাখুন (Bug Fix)
  useEffect(() => {
    const initializedAttendances = staffs.map(staff => {
      const existingAtt = attendances[staff.id];
      return {
        staff_id: staff.id,
        status: existingAtt ? existingAtt.status : 'present',
        in_time: existingAtt ? (existingAtt.in_time || '') : '',
        out_time: existingAtt ? (existingAtt.out_time || '') : '',
        note: existingAtt ? (existingAtt.note || '') : ''
      };
    });

    // এখানে date এবং attendances একসাথে সেট করুন
    setData(prev => ({
      ...prev,
      date: date,
      attendances: initializedAttendances
    }));
  }, [staffs, attendances, date]); // Dependency-তে date যুক্ত করা হয়েছে

  // Flash Message
  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000 });
  }, [flash]);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    router.get(route('admin.staff-attendance.index'), { date: newDate }, { preserveState: true });
  };

  const handleAttendanceChange = (index, field, value) => {
    const updatedAttendances = [...data.attendances];
    updatedAttendances[index][field] = value;

    // UX Improvement: Absent সিলেক্ট করলে টাইম ফিল্ডগুলো ফাঁকা করে দেওয়া
    if (field === 'status' && value === 'absent') {
      updatedAttendances[index]['in_time'] = '';
      updatedAttendances[index]['out_time'] = '';
    }

    setData('attendances', updatedAttendances);
  };

  const markAllPresent = () => {
    const updatedAttendances = data.attendances.map(att => ({ ...att, status: 'present' }));
    setData('attendances', updatedAttendances);
  };

  const submit = (e) => {
    e.preventDefault();
    post(route('admin.staff-attendance.store'));
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="eyebrow">HR & Administration</span>
            <h1>Daily Staff Attendance</h1>
            <p className="desc">Take or update daily attendance for teachers and staff.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <Icon name="calendar" style={{ color: '#4f46e5' }} />
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              style={{ border: 'none', outline: 'none', fontSize: '15px', fontWeight: '600', color: '#1e293b', background: 'transparent', cursor: 'pointer' }}
            />
          </div>
        </div>
      }
    >
      <Head title="Staff Attendance" />

      <div className="card mm-card" style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', padding: '0' }}>

        {/* Actions Bar */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Total Staff: {staffs.length}</span>
            <button type="button" onClick={markAllPresent} style={{ background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="check" /> Mark All Present
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px', fontSize: '13px', fontWeight: '600' }}>
            <span style={{ color: '#16a34a' }}>P = Present</span>
            <span style={{ color: '#dc2626' }}>A = Absent</span>
            <span style={{ color: '#ea580c' }}>L = Late</span>
            <span style={{ color: '#2563eb' }}>HD = Half Day</span>
          </div>
        </div>

        <form onSubmit={submit}>
          <div className="mm-table-wrap" style={{ overflowX: 'auto' }}>
            <table className="mm-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '15px' }}>SL</th>
                  <th style={{ padding: '15px' }}>Staff Info</th>
                  <th style={{ padding: '15px' }}>Attendance Status <span style={{color: 'red'}}>*</span></th>
                  <th style={{ padding: '15px' }}>Time In</th>
                  <th style={{ padding: '15px' }}>Time Out</th>
                  <th style={{ padding: '15px' }}>Note / Reason</th>
                </tr>
              </thead>
              <tbody>
                {staffs.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>কোনো অ্যাক্টিভ স্টাফ পাওয়া যায়নি।</td></tr>
                ) : (
                  staffs.map((staff, index) => {
                    const attState = data.attendances[index];
                    if (!attState) return null;

                    const isAbsent = attState.status === 'absent';

                    return (
                      <tr key={staff.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '15px' }}>{index + 1}</td>
                        <td style={{ padding: '15px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={staff.photo ? `/storage/${staff.photo}` : '/images/default-avatar.png'} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                            <div>
                              <div style={{ fontWeight: '700', color: '#1e293b' }}>{staff.first_name} {staff.last_name || ''}</div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>{staff.designation?.name} • ID: {staff.staff_id_no}</div>
                            </div>
                          </div>
                        </td>

                        {/* Status Radio Buttons */}
                        <td style={{ padding: '15px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {['present', 'absent', 'late', 'half_day'].map(statusVal => (
                              <label key={statusVal} style={{
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', border: '1px solid', fontWeight: '700', fontSize: '14px', transition: 'all 0.2s',
                                ...(attState.status === statusVal
                                  ? { background: statusVal === 'present' ? '#16a34a' : statusVal === 'absent' ? '#dc2626' : statusVal === 'late' ? '#ea580c' : '#2563eb', color: '#fff', borderColor: 'transparent' }
                                  : { background: '#f8fafc', color: '#64748b', borderColor: '#cbd5e1' })
                              }}>
                                <input
                                  type="radio"
                                  name={`status_${staff.id}`}
                                  value={statusVal}
                                  checked={attState.status === statusVal}
                                  onChange={(e) => handleAttendanceChange(index, 'status', e.target.value)}
                                  style={{ display: 'none' }}
                                />
                                {statusVal === 'present' ? 'P' : statusVal === 'absent' ? 'A' : statusVal === 'late' ? 'L' : 'HD'}
                              </label>
                            ))}
                          </div>
                        </td>

                        <td style={{ padding: '15px' }}>
                          <input
                            type="time"
                            lang="en-US"
                            value={attState.in_time}
                            disabled={isAbsent}
                            onChange={(e) => handleAttendanceChange(index, 'in_time', e.target.value)}
                            style={{
                              padding: '8px 12px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              outline: 'none',
                              width: '120px',
                              background: isAbsent ? '#f1f5f9' : '#fff',
                              cursor: isAbsent ? 'not-allowed' : 'text'
                            }}
                          />
                        </td>

                        <td style={{ padding: '15px' }}>
                          <input
                            type="time"
                            lang="en-US"
                            value={attState.out_time}
                            disabled={isAbsent}
                            onChange={(e) => handleAttendanceChange(index, 'out_time', e.target.value)}
                            style={{
                              padding: '8px 12px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              outline: 'none',
                              width: '120px',
                              background: isAbsent ? '#f1f5f9' : '#fff',
                              cursor: isAbsent ? 'not-allowed' : 'text'
                            }}
                          />
                        </td>

                        {/* Note */}
                        <td style={{ padding: '15px' }}>
                          <input
                            type="text"
                            placeholder="Reason (if late/absent)"
                            value={attState.note}
                            onChange={(e) => handleAttendanceChange(index, 'note', e.target.value)}
                            style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', width: '100%', minWidth: '150px' }}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={processing || staffs.length === 0} style={{ background: '#4f46e5', color: '#fff', padding: '12px 32px', fontSize: '15px', fontWeight: '700', border: 'none', borderRadius: '8px', cursor: (processing || staffs.length === 0) ? 'not-allowed' : 'pointer', opacity: (processing || staffs.length === 0) ? 0.7 : 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Icon name="save" />
              {processing ? 'Saving Attendance...' : 'Save Attendance'}
            </button>
          </div>
        </form>
      </div>

    </AuthenticatedLayout>
  );
}
