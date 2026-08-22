import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function AssignSubjectModal({ schoolClass, allSubjects, onClose }) {
  const { data, setData, post, processing } = useForm({
    subjects: schoolClass.subjects?.map(s => s.id) || [],
  });

  function toggleSubject(id) {
    if (data.subjects.includes(id)) {
      setData('subjects', data.subjects.filter(s => s !== id));
    } else {
      setData('subjects', [...data.subjects, id]);
    }
  }

  function submit(e) {
    e.preventDefault();
    post(route('admin.classes.assign-subjects', schoolClass.id), {
      onSuccess: () => onClose(),
    });
  }

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden transform transition-all flex flex-col ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Assign Subjects</h3>
            <p className="text-sm text-slate-500 mt-1">Select subjects for <strong className="text-slate-700">{schoolClass.name}</strong></p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-slate-100">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto max-h-[350px] flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allSubjects.map(subject => {
                const isChecked = data.subjects.includes(subject.id);
                return (
                  <label 
                    key={subject.id} 
                    className={`flex items-center gap-3 cursor-pointer group p-3 rounded-xl border transition-all ${
                      isChecked 
                        ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSubject(subject.id)}
                        className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-0 checked:bg-indigo-600 checked:border-indigo-600 cursor-pointer transition-colors"
                      />
                      <svg className="absolute w-3.5 h-3.5 top-[3px] left-[3px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-semibold transition-colors ${isChecked ? 'text-indigo-900' : 'text-slate-700'}`}>
                        {subject.name}
                      </span>
                      {subject.code && <span className="text-[11px] font-mono text-slate-400">({subject.code})</span>}
                    </div>
                  </label>
                );
              })}
              {allSubjects.length === 0 && (
                <div className="col-span-2 text-center py-8 text-slate-400 italic text-sm">
                  No active subjects available.
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} disabled={processing} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95">
              {processing ? 'Saving...' : 'Save Assignments'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}