import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ timeTables, classes, filters }) {
  const { flash } = usePage().props;

  // Filter States
  const [classId, setClassId] = useState(filters.class_id ?? '');
  const [sectionId, setSectionId] = useState(filters.section_id ?? '');
  const [day, setDay] = useState(filters.day ?? '');
  
  // Delete State
  const [deletingItem, setDeletingItem] = useState(null);

  const selectedClassForFilter = classes.find(c => c.id == classId);
  const isFilterApplied = classId && sectionId;

  // Notifications
  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000 });
  }, [flash]);

  // Apply Filter
  function applyFilters(overrides = {}) {
    router.get(route('admin.time-tables.index'), { class_id: classId, section_id: sectionId, day, ...overrides }, { preserveState: true, replace: true });
  }

  // Format Time (13:00 to 01:00 PM)
  function formatTime(timeString) {
    if (!timeString) return '';
    const [hourString, minute] = timeString.split(':');
    let hour = parseInt(hourString, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  }

  // Dynamic Subject Colors
  const getSubjectColor = (subjectName) => {
    const colors = [
      { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
      { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
      { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    ];
    let hash = 0;
    for (let i = 0; i < subjectName.length; i++) hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  // Group Routine by Days
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const groupedRoutine = {};
  daysOfWeek.forEach(d => {
    groupedRoutine[d] = timeTables.data.filter(t => t.day_of_week === d);
  });

  // Modern Pagination with Icons
  const Pagination = ({ meta }) => {
    if (!meta || meta.last_page <= 1) return null;
    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        {meta.links.map((link, index) => {
          let content = link.label;
          if (content.includes('Previous')) content = <Icon name="chevron-left" className="w-4 h-4" />;
          if (content.includes('Next')) content = <Icon name="chevron-right" className="w-4 h-4" />;

          return link.url ? (
            <Link key={index} href={link.url} className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-medium transition-all ${link.active ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`} dangerouslySetInnerHTML={{ __html: typeof content === 'string' ? content : '' }}>
              {typeof content !== 'string' && content}
            </Link>
          ) : (
            <span key={index} className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed" dangerouslySetInnerHTML={{ __html: typeof content === 'string' ? content : '' }}>
              {typeof content !== 'string' && content}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Academics</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">Class Timetable</h1>
          </div>
          <Link href={route('admin.time-tables.create')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm flex items-center gap-2 transition-colors">
            <Icon name="plus" className="w-4 h-4" /> Add Routine
          </Link>
        </div>
      }
    >
      <Head title="Class Timetable" />

      {/* Modern Filters Card */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <label className="block">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Class</span>
            <select className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(''); }}>
              <option value="">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Section</span>
            <select className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm disabled:bg-gray-50" value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId}>
              <option value="">All Sections</option>
              {selectedClassForFilter?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Day</span>
            <select className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" value={day} onChange={(e) => setDay(e.target.value)}>
              <option value="">All Days</option>
              {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
          <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2" onClick={() => applyFilters()}>
            <Icon name="search" className="w-4 h-4" /> Search Routine
          </button>
        </div>
        {!isFilterApplied && (
          <p className="text-xs text-red-500 mt-3 flex items-center gap-1">
            <Icon name="info" className="w-3 h-3" /> To edit a full day's routine, please filter by both Class and Section.
          </p>
        )}
      </div>

      {/* Routine Display Area */}
      <div className="space-y-6">
        {timeTables.data.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Icon name="calendar" className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Routine Found</h3>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or add a new routine.</p>
          </div>
        ) : (
          daysOfWeek.map(d => {
            const dayPeriods = groupedRoutine[d];
            if (dayPeriods.length === 0) return null;

            return (
              <div key={d} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Icon name="calendar" className="w-5 h-5 text-indigo-500" /> {d}
                  </h3>
                  {isFilterApplied && (
                    <Link 
                      href={route('admin.time-tables.edit-day', { class_id: classId, section_id: sectionId, day: d })}
                      className="text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Icon name="edit" className="w-4 h-4" /> Edit Day
                    </Link>
                  )}
                </div>

                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {dayPeriods.map((period, index) => {
                    const colors = getSubjectColor(period.subject?.name || 'Subject');
                    return (
                      <div key={period.id} className={`${colors.bg} ${colors.border} border rounded-xl p-5 relative group transition-all hover:shadow-md`}>
                        
                        <button 
                          onClick={() => setDeletingItem(period)}
                          className="absolute top-3 right-3 bg-white p-1.5 rounded-md text-red-500 shadow-sm border border-red-100 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete Period"
                        >
                          <Icon name="trash" className="w-4 h-4" />
                        </button>

                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border ${colors.border} ${colors.text} mb-3 inline-block`}>
                          Period {index + 1}
                        </span>
                        
                        <h4 className={`text-lg font-bold ${colors.text} mb-3`}>{period.subject?.name}</h4>
                        
                        <div className="space-y-2 text-sm text-gray-600 font-medium">
                          <div className="flex items-center gap-2">
                            <Icon name="clock" className="w-4 h-4 opacity-50" />
                            {formatTime(period.start_time)} - {formatTime(period.end_time)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon name="users" className="w-4 h-4 opacity-50" />
                            {period.schoolClass?.name} (Sec: {period.section?.name})
                          </div>
                          {period.classroom && (
                            <div className="flex items-center gap-2">
                              <Icon name="home" className="w-4 h-4 opacity-50" />
                              Room: {period.classroom.room_number}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      <Pagination meta={timeTables} />

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <ConfirmDeleteModal 
          item={deletingItem} 
          message="Are you sure you want to delete this period?"
          onCancel={() => setDeletingItem(null)} 
          onConfirm={() => { router.delete(route('admin.time-tables.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) }); }} 
        />
      )}
    </AuthenticatedLayout>
  );
}