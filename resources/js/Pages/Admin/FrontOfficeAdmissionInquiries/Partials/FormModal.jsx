import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, errors } = useForm({
    applicant_name: item?.applicant_name || '',
    guardian_name: item?.guardian_name || '',
    phone: item?.phone || '',
    class_interested: item?.class_interested || '',
    inquiry_date: item?.inquiry_date || new Date().toISOString().split('T')[0],
    next_follow_up_date: item?.next_follow_up_date || '',
    status: item?.status || 'Pending',
    notes: item?.notes || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route('admin.frontoffice.admission-inquiries.update', item.id), {
        onSuccess: () => onClose(),
      });
    } else {
      post(route('admin.frontoffice.admission-inquiries.store'), {
        onSuccess: () => onClose(),
      });
    }
  };

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden transform transition-all flex flex-col ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Inquiry' : 'Add New Inquiry'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure admission lead details and follow-ups.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-slate-100">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div>
                <label className={labelClass}>Applicant Name <span className="text-rose-500">*</span></label>
                <input 
                  value={data.applicant_name} 
                  onChange={(e) => setData('applicant_name', e.target.value)} 
                  placeholder="শিক্ষার্থীর নাম" 
                  className={inputClass} 
                  required 
                  autoFocus
                />
                {errors.applicant_name && <p className="text-rose-500 text-xs mt-1">{errors.applicant_name}</p>}
              </div>

              <div>
                <label className={labelClass}>Guardian Name <span className="text-rose-500">*</span></label>
                <input 
                  value={data.guardian_name} 
                  onChange={(e) => setData('guardian_name', e.target.value)} 
                  placeholder="অভিভাবকের নাম" 
                  className={inputClass} 
                  required 
                />
                {errors.guardian_name && <p className="text-rose-500 text-xs mt-1">{errors.guardian_name}</p>}
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
                <label className={labelClass}>Class Interested <span className="text-rose-500">*</span></label>
                <input 
                  value={data.class_interested} 
                  onChange={(e) => setData('class_interested', e.target.value)} 
                  placeholder="e.g. Class 6" 
                  className={inputClass} 
                  required 
                />
                {errors.class_interested && <p className="text-rose-500 text-xs mt-1">{errors.class_interested}</p>}
              </div>

              <div>
                <label className={labelClass}>Inquiry Date <span className="text-rose-500">*</span></label>
                <input 
                  type="date" 
                  value={data.inquiry_date} 
                  onChange={(e) => setData('inquiry_date', e.target.value)} 
                  className={`${inputClass} font-mono`} 
                  required 
                />
              </div>

              <div>
                <label className={labelClass}>Next Follow-up Date</label>
                <input 
                  type="date" 
                  value={data.next_follow_up_date} 
                  onChange={(e) => setData('next_follow_up_date', e.target.value)} 
                  className={`${inputClass} font-mono`} 
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Status <span className="text-rose-500">*</span></label>
                <select value={data.status} onChange={(e) => setData('status', e.target.value)} required className={inputClass}>
                  <option value="Pending">Pending</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Converted">Converted (ভর্তি সম্পন্ন)</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Notes / Remarks</label>
                <textarea 
                  rows="3" 
                  value={data.notes} 
                  onChange={(e) => setData('notes', e.target.value)} 
                  placeholder="বিশেষ কোনো তথ্য..." 
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
              {processing ? 'Saving...' : 'Save Inquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}