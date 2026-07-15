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
  const [showAddExam, setShowAddExam] = useState(false); // Add Exam Modal State

  const selectedClassForFilter = classes.find(c => c.id == classId);
  const isFilterApplied = examId && classId && sectionId;

  // Add Exam Form
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

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Exams & Marks</span>
            <h1>Exam Schedule & Seating</h1>
            <p className="desc">পরীক্ষার রুটিন এবং ক্লাসরুম (Seating Plan) তৈরি করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn btn-outline" onClick={() => setShowAddExam(true)} style={{ marginRight: '10px' }}>
              <Icon name="plus" /> New Exam
            </button>
            <button className="btn" onClick={() => { setEditingConfig(null); setFormOpen(true); }}>
              <Icon name="calendar" /> Add Schedule
            </button>
          </div>
        </div>
      }
    >
      <Head title="Exam Schedule" />

      {/* Filters */}
      <div className="card mm-card" style={{ marginBottom: '20px' }}>
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={examId} onChange={(e) => setExamId(e.target.value)}>
            <option value="">Select Exam</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <select value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(''); }}>
            <option value="">Select Class</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId}>
            <option value="">Select Section</option>
            {selectedClassForFilter?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button className="btn btn-outline" onClick={() => applyFilters()}>Search Schedule</button>
        </div>
      </div>

      {/* Result Grid */}
      <div className="card mm-card">
        {isFilterApplied ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0 }}>Showing Schedule for {selectedClassForFilter?.name}</h3>
              <button onClick={handleEditSchedule} className="btn" style={{ background: '#4f46e5', color: '#fff' }}>
                <Icon name="edit" /> Edit Entire Schedule
              </button>
            </div>
            
            <div className="mm-table-wrap">
              <table className="mm-table">
                <thead>
                  <tr>
                    <th>Exam Date</th>
                    <th>Subject</th>
                    <th>Time</th>
                    <th>Room & Capacity</th>
                    <th className="mm-actions-col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.length === 0 && <tr><td colSpan={5} className="mm-empty">এই ক্লাসের কোনো পরীক্ষার রুটিন নেই।</td></tr>}
                  {schedules.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600, color: '#334155' }}>{new Date(item.exam_date).toLocaleDateString('en-GB')}</td>
                      <td><span className="badge" style={{ background: '#e0e7ff', color: '#3730a3' }}>{item.subject?.name}</span></td>
                      <td style={{ color: '#475569' }}>{item.start_time.substring(0,5)} - {item.end_time.substring(0,5)}</td>
                      <td>
                        {item.classroom ? (
                          <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                            <Icon name="home" style={{ width: '12px' }} /> {item.classroom.room_number} (Cap: {item.classroom.capacity})
                          </span>
                        ) : '—'}
                      </td>
                      <td>
                        <button className="icon-btn icon-btn-danger" onClick={() => setDeletingItem(item)}><Icon name="trash" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <Icon name="search" style={{ width: '40px', margin: '0 auto', color: '#cbd5e1' }} />
            <p style={{ marginTop: '10px' }}>Exam, Class এবং Section সিলেক্ট করে Search করুন।</p>
          </div>
        )}
      </div>

      {/* Add Exam Modal */}
      {showAddExam && (
        <div className="mm-modal-overlay" onClick={() => setShowAddExam(false)}>
          <div className="mm-modal mm-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="mm-modal-head"><h3>Create New Exam</h3><button className="icon-btn" onClick={() => setShowAddExam(false)}><Icon name="close" /></button></div>
            <form onSubmit={handleCreateExam} className="mm-form">
              <div className="mm-form-grid">
                <label style={{ gridColumn: '1 / -1' }}><span>Exam Name</span><input value={examForm.data.name} onChange={e => examForm.setData('name', e.target.value)} required placeholder="e.g., Final Exam 2026" /></label>
                <label><span>Start Date</span><input type="date" value={examForm.data.start_date} onChange={e => examForm.setData('start_date', e.target.value)} /></label>
                <label><span>End Date</span><input type="date" value={examForm.data.end_date} onChange={e => examForm.setData('end_date', e.target.value)} /></label>
              </div>
              <div className="mm-modal-foot"><button type="submit" className="btn" disabled={examForm.processing}>Save Exam</button></div>
            </form>
          </div>
        </div>
      )}

      {formOpen && <ExamScheduleFormModal editingConfig={editingConfig} exams={exams} classes={classes} classrooms={classrooms} onClose={() => setFormOpen(false)} />}
      {deletingItem && <ConfirmDeleteModal item={deletingItem} onCancel={() => setDeletingItem(null)} onConfirm={() => { router.delete(route('admin.exams.schedule.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) }); }} />}
    </AuthenticatedLayout>
  );
}