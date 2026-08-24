import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function ExamQuestionFormModal({ exams, questions, defaultExamId, onClose }) {

  const { data, setData, post, processing, errors, reset } = useForm({
    online_exam_id: defaultExamId || '',
    question_bank_id: '',
  });

  const selectedExam = exams.find(e => e.id == data.online_exam_id);

  const filteredQuestions = questions.filter(q => {
    if (!selectedExam) return true;
    return q.school_class_id === selectedExam.school_class_id && q.subject_id === selectedExam.subject_id;
  });

  function submit(e) {
    e.preventDefault();
    post(route('admin.lms.exam-questions.store'), {
      onSuccess: () => {
        reset('question_bank_id');
      }
    });
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
            <h3 className="text-xl font-bold text-slate-900">Assign Question to Exam</h3>
            <p className="text-sm text-slate-500 mt-1">Select an exam and assign questions from the question bank.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
            
            <div className="grid grid-cols-1 gap-5">
              
              {/* Select Exam */}
              <div>
                <label className={labelClass}>Select Online Exam <span className="text-rose-500">*</span></label>
                <select 
                  value={data.online_exam_id} 
                  onChange={(e) => setData('online_exam_id', e.target.value)} 
                  required
                  className={`${inputClass} bg-white`}
                >
                  <option value="" disabled>-- Choose Exam --</option>
                  {exams?.map(exam => <option key={exam.id} value={exam.id}>{exam.title}</option>)}
                </select>
                {errors.online_exam_id && <p className="text-rose-500 text-xs mt-1">{errors.online_exam_id}</p>}
              </div>

              {/* Notice Banner */}
              {selectedExam && (
                <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl flex items-start gap-3">
                  <Icon name="info" className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-indigo-900">
                    Showing available questions for <strong className="font-bold text-indigo-700">Class {selectedExam.school_class_id}</strong> (Subject ID: {selectedExam.subject_id}).
                    <br/><span className="text-xs text-indigo-500 mt-1 block">Only questions matching the exam's class and subject are displayed below.</span>
                  </div>
                </div>
              )}

              {/* Select Question */}
              <div>
                <label className={labelClass}>Select Question from Bank <span className="text-rose-500">*</span></label>
                <select 
                  value={data.question_bank_id} 
                  onChange={(e) => setData('question_bank_id', e.target.value)} 
                  required
                  className={`${inputClass} bg-white h-[180px]`}
                  size="6" // Shows multiple options at once
                >
                  <option value="" disabled>-- Select a Question --</option>
                  {filteredQuestions?.map(q => (
                    <option key={q.id} value={q.id} className="py-2 px-1 border-b border-slate-100 text-sm">
                      [{q.question_type} - {q.marks} Marks] {q.question.substring(0, 100)}{q.question.length > 100 ? '...' : ''}
                    </option>
                  ))}
                </select>
                {errors.question_bank_id && <p className="text-rose-500 text-xs mt-1">{errors.question_bank_id}</p>}
                
                {filteredQuestions.length === 0 && selectedExam && (
                  <p className="text-rose-600 text-xs font-semibold mt-2 flex items-center gap-1">
                    <Icon name="alert-circle" className="w-4 h-4" /> No questions found in the Question Bank for this Subject and Class!
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-all shadow-sm">
              Close
            </button>
            <button type="submit" disabled={processing || filteredQuestions.length === 0} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95">
              <Icon name="check-circle" className="w-4 h-4" />
              {processing ? 'Assigning...' : 'Assign Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}