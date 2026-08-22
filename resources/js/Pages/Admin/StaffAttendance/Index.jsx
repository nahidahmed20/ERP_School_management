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

    setData(prev => ({
      ...prev,
      date: date,
      attendances: initializedAttendances
    }));
  }, [staffs, attendances, date]);

  // Flash Message
  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
  }, [flash]);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    router.get(route('admin.staff-attendance.index'), { date: newDate }, { preserveState: true });
  };

  const handleAttendanceChange = (index, field, value) => {
    const updatedAttendances = [...data.attendances];
    updatedAttendances[index][field] = value;

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

  // Status Button Style Helper
  const getStatusButtonStyle = (currentStatus, statusVal) => {
    const isSelected = currentStatus === statusVal;
    switch(statusVal) {
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
    <AuthenticatedLayout
      header={
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">HR & Administration</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Daily Staff Attendance</h1>
            <p className="text-sm text-slate-500 mt-1">শিক্ষক ও কর্মচারীদের প্রতিদিনের উপস্থিতি রেকর্ড করুন।</p>
          </div>
          
          {/* Date Picker Pill */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <Icon name="calendar" className="w-4 h-4 text-indigo-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="text-sm font-bold text-slate-800 bg-transparent outline-none cursor-pointer font-mono"
            />
          </div>
        </div>
      }
    >
      <Head title="Staff Attendance" />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        
        {/* Main Attendance Card */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 overflow-hidden">

          {/* Actions Bar */}
          <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-700">Total Staff: <span className="text-indigo-600">{staffs.length}</span></span>
              <button 
                type="button" 
                onClick={markAllPresent} 
                className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Icon name="check" className="w-3.5 h-3.5" /> Mark All Present
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
              <span className="text-emerald-600">P = Present</span>
              <span className="text-rose-600">A = Absent</span>
              <span className="text-amber-600">L = Late</span>
              <span className="text-blue-600">HD = Half Day</span>
            </div>
          </div>

          <form onSubmit={submit}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">SL</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Staff Info</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance Status <span className="text-rose-500">*</span></th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time In</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time Out</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Note / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        কোনো অ্যাক্টিভ স্টাফ পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    staffs.map((staff, index) => {
                      const attState = data.attendances[index];
                      if (!attState) return null;

                      const isAbsent = attState.status === 'absent';

                      return (
                        <tr key={staff.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-4 text-sm font-semibold text-slate-500">
                            {index + 1}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={staff.photo ? `/storage/${staff.photo}` : '/images/default-avatar.png'} 
                                alt="Staff" 
                                className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0" 
                              />
                              <div>
                                <span className="text-sm font-bold text-slate-900 block">{staff.first_name} {staff.last_name || ''}</span>
                                <span className="text-xs text-slate-500 font-medium block mt-0.5">{staff.designation?.name} • ID: {staff.staff_id_no}</span>
                              </div>
                            </div>
                          </td>

                          {/* Status Buttons */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              {[
                                { value: 'present', label: 'P', title: 'Present' },
                                { value: 'absent', label: 'A', title: 'Absent' },
                                { value: 'late', label: 'L', title: 'Late' },
                                { value: 'half_day', label: 'HD', title: 'Half Day' }
                              ].map(opt => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  title={opt.title}
                                  onClick={() => handleAttendanceChange(index, 'status', opt.value)}
                                  className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold border transition-all ${getStatusButtonStyle(attState.status, opt.value)}`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <input
                              type="time"
                              lang="en-US"
                              value={attState.in_time}
                              disabled={isAbsent}
                              onChange={(e) => handleAttendanceChange(index, 'in_time', e.target.value)}
                              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none transition-all w-32 disabled:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </td>

                          <td className="px-6 py-4">
                            <input
                              type="time"
                              lang="en-US"
                              value={attState.out_time}
                              disabled={isAbsent}
                              onChange={(e) => handleAttendanceChange(index, 'out_time', e.target.value)}
                              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none transition-all w-32 disabled:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </td>

                          <td className="px-6 py-4">
                            <input
                              type="text"
                              placeholder="Reason (if late/absent)"
                              value={attState.note}
                              onChange={(e) => handleAttendanceChange(index, 'note', e.target.value)}
                              className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button 
                type="submit" 
                disabled={processing || staffs.length === 0} 
                className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
              >
                <Icon name="save" className="w-4 h-4" />
                {processing ? 'Saving Attendance...' : 'Save Attendance'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}