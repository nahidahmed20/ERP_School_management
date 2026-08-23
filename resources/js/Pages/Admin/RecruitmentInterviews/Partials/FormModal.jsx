import { useForm, router } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, applicants, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    applicant_id: item?.applicant_id || '',
    interviewer_name: item?.interviewer_name || '',
    interview_date: item?.interview_date || '',
    interview_time: item?.interview_time || '',
    location: item?.location || '',
    status: item?.status || 'Scheduled',
    remarks: item?.remarks || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route('admin.recruitment.interviews.update', item.id), {
        onSuccess: () => { reset(); onClose(); },
      });
    } else {
      post(route('admin.recruitment.interviews.store'), {
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
        style={{ padding: 0, overflow: 'hidden', maxWidth: '36rem', width: '100%' }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Interview' : 'Schedule Interview'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure interview details and schedule.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]">
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="sm:col-span-2">
                <label className={labelClass}>Select Applicant <span className="text-rose-500">*</span></label>
                <select value={data.applicant_id} onChange={(e) => setData('applicant_id', e.target.value)} required className={inputClass}>
                  <option value="" disabled>-- আবেদনকারী নির্বাচন করুন --</option>
                  {applicants.map(app => (
                    <option key={app.id} value={app.id}>{app.name} ({app.job_post?.title})</option>
                  ))}
                </select>
                {errors.applicant_id && <p className="text-rose-500 text-xs mt-1">{errors.applicant_id}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Interviewer Name <span className="text-rose-500">*</span></label>
                <input 
                  value={data.interviewer_name} 
                  onChange={(e) => setData('interviewer_name', e.target.value)} 
                  placeholder="e.g. Principal / HR Manager" 
                  className={inputClass} 
                  required 
                />
                {errors.interviewer_name && <p className="text-rose-500 text-xs mt-1">{errors.interviewer_name}</p>}
              </div>

              <div>
                <label className={labelClass}>Date <span className="text-rose-500">*</span></label>
                <input 
                  type="date" 
                  value={data.interview_date} 
                  onChange={(e) => setData('interview_date', e.target.value)} 
                  className={`${inputClass} font-mono`} 
                  required 
                />
              </div>

              <div>
                <label className={labelClass}>Time <span className="text-rose-500">*</span></label>
                <input 
                  type="time" 
                  value={data.interview_time} 
                  onChange={(e) => setData('interview_time', e.target.value)} 
                  className={`${inputClass} font-mono`} 
                  required 
                />
              </div>

              <div>
                <label className={labelClass}>Location / Link</label>
                <input 
                  value={data.location} 
                  onChange={(e) => setData('location', e.target.value)} 
                  placeholder="e.g. Room 101 or Zoom link" 
                  className={inputClass} 
                />
              </div>

              <div>
                <label className={labelClass}>Status <span className="text-rose-500">*</span></label>
                <select value={data.status} onChange={(e) => setData('status', e.target.value)} required className={inputClass}>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Remarks / Feedback</label>
                <textarea 
                  rows="3" 
                  value={data.remarks} 
                  onChange={(e) => setData('remarks', e.target.value)} 
                  placeholder="ইন্টারভিউয়ের ফলাফল বা ফিডব্যাক..." 
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
              {processing ? 'Saving...' : 'Save Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}