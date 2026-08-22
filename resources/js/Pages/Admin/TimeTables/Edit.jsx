import { useForm, Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';

export default function Edit({ classes, classrooms, campuses, editData }) {
  
  const initialPeriods = editData.periods.length > 0
    ? editData.periods.map(p => ({
        subject_id: p.subject_id,
        classroom_id: p.classroom_id || '',
        start_time: p.start_time.substring(0, 5),
        end_time: p.end_time.substring(0, 5)
      }))
    : [{ subject_id: '', classroom_id: '', start_time: '', end_time: '' }];

  const { data, setData, post, processing, errors } = useForm({
    campus_id: campuses[0]?.id || '',
    class_id: editData.class_id,
    section_id: editData.section_id,
    day_of_week: editData.day_of_week,
    periods: initialPeriods,
  });

  const selectedClass = classes.find(c => c.id == data.class_id);
  const availableSections = selectedClass?.sections || [];
  const availableSubjects = selectedClass?.subjects || [];

  const addPeriod = () => setData('periods', [...data.periods, { subject_id: '', classroom_id: '', start_time: '', end_time: '' }]);
  const removePeriod = (index) => setData('periods', data.periods.filter((_, i) => i !== index));

  const handlePeriodChange = (index, field, value) => {
    const newPeriods = [...data.periods];
    newPeriods[index][field] = value;
    setData('periods', newPeriods);
  };

  function submit(e) {
    e.preventDefault();
    post(route('admin.time-tables.bulk-update'));
  }

  const inputClass = "w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3 outline-none transition-all";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2";

  return (
    <AuthenticatedLayout>
      <Head title={`Edit Routine: ${data.day_of_week}`} />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link href={route('admin.time-tables.index')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 mb-1 transition-colors w-max">
              <Icon name="arrow-left" className="w-4 h-4" /> Back to Routine
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Edit Routine: <span className="text-indigo-600">{data.day_of_week}</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">নির্বাচিত বারের রুটিন এবং পিরিয়ড আপডেট করুন।</p>
          </div>
        </div>

        <form onSubmit={submit} className="w-full relative pb-28 space-y-6">
          
          {/* Global Settings Block (Read Only / Locked) */}
          <div className="bg-slate-50 p-7 rounded-2xl border border-slate-200 relative overflow-hidden">
            <Icon name="lock" className="absolute -right-4 -top-4 w-32 h-32 text-slate-200/50 rotate-12 pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 relative z-10">
              <div className="w-10 h-10 bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center shrink-0">
                <Icon name="lock" className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Class Settings</h3>
                <p className="text-xs font-semibold text-rose-500 mt-0.5">Locked during edit</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 relative z-10 opacity-75">
              <div>
                <label className={labelClass}>Class</label>
                <select className={`${inputClass} cursor-not-allowed`} value={data.class_id} disabled>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Section</label>
                <select className={`${inputClass} cursor-not-allowed`} value={data.section_id} disabled>
                  {availableSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Day of the Week</label>
                <select className={`${inputClass} cursor-not-allowed`} value={data.day_of_week} disabled>
                  <option value={data.day_of_week}>{data.day_of_week}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Periods Block */}
          <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100">
                  <Icon name="clock" className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Class Periods</h3>
              </div>
              <button type="button" onClick={addPeriod} className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2 border border-indigo-100">
                <Icon name="plus" className="w-4 h-4" /> Add New Period
              </button>
            </div>

            {errors.conflict && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl mb-6 flex items-center gap-3 text-sm font-semibold shadow-sm">
                <Icon name="alert-triangle" className="w-5 h-5 flex-shrink-0 text-rose-600" />
                {errors.conflict}
              </div>
            )}

            {data.periods.length === 0 ? (
              <div className="text-center py-16 bg-rose-50/50 rounded-2xl border-2 border-dashed border-rose-200">
                <Icon name="trash" className="w-10 h-10 text-rose-300 mx-auto mb-3" />
                <p className="text-rose-700 font-bold text-base">All periods removed.</p>
                <p className="text-rose-400 text-xs mt-1">Saving now will clear the entire routine for this day.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.periods.map((period, index) => (
                  <div key={index} className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-end bg-slate-50/60 p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all relative group">
                    
                    <div className="xl:col-span-1 flex items-center xl:justify-center">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Period</span>
                        <span className="w-10 h-10 bg-indigo-100 text-indigo-700 font-bold rounded-xl flex items-center justify-center border border-indigo-200 text-sm shadow-sm">
                          {index + 1}
                        </span>
                      </div>
                    </div>

                    <div className="xl:col-span-3">
                      <label className={labelClass}>Subject <span className="text-rose-500">*</span></label>
                      <select className={inputClass} value={period.subject_id} onChange={(e) => handlePeriodChange(index, 'subject_id', e.target.value)} required>
                        <option value="" disabled>Select Subject</option>
                        {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>

                    <div className="xl:col-span-3">
                      <label className={labelClass}>Room <span className="text-slate-400 lowercase normal-case">(Optional)</span></label>
                      <select className={inputClass} value={period.classroom_id} onChange={(e) => handlePeriodChange(index, 'classroom_id', e.target.value)}>
                        <option value="">No Room Assigned</option>
                        {classrooms.map(r => <option key={r.id} value={r.id}>{r.room_number}</option>)}
                      </select>
                    </div>

                    <div className="xl:col-span-2">
                      <label className={labelClass}>Start Time <span className="text-rose-500">*</span></label>
                      <input type="time" className={inputClass} value={period.start_time} onChange={(e) => handlePeriodChange(index, 'start_time', e.target.value)} required />
                    </div>

                    <div className="xl:col-span-2">
                      <label className={labelClass}>End Time <span className="text-rose-500">*</span></label>
                      <input type="time" className={inputClass} value={period.end_time} onChange={(e) => handlePeriodChange(index, 'end_time', e.target.value)} required />
                    </div>

                    <div className="xl:col-span-1 flex justify-end xl:justify-center">
                      <button type="button" onClick={() => removePeriod(index)} className="w-11 h-11 bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all shadow-sm flex items-center justify-center" title="Remove Period">
                        <Icon name="trash" className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sticky Footer Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 z-40 shadow-lg">
            <div className="w-full max-w-7xl mx-auto flex justify-end gap-3 px-4 sm:px-6">
              <Link href={route('admin.time-tables.index')} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-xl transition-all shadow-sm">
                Cancel
              </Link>
              <button type="submit" disabled={processing} className="px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 flex items-center gap-2 active:scale-95">
                <Icon name="save" className="w-4 h-4" />
                {processing ? 'Updating...' : 'Update Day Routine'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </AuthenticatedLayout>
  );
}