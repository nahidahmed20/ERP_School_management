import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function AttemptFormModal({ item, exams, students, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    online_exam_id: item?.online_exam_id ?? '',
    student_id: item?.student_id ?? '',
    attempt_date: item?.attempt_date ?? new Date().toISOString().split('T')[0],
    obtained_marks: item?.obtained_marks ?? '',
    status: item?.status ?? 'Pending Evaluation',
    admin_remarks: item?.admin_remarks ?? '',
  });

  const handleMarksChange = (e) => {
    const marks = parseFloat(e.target.value) || 0;
    const selectedExam = exams.find(ex => ex.id == data.online_exam_id);

    let newStatus = data.status;
    if (selectedExam) {
        newStatus = marks >= selectedExam.passing_marks ? 'Passed' : 'Failed';
    }

    setData(prev => ({
        ...prev,
        obtained_marks: marks,
        status: newStatus
    }));
  };

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.lms.quizattempts.update', item.id), options);
    else post(route('admin.lms.quizattempts.store'), options);
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      
      {/* Responsive Modal Box */}
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Evaluate / Edit Result' : 'Manual Result Entry'}</h3>
            <p className="text-sm text-slate-500 mt-1">Record marks, assign status, and provide feedback.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="sm:col-span-2">
                <label className={labelClass}>Assign to Campus <span className="text-rose-500">*</span></label>
                <select 
                  value={data.campus_id || ''} 
                  onChange={(e) => setData('campus_id', e.target.value)} 
                  disabled={!isSuperAdmin} 
                  required 
                  className={`${inputClass} ${!isSuperAdmin ? 'bg-slate-100 opacity-70' : 'bg-white'}`}
                >
                  <option value="" disabled>Select Campus</option>
                  {campuses?.map(campus => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
                </select>
                {errors.campus_id && <p className="text-rose-500 text-xs mt-1">{errors.campus_id}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Select Exam <span className="text-rose-500">*</span></label>
                <select value={data.online_exam_id} onChange={(e) => setData('online_exam_id', e.target.value)} disabled={isEdit} required className={`${inputClass} ${isEdit ? 'bg-slate-100 opacity-70' : 'bg-white'}`}>
                  <option value="" disabled>-- Choose Exam --</option>
                  {exams?.map(e => <option key={e.id} value={e.id}>{e.title} (Total: {e.total_marks}, Pass: {e.passing_marks})</option>)}
                </select>
                {errors.online_exam_id && <p className="text-rose-500 text-xs mt-1">{errors.online_exam_id}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Select Student <span className="text-rose-500">*</span></label>
                <select value={data.student_id} onChange={(e) => setData('student_id', e.target.value)} disabled={isEdit} required className={`${inputClass} ${isEdit ? 'bg-slate-100 opacity-70' : 'bg-white'}`}>
                  <option value="" disabled>-- Search Student --</option>
                  {students?.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                </select>
                {errors.student_id && <p className="text-rose-500 text-xs mt-1">{errors.student_id}</p>}
              </div>

              <div>
                <label className={labelClass}>Attempt Date <span className="text-rose-500">*</span></label>
                <input 
                  type="date" 
                  value={data.attempt_date} 
                  onChange={(e) => setData('attempt_date', e.target.value)} 
                  required 
                  className={`${inputClass} font-mono`} 
                />
                {errors.attempt_date && <p className="text-rose-500 text-xs mt-1">{errors.attempt_date}</p>}
              </div>

              <div>
                <label className={labelClass}>Obtained Marks <span className="text-rose-500">*</span></label>
                <input 
                  type="number" 
                  value={data.obtained_marks} 
                  onChange={handleMarksChange} 
                  min="0" 
                  step="0.01" 
                  required 
                  className={`${inputClass} font-mono font-bold text-indigo-600`} 
                />
                {errors.obtained_marks && <p className="text-rose-500 text-xs mt-1">{errors.obtained_marks}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Status</label>
                <select value={data.status} onChange={(e) => setData('status', e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                  <option value="Pending Evaluation">Pending Evaluation</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Teacher Remarks / Feedback</label>
                <textarea 
                  rows="3" 
                  value={data.admin_remarks} 
                  onChange={(e) => setData('admin_remarks', e.target.value)} 
                  placeholder="Provide feedback to the student..." 
                  className={`${inputClass} resize-none`} 
                />
              </div>

            </div>
          </div>

          {/* Footer - Stacked on Mobile, Row on Desktop */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95">
              <Icon name="save" className="w-4 h-4" />
              {processing ? 'Saving...' : (isEdit ? 'Update Result' : 'Save Entry')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}