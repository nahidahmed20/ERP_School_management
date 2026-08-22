import { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import ExamScheduleFormModal from './Partials/ExamScheduleFormModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ schedules, exams, classes, classrooms, filters }) {
  const { flash } = usePage().props;

  const [examId, setExamId] = useState(filters.exam_id ?? '');
  const [classId, setClassId] = useState(filters.class_id ?? '');
  const [sectionId, setSectionId] = useState(filters.section_id ?? '');

  const [formOpen, setFormOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [showAddExam, setShowAddExam] = useState(false);

  const selectedClassForFilter = classes.find(c => c.id == classId);
  const isFilterApplied = examId && classId && sectionId;

  const examForm = useForm({ name: '', start_date: '', end_date: '' });

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.exams.schedule'), { exam_id: examId, class_id: classId, section_id: sectionId, ...overrides }, { preserveState: true, replace: true });
  }

  function handleCreateExam(e) {
    e.preventDefault();
    examForm.post(route('admin.exams.store'), {
      onSuccess: () => { examForm.reset(); setShowAddExam(false); }
    });
  }

  const handleEditSchedule = () => {
    setEditingConfig({ exam_id: examId, class_id: classId, section_id: sectionId, periods: schedules });
    setFormOpen(true);
  };

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">Exams & Marks</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Exam Schedule & Seating</h1>
            <p className="text-sm text-slate-500 mt-1">পরীক্ষার রুটিন এবং ক্লাসরুম (Seating Plan) তৈরি করুন।</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAddExam(true)}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95"
            >
              <Icon name="plus" className="w-4 h-4 text-slate-500" /> New Exam
            </button>
            <button
              onClick={() => { setEditingConfig(null); setFormOpen(true); }}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/20 active:scale-95"
            >
              <Icon name="calendar" className="w-4 h-4" /> Add Schedule
            </button>
          </div>
        </div>
      }
    >
      <Head title="Exam Schedule" />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        
        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-t-4 border-t-indigo-600">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
            <div>
              <label className={labelClass}>Exam</label>
              <select className={inputClass} value={examId} onChange={(e) => setExamId(e.target.value)}>
                <option value="">Select Exam</option>
                {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Class</label>
              <select className={inputClass} value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(''); }}>
                <option value="">Select Class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Section</label>
              <select className={`${inputClass} disabled:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed`} value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId}>
                <option value="">Select Section</option>
                {selectedClassForFilter?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <button
                className="w-full px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 h-[42px]"
                onClick={() => applyFilters()}
              >
                <Icon name="search" className="w-4 h-4" /> Search Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Result Grid */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
          {isFilterApplied ? (
            <>
              <div className="flex justify-between items-center px-6 py-4 bg-slate-50/70 border-b border-slate-200">
                <h3 className="text-base font-bold text-slate-900">
                  Showing Schedule for <span className="text-indigo-600">{selectedClassForFilter?.name}</span>
                </h3>
                <button
                  onClick={handleEditSchedule}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100 shadow-sm"
                >
                  <Icon name="edit" className="w-3.5 h-3.5" /> Edit Entire Schedule
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Exam Date</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Room & Capacity</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {schedules.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                          <Icon name="calendar" className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                          <p className="text-sm font-semibold">এই ক্লাসের কোনো পরীক্ষার রুটিন নেই।</p>
                        </td>
                      </tr>
                    )}
                    {schedules.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">
                          {new Date(item.exam_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-bold">
                            {item.subject?.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-600">
                          {item.start_time.substring(0,5)} - {item.end_time.substring(0,5)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {item.classroom ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold">
                              <Icon name="home" className="w-3.5 h-3.5 text-slate-400" />
                              {item.classroom.room_number} <span className="text-slate-400">(Cap: {item.classroom.capacity})</span>
                            </span>
                          ) : <span className="text-slate-400 italic text-xs">—</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex"
                            onClick={() => setDeletingItem(item)}
                            title="Delete Schedule"
                          >
                            <Icon name="trash" className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4 border border-slate-100 shadow-sm">
                <Icon name="search" className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">No Schedule Selected</h3>
              <p className="text-slate-500 text-sm">Exam, Class এবং Section সিলেক্ট করে Search করুন।</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Exam Modal */}
      {showAddExam && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all flex flex-col ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900">Create New Exam</h3>
              <button onClick={() => setShowAddExam(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-slate-100">
                <Icon name="close" className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExam}>
              <div className="p-6 space-y-4">
                <div>
                  <label className={labelClass}>Exam Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    className={inputClass}
                    value={examForm.data.name}
                    onChange={e => examForm.setData('name', e.target.value)}
                    required
                    placeholder="e.g., Final Exam 2026"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Start Date</label>
                    <input
                      type="date"
                      className={inputClass}
                      value={examForm.data.start_date}
                      onChange={e => examForm.setData('start_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>End Date</label>
                    <input
                      type="date"
                      className={inputClass}
                      value={examForm.data.end_date}
                      onChange={e => examForm.setData('end_date', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 rounded-b-2xl">
                <button
                  type="button"
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm"
                  onClick={() => setShowAddExam(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95"
                  disabled={examForm.processing}
                >
                  {examForm.processing ? 'Saving...' : 'Save Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {formOpen && <ExamScheduleFormModal editingConfig={editingConfig} exams={exams} classes={classes} classrooms={classrooms} onClose={() => setFormOpen(false)} />}
      
      {deletingItem && (
        <ConfirmDeleteModal 
          item={deletingItem} 
          message="Are you sure you want to delete this schedule?"
          onCancel={() => setDeletingItem(null)} 
          onConfirm={() => { router.delete(route('admin.exams.schedule.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) }); }} 
        />
      )}
    </AuthenticatedLayout>
  );
}