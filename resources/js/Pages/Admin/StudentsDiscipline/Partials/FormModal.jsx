import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function FormModal({ item, students, onClose }) {
  const isEdit = !!item;
  
  const { data, setData, post, put, processing, errors } = useForm({
    student_id: item?.student_id || '',
    title: item?.title || '',
    type: item?.type || 'Complaint',
    incident_date: item?.incident_date || new Date().toISOString().split('T')[0],
    description: item?.description || '',
    action_taken: item?.action_taken || '',
    reported_by: item?.reported_by || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route('admin.students.discipline.update', item.id), { onSuccess: () => onClose() });
    } else {
      post(route('admin.students.discipline.store'), { onSuccess: () => onClose() });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden transform transition-all flex flex-col ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Disciplinary Record' : 'Add New Record'}</h3>
            <p className="text-sm text-slate-500 mt-1">Log an incident, warning, or reward for a student.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-slate-100">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Student <span className="text-rose-500">*</span></label>
                <select 
                  value={data.student_id} 
                  onChange={(e) => setData('student_id', e.target.value)} 
                  disabled={isEdit} 
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer disabled:opacity-60"
                  required
                >
                  <option value="" disabled>-- স্টুডেন্ট সিলেক্ট করুন --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.admission_no} - {s.first_name} {s.last_name || ''}</option>)}
                </select>
                {errors.student_id && <p className="text-rose-500 text-xs font-medium mt-1">{errors.student_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Record Type <span className="text-rose-500">*</span></label>
                <select 
                  value={data.type} 
                  onChange={(e) => setData('type', e.target.value)} 
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  required
                >
                  <option value="Complaint">Complaint (অভিযোগ)</option>
                  <option value="Warning">Warning (সতর্কতা)</option>
                  <option value="Suspension">Suspension (বহিষ্কার)</option>
                  <option value="Reward">Reward (পুরস্কার)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Incident Date <span className="text-rose-500">*</span></label>
                <input 
                  type="date" 
                  value={data.incident_date} 
                  onChange={(e) => setData('incident_date', e.target.value)} 
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  required 
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title / Subject <span className="text-rose-500">*</span></label>
                <input 
                  value={data.title} 
                  onChange={(e) => setData('title', e.target.value)} 
                  placeholder="e.g. Broken school property" 
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  required 
                />
                {errors.title && <p className="text-rose-500 text-xs font-medium mt-1">{errors.title}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description details</label>
                <textarea 
                  rows="3" 
                  value={data.description} 
                  onChange={(e) => setData('description', e.target.value)} 
                  placeholder="ঘটনার বিস্তারিত বিবরণ..." 
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Action Taken</label>
                <input 
                  value={data.action_taken} 
                  onChange={(e) => setData('action_taken', e.target.value)} 
                  placeholder="e.g. Called parents" 
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Reported By</label>
                <input 
                  value={data.reported_by} 
                  onChange={(e) => setData('reported_by', e.target.value)} 
                  placeholder="e.g. Mr. Rahim" 
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} disabled={processing} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95">
              {processing ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}