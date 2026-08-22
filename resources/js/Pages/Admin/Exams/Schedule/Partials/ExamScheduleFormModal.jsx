import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

const CheckMark = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function ExamScheduleFormModal({ editingConfig, exams, classes, classrooms, onClose }) {
  const isEdit = !!editingConfig;

  const initialPeriods = isEdit && editingConfig.periods.length > 0
    ? editingConfig.periods.map(p => ({
        subject_id: p.subject_id, classroom_id: p.classroom_id || '',
        exam_date: p.exam_date, start_time: p.start_time.substring(0, 5), end_time: p.end_time.substring(0, 5)
      }))
    : [{ subject_id: '', classroom_id: '', exam_date: '', start_time: '', end_time: '' }];

  const { data, setData, post, processing, errors, reset } = useForm({
    exam_id: editingConfig?.exam_id || '',
    class_id: editingConfig?.class_id || '',
    section_id: editingConfig?.section_id || '',
    periods: initialPeriods,
  });

  const selectedClass = classes.find(c => c.id == data.class_id);
  const availableSections = selectedClass?.sections || [];
  const availableSubjects = selectedClass?.subjects || [];

  const addPeriod = () => setData('periods', [...data.periods, { subject_id: '', classroom_id: '', exam_date: '', start_time: '', end_time: '' }]);
  const removePeriod = (index) => setData('periods', data.periods.filter((_, i) => i !== index));

  const handlePeriodChange = (index, field, value) => {
    const newPeriods = [...data.periods];
    newPeriods[index][field] = value;
    setData('periods', newPeriods);
  };

  function submit(e) {
    e.preventDefault();
    post(route('admin.exams.schedule.bulk-update'), { onSuccess: () => { reset(); onClose(); } });
  }

  const inputClass = "block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-xs font-semibold text-slate-700 mb-1.5";

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden transform transition-all flex flex-col ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Examination Register</span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{isEdit ? 'Edit Exam Schedule' : 'Create Exam Schedule'}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-slate-100">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            
            {/* Exam Assignment Settings Card */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <Icon name="book" className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Exam Assignment</h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Select Exam <span className="text-rose-500">*</span></label>
                  <select
                    className={inputClass}
                    value={data.exam_id}
                    onChange={(e) => setData('exam_id', e.target.value)}
                    required
                    disabled={isEdit}
                  >
                    <option value="" disabled>Select</option>
                    {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                  </select>
                  {errors.exam_id && <p className="text-rose-500 text-xs mt-1">{errors.exam_id}</p>}
                </div>

                <div>
                  <label className={labelClass}>Class <span className="text-rose-500">*</span></label>
                  <select
                    className={inputClass}
                    value={data.class_id}
                    onChange={(e) => setData({ ...data, class_id: e.target.value, section_id: '' })}
                    required
                    disabled={isEdit}
                  >
                    <option value="" disabled>Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.class_id && <p className="text-rose-500 text-xs mt-1">{errors.class_id}</p>}
                </div>

                <div>
                  <label className={labelClass}>Section <span className="text-rose-500">*</span></label>
                  <select
                    className={`${inputClass} disabled:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed`}
                    value={data.section_id}
                    onChange={(e) => setData('section_id', e.target.value)}
                    required
                    disabled={!data.class_id || isEdit}
                  >
                    <option value="" disabled>Select Section</option>
                    {availableSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  {errors.section_id && <p className="text-rose-500 text-xs mt-1">{errors.section_id}</p>}
                </div>
              </div>
            </div>

            {/* Dynamic Subjects / Periods Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Exam Dates &amp; Subjects</h4>
                <button type="button" onClick={addPeriod} className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5">
                  <Icon name="plus" className="w-3.5 h-3.5" /> Add Subject
                </button>
              </div>

              {data.periods.length === 0 && (
                <div className="p-4 text-center text-rose-700 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold mb-4">
                  সব সাবজেক্ট ডিলিট করে দেওয়া হয়েছে। Save করলে এই পরীক্ষার শিডিউল ফাঁকা হয়ে যাবে।
                </div>
              )}

              <div className="space-y-4">
                {data.periods.map((period, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end bg-slate-50/60 p-4 rounded-2xl border border-slate-200 relative">
                    
                    <span className="absolute -top-2.5 left-4 bg-indigo-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <div className="lg:col-span-3">
                      <label className={labelClass}>Subject</label>
                      <select className={inputClass} value={period.subject_id} onChange={(e) => handlePeriodChange(index, 'subject_id', e.target.value)} required>
                        <option value="" disabled>Select</option>
                        {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>

                    <div className="lg:col-span-3">
                      <label className={labelClass}>Date</label>
                      <input className={`${inputClass} font-mono`} type="date" value={period.exam_date} onChange={(e) => handlePeriodChange(index, 'exam_date', e.target.value)} required />
                    </div>

                    <div className="lg:col-span-2">
                      <label className={labelClass}>Room <span className="text-slate-400 font-normal">(Seating)</span></label>
                      <select className={inputClass} value={period.classroom_id} onChange={(e) => handlePeriodChange(index, 'classroom_id', e.target.value)}>
                        <option value="">No Room</option>
                        {classrooms.map(r => <option key={r.id} value={r.id}>{r.room_number}</option>)}
                      </select>
                    </div>

                    <div className="lg:col-span-1.5">
                      <label className={labelClass}>Start Time</label>
                      <input className={`${inputClass} font-mono`} type="time" value={period.start_time} onChange={(e) => handlePeriodChange(index, 'start_time', e.target.value)} required />
                    </div>

                    <div className="lg:col-span-1.5">
                      <label className={labelClass}>End Time</label>
                      <input className={`${inputClass} font-mono`} type="time" value={period.end_time} onChange={(e) => handlePeriodChange(index, 'end_time', e.target.value)} required />
                    </div>

                    <div className="lg:col-span-1 flex justify-end">
                      <button type="button" onClick={() => removePeriod(index)} className="w-full h-[42px] bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-xl transition-all shadow-sm flex items-center justify-center" title="Remove Subject">
                        <Icon name="trash" className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm" onClick={onClose} disabled={processing}>
              Cancel
            </button>
            <button type="submit" className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95" disabled={processing}>
              <span className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-white"><CheckMark /></span>
              {processing ? 'Saving...' : (isEdit ? 'Update Schedule' : 'Save Schedule')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}