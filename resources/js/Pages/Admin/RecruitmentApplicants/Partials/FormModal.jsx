import { useForm, router } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, jobPosts, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, processing, errors, reset } = useForm({
    job_post_id: item?.job_post_id || '',
    name: item?.name || '',
    email: item?.email || '',
    phone: item?.phone || '',
    applied_date: item?.applied_date || new Date().toISOString().split('T')[0],
    status: item?.status || 'Pending',
    cover_letter: item?.cover_letter || '',
    resume: null, // For file upload
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      router.post(route('admin.recruitment.applicants.update', item.id), {
        ...data,
        _method: 'PUT',
      }, {
        onSuccess: () => { reset(); onClose(); },
      });
    } else {
      post(route('admin.recruitment.applicants.store'), {
        onSuccess: () => { reset(); onClose(); },
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
        style={{ padding: 0, overflow: 'hidden', maxWidth: '800px', width: '100%' }} 
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Applicant' : 'Add New Applicant'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure candidate details and resume.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]" encType="multipart/form-data">
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="sm:col-span-2">
                <label className={labelClass}>Applied For (Job Post) <span className="text-rose-500">*</span></label>
                <select value={data.job_post_id} onChange={(e) => setData('job_post_id', e.target.value)} required className={inputClass}>
                  <option value="" disabled>-- Select Job Post --</option>
                  {jobPosts.map(job => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))}
                </select>
                {errors.job_post_id && <p className="text-rose-500 text-xs mt-1">{errors.job_post_id}</p>}
              </div>

              <div>
                <label className={labelClass}>Full Name <span className="text-rose-500">*</span></label>
                <input 
                  value={data.name} 
                  onChange={(e) => setData('name', e.target.value)} 
                  placeholder="আবেদনকারীর নাম" 
                  className={inputClass} 
                  required 
                  autoFocus
                />
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className={labelClass}>Phone Number <span className="text-rose-500">*</span></label>
                <input 
                  value={data.phone} 
                  onChange={(e) => setData('phone', e.target.value)} 
                  placeholder="01XXXXXXXXX" 
                  className={`${inputClass} font-mono`} 
                  required 
                />
                {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className={labelClass}>Email Address</label>
                <input 
                  type="email" 
                  value={data.email} 
                  onChange={(e) => setData('email', e.target.value)} 
                  placeholder="example@email.com" 
                  className={inputClass} 
                />
                {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className={labelClass}>Application Date <span className="text-rose-500">*</span></label>
                <input 
                  type="date" 
                  value={data.applied_date} 
                  onChange={(e) => setData('applied_date', e.target.value)} 
                  className={`${inputClass} font-mono`} 
                  required 
                />
                {errors.applied_date && <p className="text-rose-500 text-xs mt-1">{errors.applied_date}</p>}
              </div>

              <div>
                <label className={labelClass}>Status <span className="text-rose-500">*</span></label>
                <select value={data.status} onChange={(e) => setData('status', e.target.value)} required className={inputClass}>
                  <option value="Pending">Pending</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interviewed">Interviewed</option>
                  <option value="Hired">Hired</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Upload Resume / CV <span className="text-slate-400 font-normal">(PDF, DOC, IMG)</span></label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-indigo-400 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Icon name="upload" className="w-6 h-6 text-slate-400 mb-1" />
                    <p className="text-sm text-slate-500 font-semibold">{data.resume ? data.resume.name : 'Click to select or drag and drop'}</p>
                  </div>
                  <input type="file" onChange={(e) => setData('resume', e.target.files[0])} accept=".pdf,.doc,.docx,.jpg,.png" className="hidden" />
                </label>
                {isEdit && !data.resume && (
                  <p className="text-xs text-slate-500 mt-1.5 italic">Leave empty to keep the current CV.</p>
                )}
                {errors.resume && <p className="text-rose-500 text-xs mt-1">{errors.resume}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Cover Letter / Remarks</label>
                <textarea 
                  rows="3" 
                  value={data.cover_letter} 
                  onChange={(e) => setData('cover_letter', e.target.value)} 
                  placeholder="বিশেষ কোনো নোট বা কভার লেটার..." 
                  className={`${inputClass} resize-none`} 
                />
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
              {processing ? 'Saving...' : 'Save Applicant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}