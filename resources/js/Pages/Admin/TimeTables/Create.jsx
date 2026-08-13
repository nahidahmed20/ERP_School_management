import { useForm, Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';

export default function Create({ classes, classrooms, campuses }) {
  const { data, setData, post, processing, errors } = useForm({
    campus_id: campuses[0]?.id || '',
    class_id: '',
    section_id: '',
    day_of_week: 'Sunday',
    periods: [{ subject_id: '', classroom_id: '', start_time: '', end_time: '' }],
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
    post(route('admin.time-tables.store'));
  }

  // Modern input classes
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
            <h1 className="text-2xl font-extrabold text-gray-900">Create New Routine</h1>
          </div>
        </div>
      }
    >
      <Head title="Create Routine" />

      {/* Changed to w-full for Full Width */}
      <form onSubmit={submit} className="w-full relative pb-24">
        
        {/* Global Settings Block */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
              <Icon name="settings" className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Class & Day Settings</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div>
              <label className={labelClass}>Class <span className="text-red-500">*</span></label>
              <select className={inputClass} value={data.class_id} onChange={(e) => setData({ ...data, class_id: e.target.value, section_id: '' })} required>
                <option value="" disabled>Select Class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.class_id && <span className="text-xs text-red-500 mt-1 block font-medium">{errors.class_id}</span>}
            </div>

            <div>
              <label className={labelClass}>Section <span className="text-red-500">*</span></label>
              <select className={`${inputClass} disabled:opacity-60 disabled:cursor-not-allowed`} value={data.section_id} onChange={(e) => setData('section_id', e.target.value)} required disabled={!data.class_id}>
                <option value="" disabled>Select Section</option>
                {availableSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {errors.section_id && <span className="text-xs text-red-500 mt-1 block font-medium">{errors.section_id}</span>}
            </div>

            <div>
              <label className={labelClass}>Day of the Week <span className="text-red-500">*</span></label>
              <select className={inputClass} value={data.day_of_week} onChange={(e) => setData('day_of_week', e.target.value)} required>
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
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
              <div>
                <h3 className="text-xl font-bold text-gray-800">Class Periods</h3>
                <p className="text-sm text-gray-500 font-medium">Add subjects and time slots for the selected day</p>
              </div>
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
            <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <Icon name="calendar" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold text-lg">No periods added yet.</p>
              <p className="text-gray-400 text-sm mt-1">Click the "Add New Period" button above to start.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {data.periods.map((period, index) => (
                <div key={index} className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-end bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-100 hover:shadow-md transition-all relative group">
                  
                  {/* Period Badge */}
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
              {processing ? 'Saving...' : 'Save Routine'}
            </button>
          </div>
        </div>

      </form>
    </AuthenticatedLayout>
  );
}