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
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
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
      { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
      { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
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

  // --- Export Functions ---
  const handlePrint = () => window.print();

  const exportToCSV = () => {
    if (!timeTables.data.length) return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    const headers = ['Day', 'Subject', 'Time', 'Class', 'Section', 'Room'];
    const rows = timeTables.data.map(item => [
      item.day_of_week || 'N/A',
      item.subject?.name || 'N/A',
      `${formatTime(item.start_time)} - ${formatTime(item.end_time)}`,
      item.schoolClass?.name || 'N/A',
      item.section?.name || 'N/A',
      item.classroom?.room_number || 'N/A'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Class_Timetable_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!timeTables.data.length) return;
    let text = "Day\tSubject\tTime\tClass\tSection\tRoom\n";
    timeTables.data.forEach(item => {
      text += `${item.day_of_week || 'N/A'}\t${item.subject?.name || 'N/A'}\t${formatTime(item.start_time)} - ${formatTime(item.end_time)}\t${item.schoolClass?.name || 'N/A'}\t${item.section?.name || 'N/A'}\t${item.classroom?.room_number || 'N/A'}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  // Modern Pagination with Icons
  const Pagination = ({ meta }) => {
    if (!meta || meta.last_page <= 1) return null;
    return (
      <div className="flex justify-center items-center gap-1.5 mt-8 no-print">
        {meta.links.map((link, index) => {
          let content = link.label;
          if (content.includes('Previous')) content = <Icon name="chevron-left" className="w-4 h-4" />;
          if (content.includes('Next')) content = <Icon name="chevron-right" className="w-4 h-4" />;

          return link.url ? (
            <Link key={index} href={link.url} className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-all ${link.active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600 border border-transparent'}`} dangerouslySetInnerHTML={{ __html: typeof content === 'string' ? content : '' }}>
              {typeof content !== 'string' && content}
            </Link>
          ) : (
            <span key={index} className="w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold text-slate-300 bg-slate-50 cursor-not-allowed" dangerouslySetInnerHTML={{ __html: typeof content === 'string' ? content : '' }}>
              {typeof content !== 'string' && content}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <AuthenticatedLayout>
      <Head title="Class Timetable" />

      {/* Print Specific CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          nav, aside, header, .no-print, button, a, select, input { display: none !important; }
          body, html { background: #f8fafc !important; }
          .print-title { display: block !important; font-size: 24px !important; font-weight: bold !important; margin-bottom: 20px !important; }
        }
        @media screen { .print-title { display: none; } }
      `}} />

      <div className="print-title">Class Timetable - {new Date().toLocaleDateString('en-GB')}</div>

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Academics</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Class Timetable</h1>
            <p className="text-sm text-slate-500 mt-1">ক্লাসের রুটিন এবং পিরিয়ড সময়সূচি পরিচালনা করুন।</p>
          </div>
          <Link href={route('admin.time-tables.create')} className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/20 active:scale-95">
            <Icon name="plus" className="w-4 h-4" /> Add Routine
          </Link>
        </div>

        {/* Unified Modern Toolbar & Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col xl:flex-row items-center justify-between gap-4 no-print">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full xl:w-auto flex-1">
            
            {/* Class Filter */}
            <select className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer" value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(''); }}>
              <option value="">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            {/* Section Filter */}
            <select className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer disabled:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed" value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId}>
              <option value="">All Sections</option>
              {selectedClassForFilter?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            {/* Day Filter */}
            <select className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer" value={day} onChange={(e) => setDay(e.target.value)}>
              <option value="">All Days</option>
              {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
            <button className="w-full xl:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2" onClick={() => applyFilters()}>
              <Icon name="search" className="w-4 h-4" /> Search Routine
            </button>

            {/* Export Actions */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl shadow-sm shrink-0">
              <button onClick={copyToClipboard} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Copy">Copy</button>
              <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
              <button onClick={exportToCSV} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="CSV">CSV</button>
              <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
              <button onClick={handlePrint} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-600 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Print">Print</button>
            </div>
          </div>
        </div>

        {!isFilterApplied && (
          <div className="no-print bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-center gap-2 text-amber-800 text-xs font-semibold">
            <Icon name="info" className="w-4 h-4 shrink-0 text-amber-600" /> To edit a full day's routine, please filter by both Class and Section.
          </div>
        )}

        {/* Routine Display Area */}
        <div className="space-y-6">
          {timeTables.data.length === 0 ? (
            <div className="bg-white p-16 rounded-2xl border border-dashed border-slate-300 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Icon name="calendar" className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Routine Found</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-xs">Try adjusting your filters or add a new routine using the button above.</p>
            </div>
          ) : (
            daysOfWeek.map(d => {
              const dayPeriods = groupedRoutine[d];
              if (dayPeriods.length === 0) return null;

              return (
                <div key={d} className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
                  <div className="bg-slate-50/70 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <Icon name="calendar" className="w-4 h-4 text-indigo-600" /> {d}
                    </h3>
                    {isFilterApplied && (
                      <Link 
                        href={route('admin.time-tables.edit-day', { class_id: classId, section_id: sectionId, day: d })}
                        className="no-print text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border border-indigo-100 shadow-sm"
                      >
                        <Icon name="edit" className="w-3.5 h-3.5" /> Edit Day
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
                            className="no-print absolute top-3 right-3 bg-white p-1.5 rounded-lg text-rose-500 shadow-sm border border-rose-100 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50"
                            title="Delete Period"
                          >
                            <Icon name="trash" className="w-3.5 h-3.5" />
                          </button>

                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border ${colors.border} ${colors.text} mb-3 inline-block shadow-sm`}>
                            Period {index + 1}
                          </span>
                          
                          <h4 className={`text-base font-bold ${colors.text} mb-3`}>{period.subject?.name}</h4>
                          
                          <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                            <div className="flex items-center gap-2">
                              <Icon name="clock" className="w-3.5 h-3.5 opacity-50 shrink-0" />
                              {formatTime(period.start_time)} - {formatTime(period.end_time)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Icon name="users" className="w-3.5 h-3.5 opacity-50 shrink-0" />
                              {period.schoolClass?.name} (Sec: {period.section?.name})
                            </div>
                            {period.classroom && (
                              <div className="flex items-center gap-2">
                                <Icon name="home" className="w-3.5 h-3.5 opacity-50 shrink-0" />
                                Room: {period.classroom.room_number}
                              </div>
                            )}
                            {period.teacher && <div className="flex items-center gap-2"><Icon name="user" className="w-3.5 h-3.5 opacity-50 shrink-0" />Teacher: {period.teacher.first_name} {period.teacher.last_name}</div>}
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
      </div>
    </AuthenticatedLayout>
  );
}
