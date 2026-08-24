import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function QuestionFormModal({ item, classes, subjects, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    school_class_id: item?.school_class_id ?? '',
    subject_id: item?.subject_id ?? '',
    question_type: item?.question_type ?? 'MCQ',
    question: item?.question ?? '',
    option_a: item?.option_a ?? '',
    option_b: item?.option_b ?? '',
    option_c: item?.option_c ?? '',
    option_d: item?.option_d ?? '',
    correct_answer: item?.correct_answer ?? 'a',
    marks: item?.marks ?? 1,
    explanation: item?.explanation ?? '',
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.lms.questions.update', item.id), options);
    else post(route('admin.lms.questions.store'), options);
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
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Question' : 'Add New Question'}</h3>
            <p className="text-sm text-slate-500 mt-1">Create questions for online exams and quizzes.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Campus Selection */}
              <div className="sm:col-span-2">
                <label className={labelClass}>Campus <span className="text-rose-500">*</span></label>
                <select 
                  value={data.campus_id || ''} 
                  onChange={(e) => setData('campus_id', e.target.value)} 
                  disabled={!isSuperAdmin}
                  className={`${inputClass} ${!isSuperAdmin ? 'bg-slate-100 opacity-70' : 'bg-white'}`}
                  required
                >
                  <option value="" disabled>Select Campus</option>
                  {campuses?.map(campus => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
                </select>
                {errors.campus_id && <p className="text-rose-500 text-xs mt-1">{errors.campus_id}</p>}
              </div>

              {/* Class & Subject */}
              <div>
                <label className={labelClass}>Target Class <span className="text-rose-500">*</span></label>
                <select value={data.school_class_id} onChange={(e) => setData('school_class_id', e.target.value)} required className={`${inputClass} bg-white`}>
                  <option value="" disabled>Select Class</option>
                  {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.school_class_id && <p className="text-rose-500 text-xs mt-1">{errors.school_class_id}</p>}
              </div>

              <div>
                <label className={labelClass}>Subject <span className="text-rose-500">*</span></label>
                <select value={data.subject_id} onChange={(e) => setData('subject_id', e.target.value)} required className={`${inputClass} bg-white`}>
                  <option value="" disabled>Select Subject</option>
                  {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {errors.subject_id && <p className="text-rose-500 text-xs mt-1">{errors.subject_id}</p>}
              </div>

              {/* Question Text */}
              <div className="sm:col-span-2">
                <label className={labelClass}>Question Details <span className="text-rose-500">*</span></label>
                <textarea 
                  rows="3" 
                  value={data.question} 
                  onChange={(e) => setData('question', e.target.value)} 
                  required 
                  placeholder="Type your question here..." 
                  className={`${inputClass} resize-none font-medium`} 
                />
                {errors.question && <p className="text-rose-500 text-xs mt-1">{errors.question}</p>}
              </div>

              {/* Type & Marks */}
              <div>
                <label className={labelClass}>Question Type</label>
                <select value={data.question_type} onChange={(e) => setData('question_type', e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="MCQ">Multiple Choice (MCQ)</option>
                  <option value="True/False">True / False</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Marks <span className="text-rose-500">*</span></label>
                <input 
                  type="number" 
                  value={data.marks} 
                  onChange={(e) => setData('marks', e.target.value)} 
                  min="0.1" 
                  step="0.1" 
                  required 
                  className={`${inputClass} font-mono font-bold text-emerald-600`} 
                />
              </div>

              {/* MCQ Options Block */}
              {data.question_type === 'MCQ' && (
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                  <div className="sm:col-span-2 font-bold text-slate-800 text-sm border-b border-slate-200 pb-2 mb-2">MCQ Options:</div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Option A</label>
                    <input value={data.option_a} onChange={(e) => setData('option_a', e.target.value)} placeholder="A" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Option B</label>
                    <input value={data.option_b} onChange={(e) => setData('option_b', e.target.value)} placeholder="B" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Option C</label>
                    <input value={data.option_c} onChange={(e) => setData('option_c', e.target.value)} placeholder="C" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Option D</label>
                    <input value={data.option_d} onChange={(e) => setData('option_d', e.target.value)} placeholder="D" className={inputClass} />
                  </div>
                </div>
              )}

              {/* Correct Answer Dropdown */}
              <div className="sm:col-span-2">
                <label className={labelClass}>Correct Answer <span className="text-rose-500">*</span></label>
                <select value={data.correct_answer} onChange={(e) => setData('correct_answer', e.target.value)} required className={`${inputClass} bg-indigo-50 font-bold text-indigo-700 border-indigo-200`}>
                  {data.question_type === 'MCQ' ? (
                    <>
                      <option value="a">Option A</option>
                      <option value="b">Option B</option>
                      <option value="c">Option C</option>
                      <option value="d">Option D</option>
                    </>
                  ) : (
                    <>
                      <option value="True">True</option>
                      <option value="False">False</option>
                    </>
                  )}
                </select>
              </div>

              {/* Explanation */}
              <div className="sm:col-span-2">
                <label className={labelClass}>Explanation (Optional)</label>
                <textarea 
                  rows="2" 
                  value={data.explanation} 
                  onChange={(e) => setData('explanation', e.target.value)} 
                  placeholder="Explain why this answer is correct..." 
                  className={`${inputClass} resize-none`} 
                />
              </div>

              {/* Active Status Toggle */}
              <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer group w-max">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={data.is_active}
                      onChange={(e) => setData('is_active', e.target.checked)}
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-0 checked:bg-emerald-600 checked:border-emerald-600 cursor-pointer transition-colors"
                    />
                    <svg className="absolute w-3.5 h-3.5 top-[3px] left-[3px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Active Question</span>
                </label>
              </div>

            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95">
              <Icon name="save" className="w-4 h-4" />
              {processing ? 'Saving...' : (isEdit ? 'Update Question' : 'Save Question')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}