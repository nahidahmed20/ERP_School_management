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
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000 });
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

  // Shared Form Input Classes
  const selectClass = "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm";
  const inputClass = "block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm";

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Exams & Marks</span>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Exam Schedule & Seating</h1>
            <p className="mt-1 text-sm text-gray-500">পরীক্ষার রুটিন এবং ক্লাসরুম (Seating Plan) তৈরি করুন।</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              onClick={() => setShowAddExam(true)}
            >
              <Icon name="plus" className="w-4 h-4" /> New Exam
            </button>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              onClick={() => { setEditingConfig(null); setFormOpen(true); }}
            >
              <Icon name="calendar" className="w-4 h-4" /> Add Schedule
            </button>
          </div>
        </div>
      }
    >
      <Head title="Exam Schedule" />

      <div className=" mx-auto sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="w-full sm:w-1/4">
              <label className="block text-xs font-medium text-gray-700 mb-1">Exam</label>
              <select className={selectClass} value={examId} onChange={(e) => setExamId(e.target.value)}>
                <option value="">Select Exam</option>
                {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div className="w-full sm:w-1/4">
              <label className="block text-xs font-medium text-gray-700 mb-1">Class</label>
              <select className={selectClass} value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(''); }}>
                <option value="">Select Class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="w-full sm:w-1/4">
              <label className="block text-xs font-medium text-gray-700 mb-1">Section</label>
              <select className={selectClass} value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId}>
                <option value="">Select Section</option>
                {selectedClassForFilter?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="w-full sm:w-1/4">
              <button
                className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-800 border border-transparent rounded-md shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors"
                onClick={() => applyFilters()}
              >
                <Icon name="search" className="w-4 h-4" /> Search Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Result Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {isFilterApplied ? (
            <>
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-lg font-semibold text-gray-800">
                  Showing Schedule for <span className="text-indigo-600">{selectedClassForFilter?.name}</span>
                </h3>
                <button
                  onClick={handleEditSchedule}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 transition-colors"
                >
                  <Icon name="edit" className="w-4 h-4" /> Edit Entire Schedule
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room & Capacity</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {schedules.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          <Icon name="calendar" className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                          <p>এই ক্লাসের কোনো পরীক্ষার রুটিন নেই।</p>
                        </td>
                      </tr>
                    )}
                    {schedules.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">
                          {new Date(item.exam_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {item.subject?.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                          {item.start_time.substring(0,5)} - {item.end_time.substring(0,5)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {item.classroom ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                              <Icon name="home" className="w-3.5 h-3.5 text-slate-400" />
                              {item.classroom.room_number} <span className="text-xs text-slate-400 ml-1">(Cap: {item.classroom.capacity})</span>
                            </span>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors inline-flex"
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
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                <Icon name="search" className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">No Schedule Selected</h3>
              <p className="text-slate-500">Exam, Class এবং Section সিলেক্ট করে Search করুন।</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Exam Modal */}
      {showAddExam && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowAddExam(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal Panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">Create New Exam</h3>
                  <button className="text-gray-400 hover:text-gray-500 focus:outline-none" onClick={() => setShowAddExam(false)}>
                    <Icon name="close" className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateExam} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Exam Name</label>
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
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="date"
                        className={inputClass}
                        value={examForm.data.start_date}
                        onChange={e => examForm.setData('start_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Date</label>
                      <input
                        type="date"
                        className={inputClass}
                        value={examForm.data.end_date}
                        onChange={e => examForm.setData('end_date', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                      disabled={examForm.processing}
                    >
                      Save Exam
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setShowAddExam(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {formOpen && <ExamScheduleFormModal editingConfig={editingConfig} exams={exams} classes={classes} classrooms={classrooms} onClose={() => setFormOpen(false)} />}
      {deletingItem && <ConfirmDeleteModal item={deletingItem} onCancel={() => setDeletingItem(null)} onConfirm={() => { router.delete(route('admin.exams.schedule.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) }); }} />}
    </AuthenticatedLayout>
  );
}
