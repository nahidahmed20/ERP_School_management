import { useState, useEffect } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
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
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000 });
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
      html: '<p style="color: #64748b; font-size: 0.95rem; margin-top: 6px;">এই বিষয়ের সমস্ত এন্ট্রি করা মার্কস পার্মানেন্টলি মুছে ফেলা হবে!<br><strong style="color: #ef4444;">This action cannot be undone.</strong></p>',
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
      },
      showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster'
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

  return (
    <AuthenticatedLayout header={
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-100 px-2 py-1 rounded-md">Examinations</span>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-2">Subject Marks Entry</h1>
        </div>
        <div className="text-sm text-gray-600 bg-white px-4 py-2.5 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2.5">
          <Icon name="info" className="w-5 h-5 text-indigo-500 shrink-0" />
          <span>Press <strong>Tab</strong> or <strong>Arrows</strong> to navigate quickly</span>
        </div>
      </div>
    }>
      <Head title="Marks Entry" />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* 🎛️ Modern Filter Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={searchStudents} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-5 items-end">
            
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Exam <span className="text-rose-500">*</span></label>
              <select value={data.exam_id} onChange={e => setData('exam_id', e.target.value)} required className="w-full rounded-lg border-gray-300 bg-gray-50 focus:bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 sm:text-sm py-2.5 transition-all">
                <option value="">-- Select Exam --</option>
                {exams?.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Class <span className="text-rose-500">*</span></label>
              <select value={data.class_id} onChange={e => { setData('class_id', e.target.value); setData('section_id', ''); }} required className="w-full rounded-lg border-gray-300 bg-gray-50 focus:bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 sm:text-sm py-2.5 transition-all">
                <option value="">-- Select Class --</option>
                {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Section</label>
              <select value={data.section_id} onChange={e => setData('section_id', e.target.value)} disabled={!data.class_id} className="w-full rounded-lg border-gray-300 bg-gray-50 focus:bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 sm:text-sm py-2.5 transition-all disabled:opacity-50">
                <option value="">-- All Sections --</option>
                {selectedClass?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Subject <span className="text-rose-500">*</span></label>
              <select value={data.subject_id} onChange={e => setData('subject_id', e.target.value)} required className="w-full rounded-lg border-gray-300 bg-gray-50 focus:bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 sm:text-sm py-2.5 transition-all">
                <option value="">-- Select Subject --</option>
                {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            
            <div>
              <button type="submit" className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg shadow-md text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all">
                <Icon name="search" className="w-4 h-4" /> Load Students
              </button>
            </div>
          </form>
        </div>

        {/* 📝 Full Width Excel-like Table */}
        {students && students.length > 0 && (
          <form onSubmit={submitMarks} className="bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            
            {/* Table Header Area */}
            <div className="bg-slate-50 px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center rounded-t-2xl gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-extrabold text-slate-800">Student List</h3>
                <span className="bg-indigo-100 text-indigo-700 py-1 px-3 rounded-full text-xs font-bold">Total: {students.length}</span>
                {hasSavedMarks && (
                  <span className="bg-emerald-100 text-emerald-700 py-1 px-3 rounded-full text-xs font-bold flex items-center gap-1">
                    <Icon name="check" className="w-3 h-3" /> Marks Saved
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {hasSavedMarks && (
                  <button type="button" onClick={deleteMarks} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors">
                    <Icon name="trash" className="w-4 h-4" /> Clear All
                  </button>
                )}
                <button type="submit" disabled={processing} className="flex items-center gap-2 py-2 px-6 rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50">
                  {processing ? 'Saving...' : (hasSavedMarks ? 'Update Marks' : 'Save Marks')}
                </button>
              </div>
            </div>

            {/* Scrollable Table Area */}
            <div className="overflow-auto flex-1">
              <table className="min-w-full divide-y divide-gray-200 relative">
                {/* 📌 Sticky Table Head */}
                <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-extrabold text-slate-600 uppercase tracking-wider w-20 border-b border-gray-200">Roll No</th>
                    <th className="px-6 py-3.5 text-left text-xs font-extrabold text-slate-600 uppercase tracking-wider border-b border-gray-200">Student Name & Info</th>
                    <th className="px-6 py-3.5 text-center text-xs font-extrabold text-indigo-700 uppercase tracking-wider w-48 border-b border-gray-200 bg-indigo-50">Marks Obtained</th>
                    <th className="px-6 py-3.5 text-left text-xs font-extrabold text-slate-600 uppercase tracking-wider w-64 border-b border-gray-200">Remarks / Note</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {students.map((student, index) => {
                    const markData = data.marks.find(m => m.student_id === student.id);
                    if(!markData) return null;

                    return (
                      <tr key={student.id} className="hover:bg-indigo-50/40 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-slate-500">
                          {student.current_enrollment?.roll_no || '--'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900 text-base group-hover:text-indigo-700 transition-colors">{student.first_name} {student.last_name}</div>
                          <div className="text-xs font-medium text-slate-500 mt-0.5">ID: {student.admission_no}</div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap bg-indigo-50/30">
                          {/* 🎯 Excel-like Number Input */}
                          <input 
                            type="number"
                            step="0.01"
                            min="0"
                            value={markData.marks_obtained}
                            onChange={(e) => handleMarkChange(student.id, 'marks_obtained', e.target.value)}
                            className="block w-full text-center rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg font-bold text-indigo-700 bg-white hover:bg-gray-50 transition-colors h-11"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          {/* 📝 Note Input */}
                          <input 
                            type="text"
                            value={markData.note}
                            onChange={(e) => handleMarkChange(student.id, 'note', e.target.value)}
                            className="block w-full rounded-md border-gray-200 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-600 bg-slate-50 focus:bg-white transition-colors h-10"
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