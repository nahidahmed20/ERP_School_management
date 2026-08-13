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

  const inputClass = "w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 transition-colors";
  const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2";

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link href={route('admin.time-tables.index')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-1 transition-colors">
              <Icon name="arrow-left" className="w-4 h-4" /> Back to Routine
            </Link>
            <h1 className="text-2xl font-extrabold text-gray-900">Edit Routine: <span className="text-indigo-600">{data.day_of_week}</span></h1>
          </div>
        </div>
      }
    >
      <Head title={`Edit Routine: ${data.day_of_week}`} />

      {/* Changed to w-full for Full Width */}
      <form onSubmit={submit} className="w-full relative pb-24">
        
        {/* Global Settings Block (Read Only) */}
        <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 mb-6 relative overflow-hidden">
          {/* Lock Icon Background */}
          <Icon name="lock" className="absolute -right-4 -top-4 w-32 h-32 text-gray-100 opacity-50 rotate-12" />
          
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 relative z-10">
            <div className="w-10 h-10 bg-gray-200 text-gray-500 rounded-lg flex items-center justify-center">
              <Icon name="lock" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-700">Class Settings <span className="text-sm font-normal text-red-500 ml-2">(Locked during edit)</span></h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10 opacity-80">
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
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                <Icon name="clock" className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Class Periods</h3>
            </div>
            <button type="button" onClick={addPeriod} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-sm">
              <Icon name="plus" className="w-4 h-4" /> Add New Period
            </button>
          </div>

          {errors.conflict && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3 text-sm font-bold shadow-sm">
              <Icon name="alert-triangle" className="w-6 h-6 flex-shrink-0" />
              {errors.conflict}
            </div>
          )}

          {data.periods.length === 0 ? (
            <div className="text-center py-16 bg-red-50 rounded-2xl border-2 border-dashed border-red-200">
              <Icon name="trash-2" className="w-12 h-12 text-red-300 mx-auto mb-3" />
              <p className="text-red-600 font-semibold text-lg">All periods removed.</p>
              <p className="text-red-400 text-sm mt-1">Saving now will clear the entire routine for this day.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {data.periods.map((period, index) => (
                <div key={index} className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-end bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-100 hover:shadow-md transition-all relative group">
                  
                  <div className="xl:col-span-1 flex items-center xl:justify-center">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Period</span>
                      <span className="w-10 h-10 bg-indigo-50 text-indigo-700 font-bold rounded-full flex items-center justify-center border border-indigo-100 text-lg">
                        {index + 1}
                      </span>
                    </div>
                  </div>

                  <div className="xl:col-span-3">
                    <label className={labelClass}>Subject <span className="text-red-500">*</span></label>
                    <select className={inputClass} value={period.subject_id} onChange={(e) => handlePeriodChange(index, 'subject_id', e.target.value)} required>
                      <option value="" disabled>Select Subject</option>
                      {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div className="xl:col-span-3">
                    <label className={labelClass}>Room <span className="text-gray-400 lowercase normal-case">(Optional)</span></label>
                    <select className={inputClass} value={period.classroom_id} onChange={(e) => handlePeriodChange(index, 'classroom_id', e.target.value)}>
                      <option value="">No Room Assigned</option>
                      {classrooms.map(r => <option key={r.id} value={r.id}>{r.room_number}</option>)}
                    </select>
                  </div>

                  <div className="xl:col-span-2">
                    <label className={labelClass}>Start Time <span className="text-red-500">*</span></label>
                    <input type="time" className={inputClass} value={period.start_time} onChange={(e) => handlePeriodChange(index, 'start_time', e.target.value)} required />
                  </div>

                  <div className="xl:col-span-2">
                    <label className={labelClass}>End Time <span className="text-red-500">*</span></label>
                    <input type="time" className={inputClass} value={period.end_time} onChange={(e) => handlePeriodChange(index, 'end_time', e.target.value)} required />
                  </div>

                  <div className="xl:col-span-1 flex justify-end xl:justify-center">
                    <button type="button" onClick={() => removePeriod(index)} className="w-12 h-12 bg-white border border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-xl transition-all shadow-sm flex items-center justify-center" title="Remove Period">
                      <Icon name="trash" className="w-5 h-5" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modern Sticky Footer Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="w-full flex justify-end gap-4 px-4 md:px-8">
            <Link href={route('admin.time-tables.index')} className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm">
              Cancel
            </Link>
            <button type="submit" disabled={processing} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md disabled:opacity-70 flex items-center gap-2">
              <Icon name="save" className="w-5 h-5" />
              {processing ? 'Updating...' : 'Update Day Routine'}
            </button>
          </div>
        </div>

      </form>
    </AuthenticatedLayout>
  );
}