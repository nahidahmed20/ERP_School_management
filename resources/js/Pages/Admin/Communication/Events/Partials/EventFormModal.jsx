import { useForm } from '@inertiajs/react';
import Icon from '@/Components/Icons';

export default function EventFormModal({ item, classrooms, activeCampusId, onClose }) {
  const isEdit = !!item;

  // 🟢 FIX: Safe conversion without timezone shift bugs
  function toDatetimeLocal(dateString) {
    if (!dateString) return '';
    if (dateString.includes('T')) return dateString.slice(0, 16);
    return dateString.replace(' ', 'T').slice(0, 16);
  }

  const { data, setData, post, put, processing, errors, reset } = useForm({
    title: item?.title || '',
    type: item?.type || 'Event',
    start_datetime: toDatetimeLocal(item?.start_datetime),
    end_datetime: toDatetimeLocal(item?.end_datetime),
    classroom_id: item?.classroom_id || '',
    description: item?.description || '',
    is_active: item?.is_active ?? true,
    show_on_dashboard: item?.show_on_dashboard ?? true,
    audience: item?.audience || 'all',
    is_government_holiday: item?.is_government_holiday ?? false,
  });

  function submit(e) {
    e.preventDefault();

    if (data.type !== 'Holiday') data.is_government_holiday = false;

    const options = { onSuccess: () => { reset(); onClose(); } };

    if (isEdit) {
      put(route('admin.communication-calendars.update', item.id), options);
    } else {
      post(route('admin.communication-calendars.store'), options);
    }
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>

      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Event / Meeting' : 'Add Event / Meeting'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure schedule, event type, and room assignment.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div className="sm:col-span-2">
                <label className={labelClass}>Event Title <span className="text-rose-500">*</span></label>
                <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="e.g. Parent-Teacher Meeting" required autoFocus className={inputClass} />
                {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className={labelClass}>Type <span className="text-rose-500">*</span></label>
                <select value={data.type} onChange={(e) => setData('type', e.target.value)} required className={`${inputClass} bg-white`}>
                  <option value="Event">Event</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Holiday">Holiday</option>
                  <option value="Other">Other</option>
                </select>
                {errors.type && <p className="text-rose-500 text-xs mt-1">{errors.type}</p>}
              </div>

              <div>
                <label className={labelClass}>Room / Location</label>
                <select value={data.classroom_id} onChange={(e) => setData('classroom_id', e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="">-- Not Assigned --</option>
                  {classrooms.map(r => <option key={r.id} value={r.id}>Room: {r.room_number}</option>)}
                </select>
                {errors.classroom_id && <p className="text-rose-500 text-xs mt-1">{errors.classroom_id}</p>}
              </div>

              <div>
                <label className={labelClass}>Starts At <span className="text-rose-500">*</span></label>
                <input type="datetime-local" value={data.start_datetime} onChange={(e) => setData('start_datetime', e.target.value)} required className={`${inputClass} font-mono`} />
                {errors.start_datetime && <p className="text-rose-500 text-xs mt-1">{errors.start_datetime}</p>}
              </div>

              <div>
                <label className={labelClass}>Ends At <span className="text-rose-500">*</span></label>
                <input type="datetime-local" value={data.end_datetime} onChange={(e) => setData('end_datetime', e.target.value)} required className={`${inputClass} font-mono`} />
                {errors.end_datetime && <p className="text-rose-500 text-xs mt-1">{errors.end_datetime}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Description (Optional)</label>
                <textarea rows="3" value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="Provide additional details or agenda..." className={`${inputClass} resize-none`} />
                {errors.description && <p className="text-rose-500 text-xs mt-1">{errors.description}</p>}
              </div>

              {/* 🟢 Premium Govt Holiday Toggle */}
              {data.type === 'Holiday' && (
                <div className="sm:col-span-2 pt-3 pb-1 border-t border-slate-100">
                  <label className="flex items-center gap-3 cursor-pointer group w-max bg-rose-50 px-4 py-3 rounded-xl border border-rose-100 transition-colors hover:bg-rose-100">
                    <div className="relative flex items-center">
                      <input type="checkbox" checked={data.is_government_holiday} onChange={(e) => setData('is_government_holiday', e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-rose-300 rounded focus:ring-0 checked:bg-rose-600 checked:border-rose-600 cursor-pointer transition-colors" />
                      <svg className="absolute w-3.5 h-3.5 top-[3px] left-[3px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-rose-800">Mark as Academic / Government Holiday</span>
                  </label>
                  <p className="text-xs font-medium text-slate-500 mt-2 ml-1">এটি সিলেক্ট করলে এই ছুটির দিনগুলোতে Attendance Control থেকে হাজিরার এন্ট্রি ব্লক হয়ে যাবে।</p>
                </div>
              )}

              <div className="sm:col-span-2 pt-3 border-t border-slate-100">
                <div className="mb-4">
                  <label className={labelClass}>Visible To</label>
                  <select value={data.audience} onChange={(e) => setData('audience', e.target.value)} className={`${inputClass} bg-white`}>
                    <option value="all">Everyone (All)</option>
                    <option value="student">Students Only</option>
                    <option value="parent">Parents Only</option>
                    <option value="staff">Staff Only</option>
                  </select>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer group w-max">
                    <div className="relative flex items-center">
                      <input type="checkbox" checked={data.show_on_dashboard} onChange={(e) => setData('show_on_dashboard', e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-0 checked:bg-indigo-600 checked:border-indigo-600 cursor-pointer transition-colors" />
                      <svg className="absolute w-3.5 h-3.5 top-[3px] left-[3px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Show as login/dashboard announcement</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group w-max">
                    <div className="relative flex items-center">
                      <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-0 checked:bg-emerald-600 checked:border-emerald-600 cursor-pointer transition-colors" />
                      <svg className="absolute w-3.5 h-3.5 top-[3px] left-[3px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Active — এই ইভেন্টটি সবার কাছে দৃশ্যমান থাকবে</span>
                  </label>
                </div>
              </div>

            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} disabled={processing} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm active:scale-95">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-70">
              {processing ? (
                <><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Saving...</>
              ) : (
                <><Icon name="save" className="w-4 h-4" /> {isEdit ? 'Update Event' : 'Save Event'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
