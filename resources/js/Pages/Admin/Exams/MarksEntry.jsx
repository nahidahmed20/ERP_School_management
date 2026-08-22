import { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

export default function MarksEntry({ exams, classes, subjects, students, filters }) {
  const { flash } = usePage().props;

  const { data, setData, post, processing } = useForm({
    exam_id: filters?.exam_id || '',
    class_id: filters?.class_id || '',
    section_id: filters?.section_id || '',
    subject_id: filters?.subject_id || '',
    marks: []
  });

  const hasSavedMarks = students?.some(s => s.marks_obtained !== null && s.marks_obtained !== '');

  useEffect(() => {
    if (students && students.length > 0) {
      setData('marks', students.map(s => ({
        student_id: s.id,
        marks_obtained: s.marks_obtained !== null ? s.marks_obtained : '',
        note: s.note || ''
      })));
    } else {
      setData('marks', []);
    }
  }, [students]);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
  }, [flash]);

  const searchStudents = (e) => {
    e.preventDefault();
    router.get(route('admin.exams-marks.index'), {
      exam_id: data.exam_id,
      class_id: data.class_id,
      section_id: data.section_id,
      subject_id: data.subject_id
    }, { preserveState: true });
  };

  const handleMarkChange = (studentId, field, value) => {
    const newMarks = data.marks.map(m =>
      m.student_id === studentId ? { ...m, [field]: value } : m
    );
    setData('marks', newMarks);
  };

  const submitMarks = (e) => {
    e.preventDefault();
    post(route('admin.exams-marks.store'));
  };

  const deleteMarks = () => {
    Swal.fire({
      title: '<span style="color: #1e293b; font-weight: 800; font-size: 1.5rem;">Are you sure?</span>',
      html: '<p style="color: #64748b; font-size: 0.95rem; margin-top: 6px;">এই বিষয়ের সমস্ত এন্ট্রি করা মার্কস পার্মানেন্টলি মুছে ফেলা হবে!<br><strong style="color: #ef4444;">This action cannot be undone.</strong></p>',
      icon: 'warning',
      iconColor: '#ef4444',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#f1f5f9',
      confirmButtonText: '<span style="font-weight: 700;">Yes, Delete All</span>',
      cancelButtonText: '<span style="color: #475569; font-weight: 700;">Cancel</span>',
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-2xl shadow-2xl border border-gray-100 p-6',
        confirmButton: 'px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-200 transition-all font-semibold mr-3',
        cancelButton: 'px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-semibold'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('admin.exams-marks.destroy', ['', {
          exam_id: data.exam_id,
          class_id: data.class_id,
          section_id: data.section_id,
          subject_id: data.subject_id
        }]), { preserveScroll: true });
      }
    });
  };

  const selectedClass = classes?.find(c => c.id == data.class_id);
  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Examinations</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Subject Marks Entry</h1>
          </div>
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700">
            <Icon name="info" className="w-4 h-4 shrink-0 text-indigo-500" />
            <span>Press <strong>Tab</strong> or <strong>Arrows</strong> to navigate quickly</span>
          </div>
        </div>
      }
    >
      <Head title="Marks Entry" />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        
        {/* Filter Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-t-4 border-t-indigo-600">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100">
              <Icon name="book" className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Find Students</h3>
          </div>

          <form onSubmit={searchStudents} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 items-end">
            <div>
              <label className={labelClass}>Exam <span className="text-rose-500">*</span></label>
              <select value={data.exam_id} onChange={e => setData('exam_id', e.target.value)} required className={inputClass}>
                <option value="" disabled>-- Select Exam --</option>
                {exams?.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Class <span className="text-rose-500">*</span></label>
              <select value={data.class_id} onChange={e => { setData('class_id', e.target.value); setData('section_id', ''); }} required className={inputClass}>
                <option value="" disabled>-- Select Class --</option>
                {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Section</label>
              <select value={data.section_id} onChange={e => setData('section_id', e.target.value)} disabled={!data.class_id} className={`${inputClass} disabled:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed`}>
                <option value="">-- All Sections --</option>
                {selectedClass?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Subject <span className="text-rose-500">*</span></label>
              <select value={data.subject_id} onChange={e => setData('subject_id', e.target.value)} required className={inputClass}>
                <option value="" disabled>-- Select Subject --</option>
                {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <button type="submit" className="w-full px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2 h-[42px]">
                <Icon name="search" className="w-4 h-4" /> Load Students
              </button>
            </div>
          </form>
        </div>

        {/* Excel-like Table Card */}
        {students && students.length > 0 && (
          <form onSubmit={submitMarks} className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 overflow-hidden">

            <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-slate-900">Student List</h3>
                <span className="inline-flex px-2.5 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Total: {students.length}
                </span>
                {hasSavedMarks && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Icon name="check" className="w-3.5 h-3.5" /> Marks Saved
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {hasSavedMarks && (
                  <button type="button" onClick={deleteMarks} className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm">
                    <Icon name="trash" className="w-3.5 h-3.5" /> Clear All
                  </button>
                )}
                <button type="submit" disabled={processing} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 flex items-center gap-2 active:scale-95">
                  <Icon name="check-circle" className="w-4 h-4" />
                  {processing ? 'Saving...' : (hasSavedMarks ? 'Update Marks' : 'Save Marks')}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-28">Roll No</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name &amp; Info</th>
                    <th className="px-6 py-4 text-xs font-semibold text-amber-700 uppercase tracking-wider text-center bg-amber-50/40 w-48">Marks Obtained</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-72">Remarks / Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => {
                    const markData = data.marks.find(m => m.student_id === student.id);
                    if (!markData) return null;

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-600 text-sm">
                          {student.current_enrollment?.roll_no || '--'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-900 block">{student.first_name} {student.last_name}</span>
                          <span className="text-xs font-mono text-slate-500 mt-0.5 block">ID: {student.admission_no}</span>
                        </td>
                        <td className="px-6 py-4 bg-amber-50/20">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={markData.marks_obtained}
                            onChange={(e) => handleMarkChange(student.id, 'marks_obtained', e.target.value)}
                            className="w-full text-center px-3 py-2 font-mono font-bold text-base text-amber-800 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={markData.note}
                            onChange={(e) => handleMarkChange(student.id, 'note', e.target.value)}
                            className="w-full px-3 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-slate-400"
                            placeholder="e.g. Absent, Sick..."
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </form>
        )}
      </div>
    </AuthenticatedLayout>
  );
}