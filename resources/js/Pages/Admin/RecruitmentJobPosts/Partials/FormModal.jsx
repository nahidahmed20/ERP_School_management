import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors } = useForm({
    title: item?.title || '',
    department: item?.department || '',
    employment_type: item?.employment_type || 'Full-time',
    vacancies: item?.vacancies || 1,
    deadline: item?.deadline || '',
    description: item?.description || '',
    status: item?.status || 'Open',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route('admin.recruitment.job-posts.update', item.id), {
        onSuccess: () => onClose(),
      });
    } else {
      post(route('admin.recruitment.job-posts.store'), {
        onSuccess: () => onClose(),
      });
    }
  };

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="mm-modal-overlay" onClick={onClose}>
      <div 
        className="mm-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ padding: 0, overflow: 'hidden', maxWidth: '36rem', width: '100%' }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Job Post' : 'Create Job Post'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure recruitment details and requirements.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]">
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div>
                <label className={labelClass}>Job Title <span className="text-rose-500">*</span></label>
                <input 
                  value={data.title} 
                  onChange={(e) => setData('title', e.target.value)} 
                  placeholder="e.g. Senior Math Teacher" 
                  className={inputClass} 
                  required 
                  autoFocus
                />
                {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className={labelClass}>Department</label>
                <input 
                  value={data.department} 
                  onChange={(e) => setData('department', e.target.value)} 
                  placeholder="e.g. Science" 
                  className={inputClass} 
                />
                {errors.department && <p className="text-rose-500 text-xs mt-1">{errors.department}</p>}
              </div>

              <div>
                <label className={labelClass}>Employment Type <span className="text-rose-500">*</span></label>
                <select value={data.employment_type} onChange={(e) => setData('employment_type', e.target.value)} required className={inputClass}>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contractual">Contractual</option>
                </select>
                {errors.employment_type && <p className="text-rose-500 text-xs mt-1">{errors.employment_type}</p>}
              </div>

              <div>
                <label className={labelClass}>Vacancies <span className="text-rose-500">*</span></label>
                <input 
                  type="number" 
                  min="1" 
                  value={data.vacancies} 
                  onChange={(e) => setData('vacancies', e.target.value)} 
                  className={`${inputClass} font-mono`} 
                  required 
                />
                {errors.vacancies && <p className="text-rose-500 text-xs mt-1">{errors.vacancies}</p>}
              </div>

              <div>
                <label className={labelClass}>Application Deadline <span className="text-rose-500">*</span></label>
                <input 
                  type="date" 
                  value={data.deadline} 
                  onChange={(e) => setData('deadline', e.target.value)} 
                  className={`${inputClass} font-mono`} 
                  required 
                />
                {errors.deadline && <p className="text-rose-500 text-xs mt-1">{errors.deadline}</p>}
              </div>

              <div>
                <label className={labelClass}>Status <span className="text-rose-500">*</span></label>
                <select value={data.status} onChange={(e) => setData('status', e.target.value)} required className={inputClass}>
                  <option value="Open">Open (আবেদন গ্রহণ চলছে)</option>
                  <option value="Closed">Closed (আবেদন বন্ধ)</option>
                </select>
                {errors.status && <p className="text-rose-500 text-xs mt-1">{errors.status}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Job Description / Requirements</label>
                <textarea 
                  rows="5" 
                  value={data.description} 
                  onChange={(e) => setData('description', e.target.value)} 
                  placeholder="শিক্ষাগত যোগ্যতা, অভিজ্ঞতা এবং দায়িত্বসমূহ..." 
                  className={`${inputClass} resize-none`} 
                />
                {errors.description && <p className="text-rose-500 text-xs mt-1">{errors.description}</p>}
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
              <Icon name="save" className="w-4 h-4" />
              {processing ? 'Saving...' : 'Save Job Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}