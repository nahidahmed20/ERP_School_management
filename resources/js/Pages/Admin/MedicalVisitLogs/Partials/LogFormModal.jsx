import { useForm, usePage } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function LogFormModal({ item, rooms, users, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? activeCampusId,
    medical_room_id: item?.medical_room_id ?? '',
    user_id: item?.user_id ?? '',
    visit_time: item?.visit_time ? item.visit_time.slice(0, 16) : new Date().toISOString().slice(0, 16),
    symptoms: item?.symptoms ?? '',
    diagnosis: item?.diagnosis ?? '',
    treatment_given: item?.treatment_given ?? '',
    action_taken: item?.action_taken ?? 'Rest in Room',
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.medical.visit-logs.update', item.id), options);
    else post(route('admin.medical.visit-logs.store'), options);
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    // Responsive Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      
      {/* Responsive Modal Box */}
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Visit Log' : 'Add New Visit Log'}</h3>
            <p className="text-sm text-slate-500 mt-1">Record patient symptoms, treatment, and action taken.</p>
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
                <label className={labelClass}>Assign to Campus <span className="text-rose-500">*</span></label>
                <select 
                  value={data.campus_id || ''} 
                  onChange={(e) => setData('campus_id', e.target.value)} 
                  disabled={!isSuperAdmin} 
                  required 
                  className={`${inputClass} ${!isSuperAdmin ? 'bg-slate-100 opacity-70' : 'bg-white'}`}
                >
                  <option value="" disabled>Select Campus</option>
                  {campuses?.map(campus => <option key={campus.id} value={campus.id}>{campus.name}</option>)}
                </select>
                {errors.campus_id && <p className="text-rose-500 text-xs mt-1">{errors.campus_id}</p>}
              </div>

              <div>
                <label className={labelClass}>Patient (Student/Staff) <span className="text-rose-500">*</span></label>
                <select value={data.user_id} onChange={e => setData('user_id', e.target.value)} required className={`${inputClass} bg-white`}>
                  <option value="" disabled>Select Patient</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                {errors.user_id && <p className="text-rose-500 text-xs mt-1">{errors.user_id}</p>}
              </div>

              <div>
                <label className={labelClass}>Medical Room <span className="text-rose-500">*</span></label>
                <select value={data.medical_room_id} onChange={e => setData('medical_room_id', e.target.value)} required className={`${inputClass} bg-white`}>
                  <option value="" disabled>Select Room</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.room_number}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Visit Time <span className="text-rose-500">*</span></label>
                <input 
                  type="datetime-local" 
                  value={data.visit_time} 
                  onChange={e => setData('visit_time', e.target.value)} 
                  required 
                  className={`${inputClass} font-mono`} 
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Symptoms / Reason for Visit <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={data.symptoms} 
                  onChange={e => setData('symptoms', e.target.value)} 
                  required 
                  placeholder="e.g. Fever, Headache"
                  className={inputClass} 
                />
              </div>

              <div>
                <label className={labelClass}>Diagnosis (Optional)</label>
                <input 
                  type="text" 
                  value={data.diagnosis} 
                  onChange={e => setData('diagnosis', e.target.value)} 
                  placeholder="e.g. Viral Fever"
                  className={inputClass} 
                />
              </div>

              <div>
                <label className={labelClass}>Treatment / Medicine Given</label>
                <input 
                  type="text" 
                  value={data.treatment_given} 
                  onChange={e => setData('treatment_given', e.target.value)} 
                  placeholder="e.g. Paracetamol"
                  className={inputClass} 
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Action Taken <span className="text-rose-500">*</span></label>
                <select value={data.action_taken} onChange={e => setData('action_taken', e.target.value)} required className={`${inputClass} bg-white`}>
                  <option value="Rest in Room">Rest in Room</option>
                  <option value="Sent back to class">Sent back to class</option>
                  <option value="Sent Home">Sent Home</option>
                  <option value="Sent to Hospital">Sent to Hospital</option>
                </select>
              </div>

            </div>
          </div>

          {/* Footer - Stacked on Mobile, Row on Desktop */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
              <Icon name="save" className="w-4 h-4" />
              {processing ? 'Saving...' : 'Save Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}