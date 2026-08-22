import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function ExamFormModal({ item, activeCampusId, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    name: item?.name || '',
    start_date: item?.start_date ? item.start_date.substring(0, 10) : '',
    end_date: item?.end_date ? item.end_date.substring(0, 10) : '',
    description: item?.description || '',
    is_active: item?.is_active ?? true,
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };

    if (isEdit) {
      put(route('admin.exams.update', item.id), options);
    } else {
      post(route('admin.exams.store'), options);
    }
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] shadow-2xl overflow-hidden transform transition-all flex flex-col ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {isEdit ? 'Edit Exam' : 'Add New Exam'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">পরীক্ষার নাম এবং সময়সীমা কনফিগার করুন।</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-slate-100">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Exam Name */}
              <div className="sm:col-span-2">
                <label className={labelClass}>Exam Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  className={inputClass}
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="যেমন: Term 1 Examination 2026"
                  autoFocus
                  required
                />
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Start Date */}
              <div>
                <label className={labelClass}>Start Date <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input
                  type="date"
                  className={inputClass}
                  value={data.start_date}
                  onChange={(e) => setData('start_date', e.target.value)}
                />
                {errors.start_date && <p className="text-rose-500 text-xs mt-1">{errors.start_date}</p>}
              </div>

              {/* End Date */}
              <div>
                <label className={labelClass}>End Date <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input
                  type="date"
                  className={inputClass}
                  value={data.end_date}
                  onChange={(e) => setData('end_date', e.target.value)}
                />
                {errors.end_date && <p className="text-rose-500 text-xs mt-1">{errors.end_date}</p>}
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className={labelClass}>Description <span className="text-slate-400 font-normal">(Optional)</span></label>
                <textarea
                  rows="3"
                  className={`${inputClass} resize-none`}
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="পরীক্ষা সম্পর্কে অতিরিক্ত তথ্য..."
                />
                {errors.description && <p className="text-rose-500 text-xs mt-1">{errors.description}</p>}
              </div>

              {/* Active Status Checkbox */}
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
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                    Active — এই পরীক্ষাটি Exam Schedule ফর্মে সিলেক্ট করার জন্য দেখানো হবে
                  </span>
                </label>
              </div>

            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} disabled={processing} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95">
              {processing ? 'Saving...' : (isEdit ? 'Update Exam' : 'Save Exam')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}