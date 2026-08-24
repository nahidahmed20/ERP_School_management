import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function HomeworkFormModal({ item, classes, subjects, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    title: item?.title ?? '',
    school_class_id: item?.school_class_id ?? '',
    subject_id: item?.subject_id ?? '',
    homework_date: item?.homework_date ?? new Date().toISOString().split('T')[0],
    submission_date: item?.submission_date ?? '',
    total_marks: item?.total_marks ?? '',
    description: item?.description ?? '',
    document: null, // For File Upload
    is_active: item?.is_active ?? true,
    _method: isEdit ? 'put' : 'post', 
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };

    if (isEdit) {
        post(route('admin.lms.homework.update', item.id), options);
    } else {
        post(route('admin.lms.homework.store'), options);
    }
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
            <h3 className="text-xl font-bold text-slate-900">
              {isEdit ? 'Edit Homework' : 'Add New Homework'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">Create assignments, set deadlines, and attach files.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden" encType="multipart/form-data">
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

              {/* Title */}
              <div className="sm:col-span-2">
                <label className={labelClass}>Homework Title / Topic <span className="text-rose-500">*</span></label>
                <input 
                  value={data.title} 
                  onChange={(e) => setData('title', e.target.value)} 
                  autoFocus 
                  required 
                  placeholder="e.g. Essay Writing on Environment" 
                  className={inputClass}
                />
                {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
              </div>

              {/* Class */}
              <div>
                <label className={labelClass}>Target Class <span className="text-rose-500">*</span></label>
                <select value={data.school_class_id} onChange={(e) => setData('school_class_id', e.target.value)} required className={`${inputClass} bg-white`}>
                  <option value="" disabled>Select Class</option>
                  {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.school_class_id && <p className="text-rose-500 text-xs mt-1">{errors.school_class_id}</p>}
              </div>

              {/* Subject */}
              <div>
                <label className={labelClass}>Subject <span className="text-rose-500">*</span></label>
                <select value={data.subject_id} onChange={(e) => setData('subject_id', e.target.value)} required className={`${inputClass} bg-white`}>
                  <option value="" disabled>Select Subject</option>
                  {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {errors.subject_id && <p className="text-rose-500 text-xs mt-1">{errors.subject_id}</p>}
              </div>

              {/* Dates */}
              <div>
                <label className={labelClass}>Homework Date (Given) <span className="text-rose-500">*</span></label>
                <input 
                  type="date" 
                  value={data.homework_date} 
                  onChange={(e) => setData('homework_date', e.target.value)} 
                  required 
                  className={`${inputClass} font-mono`}
                />
                {errors.homework_date && <p className="text-rose-500 text-xs mt-1">{errors.homework_date}</p>}
              </div>

              <div>
                <label className={labelClass}>Submission Deadline <span className="text-rose-500">*</span></label>
                <input 
                  type="date" 
                  value={data.submission_date} 
                  onChange={(e) => setData('submission_date', e.target.value)} 
                  required 
                  className={`${inputClass} font-mono`}
                />
                {errors.submission_date && <p className="text-rose-500 text-xs mt-1">{errors.submission_date}</p>}
              </div>

              {/* Marks */}
              <div>
                <label className={labelClass}>Total Marks (Optional)</label>
                <input 
                  type="number" 
                  value={data.total_marks} 
                  onChange={(e) => setData('total_marks', e.target.value)} 
                  min="0" 
                  step="0.5" 
                  placeholder="e.g. 50"
                  className={`${inputClass} font-mono font-bold text-indigo-600`}
                />
              </div>

              {/* Upload Attachment */}
              <div className="sm:col-span-2">
                <label className={labelClass}>Attachment (PDF / Image / Zip) <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip" 
                  onChange={(e) => setData('document', e.target.files[0])} 
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all border border-slate-200 rounded-xl bg-slate-50 cursor-pointer"
                />
                {errors.document && <p className="text-rose-500 text-xs mt-1">{errors.document}</p>}
                {isEdit && item.document_path && (
                  <div className="mt-2 flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 w-max">
                    <Icon name="check-circle" className="w-4 h-4" /> A file is already attached. Upload a new one to replace it.
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className={labelClass}>Homework Description / Details</label>
                <textarea 
                  rows="4" 
                  value={data.description} 
                  onChange={(e) => setData('description', e.target.value)} 
                  placeholder="Write homework instructions, questions or guidelines here..." 
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
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-0 checked:bg-indigo-600 checked:border-indigo-600 cursor-pointer transition-colors"
                    />
                    <svg className="absolute w-3.5 h-3.5 top-[3px] left-[3px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Active Status (Visible to students)</span>
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
              {processing ? 'Saving...' : (isEdit ? 'Update Homework' : 'Save Homework')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}