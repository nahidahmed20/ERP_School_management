import { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

const labelCls = "block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5";
const selectCls = "w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-700 focus:border-emerald-500 focus:ring-emerald-500 focus:bg-white transition";

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
  const allSelected = students?.length > 0 && data.student_ids.length === students.length;

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

      <div className="pb-10 space-y-6">

        {/* Step 1: Filter Students */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Icon name="search" className="w-[18px] h-[18px]" />
            </span>
            <h3 className="text-lg font-bold text-gray-900">১. শিক্ষার্থী খুঁজুন</h3>
          </div>

          <div className="grid gap-5 items-end" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div>
              <label className={labelCls}>Class <span className="text-rose-500">*</span></label>
              <select value={classId} onChange={e => { setClassId(e.target.value); setSectionId(''); }} className={selectCls}>
                <option value="">-- Select Class --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>Section <span className="text-gray-400 font-normal normal-case">(Optional)</span></label>
              <select
                value={sectionId} onChange={e => setSectionId(e.target.value)}
                disabled={!classId} className={`${selectCls} disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <option value="">-- All Sections --</option>
                {selectedClass?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <button
              type="button" onClick={fetchStudents}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-700 to-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/25 hover:shadow-xl transition flex items-center justify-center gap-2"
            >
              <Icon name="filter" /> Fetch Students
            </button>
          </div>
        </div>

        {/* Step 2: Assign Form & Table */}
        {students && students.length > 0 && (
          <form onSubmit={handleAssignSubmit} className="space-y-6">

            {/* Fee Setup Card */}
            <div className="relative bg-amber-50/50 rounded-2xl border border-amber-200/60 shadow-sm p-7 pl-8 overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-700 to-amber-400" />
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Icon name="check" className="w-[18px] h-[18px]" />
                </span>
                <h3 className="text-lg font-bold text-gray-900">২. ফি নির্ধারণ করুন</h3>
              </div>

              <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                <div>
                  <label className={labelCls}>Select Fee Group <span className="text-rose-500">*</span></label>
                  <select
                    value={data.fee_group_id} onChange={e => setData('fee_group_id', e.target.value)}
                    required className={`${selectCls} bg-white`}
                  >
                    <option value="">-- Select Fee Group --</option>
                    {feeGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                  {errors.fee_group_id && <p className="text-xs text-rose-600 mt-1">{errors.fee_group_id}</p>}
                </div>

                <div>
                  <label className={labelCls}>Due Date <span className="text-rose-500">*</span></label>
                  <input
                    type="date" value={data.due_date} onChange={e => setData('due_date', e.target.value)}
                    required className={`${selectCls} bg-white`}
                  />
                  {errors.due_date && <p className="text-xs text-rose-600 mt-1">{errors.due_date}</p>}
                </div>
              </div>
            </div>

            {/* Student List Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-900">
                  শিক্ষার্থী তালিকা <span className="text-gray-400 font-normal ml-1">(Total: {students.length})</span>
                </h4>
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                  Selected: {data.student_ids.length}
                </span>
              </div>

              <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-4 w-14 text-center border-b-2 border-gray-100">
                        <input
                          type="checkbox" onChange={toggleAll} checked={allSelected}
                          className="w-[18px] h-[18px] cursor-pointer accent-emerald-600"
                        />
                      </th>
                      <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide border-b-2 border-gray-100">Admission No</th>
                      <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide border-b-2 border-gray-100">Student Name</th>
                      <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide border-b-2 border-gray-100">Class (Roll)</th>
                      <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide border-b-2 border-gray-100">Unpaid Fees</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => {
                      const isSelected = data.student_ids.includes(student.id);
                      const unpaid = student.fee_assignments?.filter(fa => fa.status === 'unpaid') ?? [];
                      return (
                        <tr key={student.id} className={`border-b border-gray-50 transition ${isSelected ? 'bg-emerald-50/60' : 'bg-white hover:bg-gray-50/70'}`}>
                          <td className="px-4 py-4 text-center">
                            <input
                              type="checkbox" checked={isSelected} onChange={() => toggleStudent(student.id)}
                              className="w-[18px] h-[18px] cursor-pointer accent-emerald-600"
                            />
                          </td>
                          <td className="px-4 py-4 font-semibold text-gray-700 text-sm">#{student.admission_no}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-800 flex items-center justify-center text-sm font-bold border border-emerald-200">
                                {student.first_name[0]}
                              </div>
                              <span className="text-sm font-medium text-gray-900">{student.first_name} {student.last_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium">
                              {student.current_enrollment?.school_class?.name} - {student.current_enrollment?.roll_no || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              {unpaid.map(assignment => (
                                <div key={assignment.id} className="bg-amber-50 border border-amber-200 pl-3 pr-1.5 py-1 rounded-full text-xs flex items-center gap-2">
                                  <span className="text-amber-700 font-bold">{assignment.fee_group?.name}</span>
                                  <button
                                    type="button" onClick={() => handleRevoke(assignment.id)}
                                    className="bg-amber-100 hover:bg-rose-100 text-rose-500 rounded-full w-5 h-5 flex items-center justify-center transition"
                                    title="Revoke this fee"
                                  >
                                    <Icon name="close" className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                              {unpaid.length === 0 && (
                                <span className="text-gray-400 text-xs italic bg-gray-50 px-2.5 py-1 rounded-full">No pending fees</span>
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
              <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-4">
                {data.student_ids.length === 0 && (
                  <span className="text-gray-400 text-sm">Select students to assign fees</span>
                )}
                <button
                  type="submit" disabled={processing || data.student_ids.length === 0}
                  className={`px-8 py-3 rounded-lg font-bold shadow-lg transition ${
                    processing || data.student_ids.length === 0
                      ? 'bg-gray-300 text-white cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-emerald-700 to-emerald-600 text-white shadow-emerald-600/25 hover:shadow-xl'
                  }`}
                >
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