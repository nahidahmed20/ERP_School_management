import { useState, useEffect } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Swal from 'sweetalert2';

const CheckMark = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

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
      <div className="mke-scope" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <style>{`
          @media (min-width: 768px) { .mke-header-row { flex-direction: row !important; align-items: center !important; } }
        `}</style>
        <div className="mke-header-row" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
          <div>
            <span className="mke-eyebrow">Examinations</span>
            <h1 className="mke-title">Subject Marks Entry</h1>
          </div>
          <div className="mke-tip">
            <Icon name="info" style={{ width: '16px', color: 'var(--mke-brass)', flexShrink: 0 }} />
            <span>Press <strong>Tab</strong> or <strong>Arrows</strong> to navigate quickly</span>
          </div>
        </div>
      </div>
    }>
      <Head title="Marks Entry" />

      <div className="mke-scope mke-page">
        <style>{`
          .mke-scope {
            --mke-ink: #16213A; --mke-ink-soft: #56647B; --mke-forest: #21402F; --mke-forest-dark: #142720;
            --mke-brass: #AD7F35; --mke-brass-soft: #F1E4C8; --mke-mist: #EEF1EA; --mke-paper: #FFFFFF;
            --mke-brick: #A6402C; --mke-brick-soft: #F3DCD5; --mke-line: #DCE2D8; --mke-radius: 16px;
            --mke-font-display: 'Fraunces', Georgia, serif; --mke-font-body: 'Public Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            --mke-font-mono: 'JetBrains Mono', ui-monospace, monospace;
            font-family: var(--mke-font-body); color: var(--mke-ink);
          }
          .mke-scope *, .mke-scope *::before, .mke-scope *::after { box-sizing: border-box; }

          .mke-page { width: 100%; max-width: 1600px; margin: 0 auto; padding: 0 16px 32px; display: flex; flex-direction: column; gap: 24px; }
          @media (min-width: 640px) { .mke-page { padding: 0 24px 32px; } }
          @media (min-width: 1024px) { .mke-page { padding: 0 32px 32px; } }

          .mke-eyebrow { font-family: var(--mke-font-mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--mke-brass); font-weight: 600; display: inline-flex; align-items: center; gap: 8px; margin-bottom: 6px; }
          .mke-eyebrow::before { content: ''; width: 16px; height: 1px; background: var(--mke-brass); display: inline-block; }
          .mke-title { font-family: var(--mke-font-display); font-size: 26px; font-weight: 600; color: var(--mke-forest-dark); margin: 0; letter-spacing: -0.01em; }

          .mke-tip { font-size: 13.5px; color: var(--mke-ink-soft); background: var(--mke-paper); padding: 11px 16px; border-radius: 10px; box-shadow: 0 2px 8px -2px rgba(20,39,32,0.1); border: 1px solid var(--mke-line); display: flex; align-items: center; gap: 10px; }
          .mke-tip strong { color: var(--mke-forest-dark); }

          .mke-settings-card { background: var(--mke-mist); border: 1px solid var(--mke-line); border-radius: 12px; padding: 20px; }
          .mke-settings-head { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
          .mke-icon-chip { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: var(--mke-forest); color: #fff; flex-shrink: 0; }
          .mke-settings-label { font-family: var(--mke-font-display); font-size: 15px; font-weight: 600; color: var(--mke-forest-dark); }
          .mke-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 16px; align-items: end; }

          .mke-field-label { display: block; font-size: 12.5px; font-weight: 600; color: var(--mke-ink-soft); margin-bottom: 7px; letter-spacing: 0.01em; }
          .mke-req { color: var(--mke-brick); margin-left: 2px; }

          .mke-input { width: 100%; padding: 10px 13px; font-size: 14px; font-family: var(--mke-font-body); color: var(--mke-ink); border: 1.5px solid var(--mke-line); border-radius: 8px; background: #fff; outline: none; cursor: pointer; transition: border-color .15s, box-shadow .15s; }
          .mke-input:focus { border-color: var(--mke-brass); box-shadow: 0 0 0 3px rgba(173,127,53,0.16); }
          .mke-input:disabled { opacity: .5; cursor: not-allowed; color: var(--mke-ink-soft); }

          .mke-load-btn { width: 100%; display: flex; justify-content: center; align-items: center; gap: 9px; padding: 11px 18px; font-size: 14px; font-weight: 700; color: #fff; background: linear-gradient(135deg, var(--mke-forest), var(--mke-forest-dark)); border: none; border-radius: 9px; cursor: pointer; box-shadow: 0 6px 16px -4px rgba(20,39,32,0.4); transition: transform .15s; }
          .mke-load-btn:hover { transform: translateY(-1px); }

          .mke-table-card { background: var(--mke-paper); border: 1px solid var(--mke-line); border-radius: var(--mke-radius); box-shadow: 0 20px 40px -16px rgba(20,39,32,0.18); display: flex; flex-direction: column; overflow: hidden; max-height: calc(100vh - 280px); }
          .mke-table-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 14px; padding: 18px 24px; background: var(--mke-mist); border-bottom: 1px solid var(--mke-line); flex-shrink: 0; }
          .mke-table-head-left { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
          .mke-table-head-right { display: flex; align-items: center; gap: 12px; }
          .mke-list-title { font-family: var(--mke-font-display); font-size: 18px; font-weight: 600; color: var(--mke-forest-dark); margin: 0; }
          .mke-badge { font-size: 11.5px; font-weight: 700; padding: 5px 12px; border-radius: 20px; display: inline-flex; align-items: center; gap: 6px; letter-spacing: 0.01em; }
          .mke-badge.brass { background: var(--mke-brass-soft); color: #7A5A22; }
          .mke-badge.forest { background: #DCE9DF; color: var(--mke-forest-dark); }

          .mke-clear-btn { display: flex; align-items: center; gap: 8px; padding: 9px 16px; font-size: 13.5px; font-weight: 600; color: var(--mke-brick); background: var(--mke-brick-soft); border: 1px solid #E8C3B7; border-radius: 9px; cursor: pointer; transition: background .15s; }
          .mke-clear-btn:hover { background: #E8C3B7; }

          .mke-save-btn { display: flex; align-items: center; gap: 9px; padding: 11px 22px; font-size: 14px; font-weight: 700; color: #fff; background: linear-gradient(135deg, var(--mke-forest), var(--mke-forest-dark)); border: none; border-radius: 9px; cursor: pointer; box-shadow: 0 6px 16px -4px rgba(20,39,32,0.4); transition: transform .15s; }
          .mke-save-btn:hover:not(:disabled) { transform: translateY(-1px); }
          .mke-save-btn:disabled { opacity: .65; cursor: not-allowed; transform: none; }
          .mke-seal { width: 18px; height: 18px; border-radius: 50%; background: var(--mke-brass); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #fff; }

          .mke-table-scroll { overflow: auto; flex: 1; }
          .mke-table { min-width: 100%; border-collapse: collapse; }
          .mke-th { padding: 14px 24px; text-align: left; font-family: var(--mke-font-mono); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--mke-ink-soft); background: var(--mke-mist); border-bottom: 1px solid var(--mke-line); position: sticky; top: 0; z-index: 1; white-space: nowrap; }
          .mke-th.marks { color: #7A5A22; background: var(--mke-brass-soft); text-align: center; }
          .mke-row { border-bottom: 1px solid var(--mke-line); transition: background .15s; }
          .mke-row:hover { background: #FBF7EE; }
          .mke-td { padding: 14px 24px; vertical-align: middle; white-space: nowrap; }
          .mke-roll { font-family: var(--mke-font-mono); font-weight: 700; color: var(--mke-ink-soft); font-size: 13.5px; }
          .mke-student-name { font-family: var(--mke-font-display); font-weight: 600; font-size: 15.5px; color: var(--mke-ink); transition: color .15s; }
          .mke-row:hover .mke-student-name { color: var(--mke-forest); }
          .mke-student-id { font-size: 11.5px; color: var(--mke-ink-soft); margin-top: 2px; font-family: var(--mke-font-mono); }
          .mke-td.marks-cell { background: #FBF6EB; }
          .mke-marks-input { width: 100%; text-align: center; padding: 9px; font-family: var(--mke-font-mono); font-size: 16px; font-weight: 700; color: #7A5A22; border: 1.5px solid var(--mke-line); border-radius: 8px; background: #fff; outline: none; transition: border-color .15s, box-shadow .15s; }
          .mke-marks-input:focus { border-color: var(--mke-brass); box-shadow: 0 0 0 3px rgba(173,127,53,0.16); }
          .mke-note-input { width: 100%; padding: 9px 12px; font-size: 13.5px; color: var(--mke-ink-soft); border: 1.5px solid var(--mke-line); border-radius: 8px; background: var(--mke-mist); outline: none; transition: border-color .15s, box-shadow .15s, background .15s; }
          .mke-note-input:focus { border-color: var(--mke-brass); background: #fff; box-shadow: 0 0 0 3px rgba(173,127,53,0.16); }
        `}</style>

        {/* Filter Card */}
        <div className="mke-settings-card">
          <div className="mke-settings-head">
            <span className="mke-icon-chip"><Icon name="book" style={{ width: '16px' }} /></span>
            <span className="mke-settings-label">Find Students</span>
          </div>

          <form onSubmit={searchStudents} className="mke-grid">
            <div>
              <label className="mke-field-label">Exam <span className="mke-req">*</span></label>
              <select value={data.exam_id} onChange={e => setData('exam_id', e.target.value)} required className="mke-input">
                <option value="">-- Select Exam --</option>
                {exams?.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>

            <div>
              <label className="mke-field-label">Class <span className="mke-req">*</span></label>
              <select value={data.class_id} onChange={e => { setData('class_id', e.target.value); setData('section_id', ''); }} required className="mke-input">
                <option value="">-- Select Class --</option>
                {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="mke-field-label">Section</label>
              <select value={data.section_id} onChange={e => setData('section_id', e.target.value)} disabled={!data.class_id} className="mke-input">
                <option value="">-- All Sections --</option>
                {selectedClass?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="mke-field-label">Subject <span className="mke-req">*</span></label>
              <select value={data.subject_id} onChange={e => setData('subject_id', e.target.value)} required className="mke-input">
                <option value="">-- Select Subject --</option>
                {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <button type="submit" className="mke-load-btn">
                <Icon name="search" style={{ width: '14px' }} /> Load Students
              </button>
            </div>
          </form>
        </div>

        {/* Excel-like Table */}
        {students && students.length > 0 && (
          <form onSubmit={submitMarks} className="mke-table-card">

            <div className="mke-table-head">
              <div className="mke-table-head-left">
                <h3 className="mke-list-title">Student List</h3>
                <span className="mke-badge brass">Total: {students.length}</span>
                {hasSavedMarks && (
                  <span className="mke-badge forest">
                    <Icon name="check" style={{ width: '12px' }} /> Marks Saved
                  </span>
                )}
              </div>

              <div className="mke-table-head-right">
                {hasSavedMarks && (
                  <button type="button" onClick={deleteMarks} className="mke-clear-btn">
                    <Icon name="trash" style={{ width: '14px' }} /> Clear All
                  </button>
                )}
                <button type="submit" disabled={processing} className="mke-save-btn">
                  <span className="mke-seal"><CheckMark /></span>
                  {processing ? 'Saving...' : (hasSavedMarks ? 'Update Marks' : 'Save Marks')}
                </button>
              </div>
            </div>

            <div className="mke-table-scroll">
              <table className="mke-table">
                <thead>
                  <tr>
                    <th className="mke-th">Roll No</th>
                    <th className="mke-th">Student Name &amp; Info</th>
                    <th className="mke-th marks">Marks Obtained</th>
                    <th className="mke-th">Remarks / Note</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => {
                    const markData = data.marks.find(m => m.student_id === student.id);
                    if (!markData) return null;

                    return (
                      <tr key={student.id} className="mke-row">
                        <td className="mke-td mke-roll">
                          {student.current_enrollment?.roll_no || '--'}
                        </td>
                        <td className="mke-td">
                          <div className="mke-student-name">{student.first_name} {student.last_name}</div>
                          <div className="mke-student-id">ID: {student.admission_no}</div>
                        </td>
                        <td className="mke-td marks-cell">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={markData.marks_obtained}
                            onChange={(e) => handleMarkChange(student.id, 'marks_obtained', e.target.value)}
                            className="mke-marks-input"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="mke-td">
                          <input
                            type="text"
                            value={markData.note}
                            onChange={(e) => handleMarkChange(student.id, 'note', e.target.value)}
                            className="mke-note-input"
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