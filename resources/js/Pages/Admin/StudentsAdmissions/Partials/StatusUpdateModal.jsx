import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function StatusUpdateModal({ item, classes, onClose }) {
  const appliedClass = classes?.find(c => c.id === item.class_id);
  const sections = appliedClass?.sections || [];

  const { data, setData, put, processing, errors, reset } = useForm({
    status: item.status,
    section_id: '',
    notes: item.notes || '',
  });

  function submit(e) {
    e.preventDefault();
    put(route('admin.students.admissions.update', item.id), {
      onSuccess: () => {
        reset();
        onClose();
      }
    });
  }

  // Dynamic styling based on selected status
  const getStatusStyle = (status) => {
    if (status === 'Approved') return 'bg-emerald-50 border-emerald-500 text-emerald-900 focus:ring-emerald-500';
    if (status === 'Rejected') return 'bg-rose-50 border-rose-500 text-rose-900 focus:ring-rose-500';
    return 'bg-slate-50 border-slate-200 text-slate-700 focus:ring-indigo-500';
  };

  const getButtonStyle = (status) => {
    if (status === 'Approved') return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20';
    if (status === 'Rejected') return 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20';
    return 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20';
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all flex flex-col ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Update Application Status</h3>
            <p className="text-sm text-slate-500 mt-1">Review and process the admission.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-slate-100">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={submit}>
          <div className="p-6 space-y-5">
            
            {/* Applicant Summary Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold font-serif shrink-0">
                {item.first_name.charAt(0)}
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Applicant</span>
                <strong className="text-base text-slate-900 block">{item.first_name} {item.last_name || ''}</strong>
                <div className="text-xs text-slate-500 mt-1">
                  Class: <span className="font-bold text-slate-700">{appliedClass?.name}</span> • Guardian: <span className="font-bold text-slate-700">{item.guardian_name}</span>
                </div>
              </div>
            </div>

            {/* Status Select */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Application Status <span className="text-rose-500">*</span></label>
              <select 
                value={data.status} 
                onChange={(e) => setData('status', e.target.value)}
                className={`block w-full px-4 py-2.5 border rounded-xl text-sm outline-none cursor-pointer font-semibold transition-colors focus:ring-2 ${getStatusStyle(data.status)}`}
              >
                <option value="Pending">Pending (অপেক্ষমান)</option>
                <option value="Approved">Approved (ভর্তি নিশ্চিত করুন)</option>
                <option value="Rejected">Rejected (বাতিল করুন)</option>
              </select>
              {errors.status && <p className="text-rose-500 text-xs font-medium mt-1">{errors.status}</p>}
            </div>

            {/* Conditional Section for Approval */}
            {data.status === 'Approved' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Assign Section <span className="text-rose-500">*</span></label>
                <select 
                  value={data.section_id} 
                  onChange={(e) => setData('section_id', e.target.value)} 
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                  required
                >
                  <option value="" disabled>-- সেকশন সিলেক্ট করুন --</option>
                  {sections.map(sec => (
                    <option key={sec.id} value={sec.id}>{sec.name}</option>
                  ))}
                </select>
                {errors.section_id && <p className="text-rose-500 text-xs font-medium mt-1">{errors.section_id}</p>}
                
                <div className="flex items-start gap-2 mt-3 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                  <Icon name="check-circle" className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /> 
                  <p className="text-xs font-semibold text-emerald-700 leading-relaxed">
                    অ্যাপ্রুভ করলে স্বয়ংক্রিয়ভাবে স্টুডেন্ট এবং প্যারেন্ট অ্যাকাউন্ট তৈরি হয়ে যাবে এবং তালিকাভুক্ত হবে।
                  </p>
                </div>
              </div>
            )}

            {/* Admin Notes */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Admin Notes / Remarks</label>
              <textarea 
                rows="3" 
                value={data.notes} 
                onChange={(e) => setData('notes', e.target.value)} 
                placeholder="ভর্তি বাতিল বা এপ্রুভ করার কোনো নোট থাকলে লিখুন..."
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
              />
            </div>

          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed active:scale-95 ${getButtonStyle(data.status)}`}>
              {processing ? 'Processing...' : 'Confirm Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}