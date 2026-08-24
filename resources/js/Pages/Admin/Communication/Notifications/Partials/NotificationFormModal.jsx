import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function NotificationFormModal({ item, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin';

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    title: item?.title ?? '',
    message: item?.message ?? '',
    notification_type: item?.notification_type ?? 'App Push',
    target_audience: item?.target_audience ?? 'All',
    status: item?.status ?? 'Sent',
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.communication-notifications.update', item.id), options);
    else post(route('admin.communication-notifications.store'), options);
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
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Notification' : 'Create New Notification'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure notice details, type, and target audience.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="sm:col-span-2">
                <label className={labelClass}>Select Campus (Optional)</label>
                <select 
                  value={data.campus_id || ''} 
                  onChange={(e) => setData('campus_id', e.target.value)} 
                  disabled={!isSuperAdmin}
                  className={`${inputClass} ${!isSuperAdmin ? 'bg-slate-100 opacity-70' : 'bg-white'}`}
                >
                  <option value="">Global / All Campuses</option>
                  {campuses?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.campus_id && <p className="text-rose-500 text-xs mt-1">{errors.campus_id}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Notification Title <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={data.title} 
                  onChange={e => setData('title', e.target.value)} 
                  required 
                  autoFocus 
                  placeholder="e.g. School will remain closed tomorrow" 
                  className={inputClass} 
                />
                {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className={labelClass}>Notification Type <span className="text-rose-500">*</span></label>
                <select value={data.notification_type} onChange={e => setData('notification_type', e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="App Push">App Push Notification</option>
                  <option value="System">System Noticeboard</option>
                  <option value="Email">Email Blast</option>
                  <option value="SMS">SMS Notice</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Target Audience <span className="text-rose-500">*</span></label>
                <select value={data.target_audience} onChange={e => setData('target_audience', e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="All">Everyone (All)</option>
                  <option value="Students">Students Only</option>
                  <option value="Teachers">Teachers / Staff Only</option>
                  <option value="Parents">Parents Only</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Message / Notice Body <span className="text-rose-500">*</span></label>
                <textarea 
                  rows="4" 
                  value={data.message} 
                  onChange={e => setData('message', e.target.value)} 
                  required 
                  placeholder="Type the detailed notice here..." 
                  className={`${inputClass} resize-none`} 
                />
                {errors.message && <p className="text-rose-500 text-xs mt-1">{errors.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Status <span className="text-rose-500">*</span></label>
                <select value={data.status} onChange={e => setData('status', e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="Sent">Send Now (Active)</option>
                  <option value="Draft">Save as Draft</option>
                </select>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
              <Icon name={data.status === 'Sent' ? 'send' : 'save'} className="w-4 h-4" />
              {processing ? 'Processing...' : (data.status === 'Sent' ? (isEdit ? 'Update & Send' : 'Send Notification') : 'Save Draft')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}