import { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

export default function Index({ classes, students, filters }) {
  const { flash } = usePage().props;

  const [classId, setClassId] = useState(filters.class_id ?? '');
  const [sectionId, setSectionId] = useState(filters.section_id ?? '');
  const [attendanceDate, setAttendanceDate] = useState(filters.date ?? new Date().toISOString().split('T')[0]);

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
          status: s.attendance_status || '',
          remarks: s.remarks || ''
        }))
      }));
    } else {
      setData('attendances', []);
    }
  }, [students]);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
  }, [flash]);

  const fetchStudents = (e) => {
    e.preventDefault();
    if (!classId) return Swal.fire({ icon: 'warning', title: 'Oops', text: 'দয়া করে ক্লাস সিলেক্ট করুন!', customClass: { popup: 'rounded-2xl' } });
    
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
      return Swal.fire({ icon: 'warning', title: 'Oops!', text: 'দয়া করে কমপক্ষে ১ জন স্টুডেন্ট সিলেক্ট করুন!', customClass: { popup: 'rounded-2xl' } });
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

  // Status Badge Colors for Buttons
  const getStatusStyle = (status, currentStatus) => {
    const isSelected = status === currentStatus;
    switch(status) {
      case 'present': 
        return isSelected ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20' : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50';
      case 'absent': 
        return isSelected ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/20' : 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50';
      case 'late': 
        return isSelected ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20' : 'bg-white text-amber-600 border-amber-200 hover:bg-amber-50';
      case 'half_day': 
        return isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50';
      default: 
        return 'bg-white text-slate-700 border-slate-200';
    }
  };

  return (
    <AuthenticatedLayout>
      <Head title="Student Attendance" />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Attendance</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Daily Attendance</h1>
            <p className="text-sm text-slate-500 mt-1">শিক্ষার্থীদের প্রতিদিনের উপস্থিতি ও অনুপস্থিতির রেকর্ড রাখুন।</p>
          </div>
          
          <button 
            onClick={handleSendAbsentSms}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-rose-500/20 active:scale-95"
          >
            <Icon name="mail" className="w-4 h-4" /> Send Absent SMS
          </button>
        </div>

        {/* Filter Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-t-4 border-t-slate-900">
          <form onSubmit={fetchStudents} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Attendance Date <span className="text-rose-500">*</span></label>
              <input 
                type="date" 
                value={attendanceDate} 
                onChange={e => setAttendanceDate(e.target.value)} 
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Class <span className="text-rose-500">*</span></label>
              <select 
                value={classId} 
                onChange={e => { setClassId(e.target.value); setSectionId(''); }} 
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                required
              >
                <option value="">-- Select Class --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Section</label>
              <select 
                value={sectionId} 
                onChange={e => setSectionId(e.target.value)} 
                disabled={!classId} 
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer disabled:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">-- All Sections --</option>
                {selectedClass?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <button 
              type="submit" 
              className="w-full px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 h-[42px]"
            >
              <Icon name="search" className="w-4 h-4" /> Fetch Students
            </button>
          </form>
        </div>

        {/* Attendance Form & Table */}
        {students && students.length > 0 && (
          <form onSubmit={submitAttendance} className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-base font-bold text-slate-900">Student List <span className="text-indigo-600">(Total: {students.length})</span></h3>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button type="button" onClick={() => markAll('present')} className="flex-1 sm:flex-none px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors shadow-sm">
                  Mark All Present
                </button>
                <button type="button" onClick={() => markAll('absent')} className="flex-1 sm:flex-none px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors shadow-sm">
                  Mark All Absent
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-14 text-center">
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
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Roll / Adm</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => {
                    const currentAtt = data.attendances.find(a => a.student_id === student.id);
                    if (!currentAtt) return null;

                    const isChecked = data.selected_students?.includes(student.id) || false;

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                        
                        <td className="px-6 py-4 text-center">
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
                            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-900 block">{student.current_enrollment?.roll_no || '--'}</span>
                          <span className="text-xs font-medium text-slate-500">{student.admission_no}</span>
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-900">{student.first_name} {student.last_name}</span>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            {[
                              { value: 'present', label: 'P', title: 'Present' },
                              { value: 'absent', label: 'A', title: 'Absent' },
                              { value: 'late', label: 'L', title: 'Late' },
                              { value: 'half_day', label: 'HD', title: 'Half Day' }
                            ].map(opt => {
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  title={opt.title}
                                  onClick={() => handleStatusChange(student.id, opt.value)}
                                  className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold border transition-all ${getStatusStyle(opt.value, currentAtt.status)}`}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                          {student.attendance_source && <div className="mt-1 text-[10px] font-medium text-slate-500">{student.attendance_source} · {student.attendance_in_time || '--'}–{student.attendance_out_time || '--'}</div>}
                        </td>
                        
                        <td className="px-6 py-4">
                          <input 
                            type="text" 
                            placeholder="Reason / Remarks..." 
                            value={currentAtt.remarks} 
                            onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button 
                type="submit" 
                disabled={processing} 
                className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
              >
                <Icon name="check-circle" className="w-4 h-4" />
                {processing ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
