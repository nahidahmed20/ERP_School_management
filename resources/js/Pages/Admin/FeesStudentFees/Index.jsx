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
      confirmButtonColor: '#e11d48', // rose-600
      cancelButtonColor: '#94a3b8', // slate-400
      confirmButtonText: 'হ্যাঁ, বাতিল করুন'
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('admin.studentfees.destroy', assignmentId), { preserveScroll: true });
      }
    });
  };

  const selectedClass = classes.find(c => c.id == classId);
  const allSelected = students?.length > 0 && data.student_ids.length === students.length;

  // Shared Design Classes
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";
  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";

  return (
    <AuthenticatedLayout>
      <Head title="Assign Student Fees" />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Finance &amp; Accounts</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Assign Student Fees</h1>
            <p className="text-sm text-slate-500 mt-1">শিক্ষার্থীদের বিভিন্ন ফি গ্রুপ (যেমন: মাসিক ফি, ভর্তি ফি) অ্যাসাইন করুন।</p>
          </div>
        </div>

        {/* Step 1: Filter Students */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <Icon name="search" className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-slate-900">১. শিক্ষার্থী খুঁজুন</h3>
          </div>

          <div className="grid gap-5 items-end grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <label className={labelClass}>Class <span className="text-rose-500">*</span></label>
              <select value={classId} onChange={e => { setClassId(e.target.value); setSectionId(''); }} className={inputClass}>
                <option value="">-- Select Class --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Section <span className="text-slate-400 font-normal">(Optional)</span></label>
              <select
                value={sectionId} onChange={e => setSectionId(e.target.value)}
                disabled={!classId} className={`${inputClass} disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100`}
              >
                <option value="">-- All Sections --</option>
                {selectedClass?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <button
              type="button" onClick={fetchStudents}
              className="w-full px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Icon name="filter" className="w-4 h-4" /> Fetch Students
            </button>
          </div>
        </div>

        {/* Step 2: Assign Form & Table */}
        {students && students.length > 0 && (
          <form onSubmit={handleAssignSubmit} className="space-y-6">

            {/* Fee Setup Card */}
            <div className="relative bg-slate-50/50 rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 overflow-hidden">
              {/* Decorative side accent */}
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-indigo-500 to-indigo-600" />
              
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-200">
                  <Icon name="check" className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-bold text-slate-900">২. ফি নির্ধারণ করুন</h3>
              </div>

              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 max-w-3xl">
                <div>
                  <label className={labelClass}>Select Fee Group <span className="text-rose-500">*</span></label>
                  <select
                    value={data.fee_group_id} onChange={e => setData('fee_group_id', e.target.value)}
                    required className={`${inputClass} bg-white`}
                  >
                    <option value="" disabled>-- Select Fee Group --</option>
                    {feeGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                  {errors.fee_group_id && <p className="text-xs text-rose-500 mt-1.5">{errors.fee_group_id}</p>}
                </div>

                <div>
                  <label className={labelClass}>Due Date <span className="text-rose-500">*</span></label>
                  <input
                    type="date" value={data.due_date} onChange={e => setData('due_date', e.target.value)}
                    required className={`${inputClass} bg-white font-mono`}
                  />
                  {errors.due_date && <p className="text-xs text-rose-500 mt-1.5">{errors.due_date}</p>}
                </div>
              </div>
            </div>

            {/* Student List Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              
              {/* Table Header Area */}
              <div className="px-6 py-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold text-slate-900">শিক্ষার্থী তালিকা</h4>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Total {students.length} students found</p>
                </div>
                <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3.5 py-1.5 rounded-lg border border-indigo-100 text-sm font-bold shadow-sm">
                  <span>Selected:</span>
                  <span className="bg-indigo-600 text-white px-2 py-0.5 rounded text-xs">{data.student_ids.length}</span>
                </div>
              </div>

              {/* Table wrapper */}
              <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="px-6 py-4 w-16 text-center border-b border-slate-200">
                        <div className="flex justify-center">
                          <input
                            type="checkbox" onChange={toggleAll} checked={allSelected}
                            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer transition-colors"
                          />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Admission No</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Student Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Class (Roll)</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">Unpaid Fees</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((student) => {
                      const isSelected = data.student_ids.includes(student.id);
                      const unpaid = student.fee_assignments?.filter(fa => fa.status === 'unpaid') ?? [];
                      return (
                        <tr key={student.id} className={`transition-colors ${isSelected ? 'bg-indigo-50/40' : 'bg-white hover:bg-slate-50/70'}`}>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center">
                              <input
                                type="checkbox" checked={isSelected} onChange={() => toggleStudent(student.id)}
                                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer transition-colors"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-mono font-bold text-slate-700">#{student.admission_no}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-bold border border-slate-200 shrink-0">
                                {student.first_name[0]}
                              </div>
                              <span className="text-sm font-bold text-slate-900">{student.first_name} {student.last_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-bold">
                              {student.current_enrollment?.school_class?.name} - Roll: {student.current_enrollment?.roll_no || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              {unpaid.map(assignment => (
                                <div key={assignment.id} className="bg-amber-50 border border-amber-200 text-amber-700 pl-3 pr-1 py-1 rounded-md text-[11px] font-bold tracking-wide flex items-center gap-2 shadow-sm">
                                  <span>{assignment.fee_group?.name}</span>
                                  <button
                                    type="button" onClick={() => handleRevoke(assignment.id)}
                                    className="bg-white hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-md w-5 h-5 flex items-center justify-center transition-colors border border-amber-200 hover:border-rose-200 shrink-0"
                                    title="Revoke this fee"
                                  >
                                    <Icon name="close" className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                              {unpaid.length === 0 && (
                                <span className="text-slate-400 text-xs font-medium italic">No pending fees</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Submit Button Section */}
              <div className="px-6 py-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-4 rounded-b-2xl">
                {data.student_ids.length === 0 && (
                  <span className="text-rose-500 text-sm font-medium">Please select at least one student</span>
                )}
                <button
                  type="submit" disabled={processing || data.student_ids.length === 0}
                  className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    processing || data.student_ids.length === 0
                      ? 'bg-slate-300 text-white cursor-not-allowed shadow-none'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                  }`}
                >
                  {processing ? 'Assigning...' : `Assign Fee to ${data.student_ids.length} Student(s)`}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </AuthenticatedLayout>
  );
}