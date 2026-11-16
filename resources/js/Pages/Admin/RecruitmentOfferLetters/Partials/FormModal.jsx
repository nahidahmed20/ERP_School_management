import { useForm, router } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, applicants, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    applicant_id: item?.applicant_id || '',
    issue_date: item?.issue_date || new Date().toISOString().split('T')[0],
    joining_date: item?.joining_date || '',
    salary_offered: item?.salary_offered || '',
    valid_until: item?.valid_until || '',
    status: item?.status || 'Pending',
    terms_conditions: item?.terms_conditions || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route('admin.recruitment.offer-letters.update', item.id), {
        onSuccess: () => { reset(); onClose(); },
      });
    } else {
      post(route('admin.recruitment.offer-letters.store'), {
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
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Offer Letter' : 'Create Offer Letter'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure compensation and terms for candidate.</p>
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
                <label className={labelClass}>Select Applicant (Hired/Interviewed) <span className="text-rose-500">*</span></label>
                <select value={data.applicant_id} onChange={(e) => setData('applicant_id', e.target.value)} required disabled={isEdit} className={`${inputClass} disabled:bg-slate-100 disabled:opacity-60`}>
                  <option value="" disabled>-- আবেদনকারী নির্বাচন করুন --</option>
                  {applicants.map(app => (
                    <option key={app.id} value={app.id}>{app.name} ({app.job_post?.title})</option>
                  ))}
                </select>
                {errors.applicant_id && <p className="text-rose-500 text-xs mt-1">{errors.applicant_id}</p>}
              </div>

              <div>
                <label className={labelClass}>Salary Offered <span className="text-rose-500">*</span></label>
                <input 
                  value={data.salary_offered} 
                  onChange={(e) => setData('salary_offered', e.target.value)} 
                  placeholder="e.g. 25,000 BDT or Negotiable" 
                  className={`${inputClass} font-mono`} 
                  required 
                />
                {errors.salary_offered && <p className="text-rose-500 text-xs mt-1">{errors.salary_offered}</p>}
              </div>

              <div>
                <label className={labelClass}>Status <span className="text-rose-500">*</span></label>
                <select value={data.status} onChange={(e) => setData('status', e.target.value)} required className={inputClass}>
                  <option value="Pending">Pending (অপেক্ষমান)</option>
                  <option value="Accepted">Accepted (গ্রহণ করেছে)</option>
                  <option value="Declined">Declined (প্রত্যাখ্যান করেছে)</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Issue Date <span className="text-rose-500">*</span></label>
                <input 
                  type="date" 
                  value={data.issue_date} 
                  onChange={(e) => setData('issue_date', e.target.value)} 
                  className={`${inputClass} font-mono`} 
                  required 
                />
              </div>

              <div>
                <label className={labelClass}>Joining Date <span className="text-rose-500">*</span></label>
                <input 
                  type="date" 
                  value={data.joining_date} 
                  onChange={(e) => setData('joining_date', e.target.value)} 
                  className={`${inputClass} font-mono border-emerald-200`} 
                  required 
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Valid Until (Deadline to Accept) <span className="text-rose-500">*</span></label>
                <input 
                  type="date" 
                  value={data.valid_until} 
                  onChange={(e) => setData('valid_until', e.target.value)} 
                  className={`${inputClass} font-mono border-amber-200`} 
                  required 
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Terms &amp; Conditions / Note</label>
                <textarea 
                  rows="4" 
                  value={data.terms_conditions} 
                  onChange={(e) => setData('terms_conditions', e.target.value)} 
                  placeholder="যেকোনো শর্তাবলী বা নোট..." 
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
              {processing ? 'Saving...' : 'Save Offer Letter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}