import { useForm, usePage } from '@inertiajs/react';
import WorkingCampusField from '@/Components/WorkingCampusField';
import Icon from '@/Components/Icons';

export default function RecordFormModal({ item, users, campuses, activeCampusId, onClose }) {
  const isEdit = !!item;
  const { auth } = usePage().props;
  const isSuperAdmin = auth?.user?.role === 'super_admin' || auth?.user?.roles?.some(r => r.name === 'Super Admin');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    campus_id: item?.campus_id ?? auth?.active_campus_id ?? activeCampusId ?? '',
    user_id: item?.user_id ?? '',
    blood_group: item?.blood_group ?? '',
    height: item?.height ?? '',
    weight: item?.weight ?? '',
    allergies: item?.allergies ?? '',
    chronic_conditions: item?.chronic_conditions ?? '',
    emergency_contact: item?.emergency_contact ?? '',
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.medical.health-records.update', item.id), options);
    else post(route('admin.medical.health-records.store'), options);
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Health Record' : 'Add Health Record'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure student or staff medical information.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex justify-center items-center rounded-full bg-white border text-slate-400 hover:text-slate-600"><Icon name="close" className="w-4 h-4" /></button>
        </div>

        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="sm:col-span-2">
                <label className={labelClass}>Assign to Campus <span className="text-rose-500">*</span></label>
                <WorkingCampusField value={data.campus_id} campuses={campuses} className={`${inputClass} ${!isSuperAdmin ? 'bg-slate-100 opacity-70' : 'bg-white'}`} />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Select Patient (User) <span className="text-rose-500">*</span></label>
                <select value={data.user_id} onChange={e => setData('user_id', e.target.value)} required disabled={isEdit} className={`${inputClass} ${isEdit ? 'bg-slate-100 opacity-70' : 'bg-white'}`}>
                  <option value="" disabled>Select User</option>
                  {/* 🟢 FIX: Role included in dropdown */}
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} — {u.role}</option>)}
                </select>
                {errors.user_id && <p className="text-rose-500 text-xs mt-1">{errors.user_id}</p>}
              </div>

              <div>
                <label className={labelClass}>Blood Group</label>
                <select value={data.blood_group} onChange={e => setData('blood_group', e.target.value)} className={`${inputClass} bg-white font-bold text-rose-700`}>
                  <option value="">Select Group</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                  <option value="O+">O+</option><option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Emergency Contact Phone</label>
                <input value={data.emergency_contact} onChange={e => setData('emergency_contact', e.target.value)} placeholder="e.g. +8801..." className={`${inputClass} font-mono`} />
              </div>

              <div>
                <label className={labelClass}>Height</label>
                <input value={data.height} onChange={e => setData('height', e.target.value)} placeholder="e.g. 5.5 ft or 165 cm" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Weight</label>
                <input value={data.weight} onChange={e => setData('weight', e.target.value)} placeholder="e.g. 50 kg" className={inputClass} />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Known Allergies</label>
                <textarea rows="2" value={data.allergies} onChange={e => setData('allergies', e.target.value)} placeholder="e.g. Peanuts, Dust, specific medicine..." className={`${inputClass} resize-none`} />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Chronic Conditions (If any)</label>
                <textarea rows="2" value={data.chronic_conditions} onChange={e => setData('chronic_conditions', e.target.value)} placeholder="e.g. Asthma, Diabetes..." className={`${inputClass} resize-none`} />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
            <button type="button" onClick={onClose} disabled={processing} className="px-5 py-2.5 bg-white border rounded-xl text-slate-600 font-semibold">Cancel</button>
            
            {/* 🟢 FIX: Saving Animation */}
            <button type="submit" disabled={processing} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-md">
              {processing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Saving...
                </>
              ) : (
                <><Icon name="save" className="w-4 h-4" /> Save Record</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}