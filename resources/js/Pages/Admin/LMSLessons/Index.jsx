import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import LessonFormModal from './Partials/LessonFormModal';
import LessonShowModal from './Partials/LessonShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ lessons, courses, classes, campuses, filters }) {
  const { flash, auth } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [classId, setClassId] = useState(filters.class_id ?? '');
  const [subjectId, setSubjectId] = useState(filters.subject_id ?? '');
  const [courseId, setCourseId] = useState(filters.course_id ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    }
    if (flash?.error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
    }
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.lms.lessons.index'), {
      search, class_id: classId, subject_id: subjectId, course_id: courseId, per_page: perPage, ...overrides,
    }, { preserveState: true, replace: true });
  }

  const filterAvailableSubjects = classId ? classes.find(c => c.id == classId)?.subjects || [] : [];

  let filterAvailableCourses = courses;
  if (classId) filterAvailableCourses = filterAvailableCourses.filter(c => c.school_class_id == classId);
  if (subjectId) filterAvailableCourses = filterAvailableCourses.filter(c => c.subject_id == subjectId);

  // --- Export Functions ---
  const handlePrint = () => window.print();

  const exportToCSV = () => {
    if (!lessons.data.length) return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    const headers = ['Lesson Title', 'Course Name', 'Materials', 'Status'];
    const rows = lessons.data.map(item => [
      item.title || 'N/A',
      item.course?.title || 'N/A',
      item.video_url && item.document_path ? 'Video & File' : item.video_url ? 'Video' : item.document_path ? 'File' : 'Text Only',
      item.is_active ? 'Active' : 'Inactive'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `LMS_Lessons_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!lessons.data.length) return;
    let text = "Lesson Title\tCourse Name\tMaterials\tStatus\n";
    lessons.data.forEach(item => {
      text += `${item.title || 'N/A'}\t${item.course?.title || 'N/A'}\t${item.video_url ? 'Video' : ''} ${item.document_path ? 'File' : ''}\t${item.is_active ? 'Active' : 'Inactive'}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Lessons & Materials" />

      {/* Print Specific CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          nav, aside, header, .no-print, button, a, select, input { display: none !important; }
          body, html { background: #f8fafc !important; }
          .print-table-wrapper { width: 100% !important; border: none !important; box-shadow: none !important; }
          .print-title { display: block !important; font-size: 24px !important; font-weight: bold !important; margin-bottom: 20px !important; }
        }
        @media screen { .print-title { display: none; } }
      `}} />

      <div className="print-title">LMS Lessons & Materials - {new Date().toLocaleDateString('en-GB')}</div>

      <div className="w-full space-y-5 px-3 py-4 sm:space-y-6 sm:px-5 sm:py-6 lg:px-8 no-print">

        {/* Page Header */}
        <div className="flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 px-5 py-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <span className="text-xs font-extrabold tracking-[0.18em] text-emerald-800 uppercase">LMS · Learning Management</span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 sm:text-3xl">Lessons &amp; Study Materials</h1>
            <p className="text-sm text-slate-500 mt-1">কোর্সের জন্য ভিডিও লেসন এবং পিডিএফ ম্যাটেরিয়াল আপলোড করুন।</p>
          </div>
          <button
            onClick={() => { setEditingItem(null); setFormOpen(true); }}
            className="w-full sm:w-auto inline-flex min-h-11 justify-center items-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900"
          >
            <Icon name="plus" className="w-4 h-4" /> Add Lesson
          </button>
        </div>

        {/* Search, filters and export tools */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-1 border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div><h2 className="text-sm font-extrabold text-slate-800">Find lessons and materials</h2><p className="mt-0.5 text-xs text-slate-500">Narrow the library by class, subject or course.</p></div>
            <span className="text-xs font-semibold text-slate-500">{lessons.total ?? lessons.data.length} lessons</span>
          </div>
          <div className="p-4 sm:p-5">
            <div className="lms-lessons-filters grid w-full grid-cols-1 items-center gap-3 sm:grid-cols-2 xl:grid-cols-7">
              <select value={perPage} onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 cursor-pointer" style={{ backgroundImage: 'none' }}>
                <option value="10">10 / Page</option><option value="50">50 / Page</option><option value="all">All</option>
              </select>
              <select value={classId} onChange={e => { setClassId(e.target.value); setSubjectId(''); setCourseId(''); applyFilters({ class_id: e.target.value, subject_id: '', course_id: '' }); }} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 cursor-pointer">
                <option value="">All Classes</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={subjectId} onChange={e => { setSubjectId(e.target.value); setCourseId(''); applyFilters({ subject_id: e.target.value, course_id: '' }); }} disabled={!classId} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60">
                <option value="">{classId ? 'All Subjects' : 'Class First'}</option>{filterAvailableSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select value={courseId} onChange={e => { setCourseId(e.target.value); applyFilters({ course_id: e.target.value }); }} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 cursor-pointer">
                <option value="">All Courses</option>{filterAvailableCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <div className="relative min-w-0 sm:col-span-2 xl:col-span-2">
                <Icon name="search" className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-emerald-700" />
                <input type="text" placeholder="Search lessons..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyFilters()} className="block min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/20" />
              </div>
              <button onClick={() => applyFilters()} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900 sm:col-span-2 xl:col-span-1"><Icon name="filter" className="h-4 w-4" /> Filter lessons</button>
            </div>

            <div className="project-export-toolbar mt-4 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500"><Icon name="download" className="h-4 w-4" /> Export current list</div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={copyToClipboard} title="Copy to Clipboard"><Icon name="copy" className="h-4 w-4" /> Copy</button>
                <button onClick={exportToCSV} title="Export CSV"><Icon name="excel" className="h-4 w-4" /> CSV</button>
                <button onClick={() => alert('Backend Excel plugin needed')} title="Export Excel"><Icon name="excel" className="h-4 w-4" /> Excel</button>
                <button onClick={() => alert('Backend PDF plugin needed')} title="Export PDF"><Icon name="pdf" className="h-4 w-4" /> PDF</button>
                <button onClick={handlePrint} title="Print List"><Icon name="printer" className="h-4 w-4" /> Print</button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Table Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm print-table-wrapper">
          <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div><h2 className="text-sm font-bold text-slate-900">Lesson library</h2><p className="mt-0.5 text-xs text-slate-500">Videos, downloadable files and lesson notes</p></div>
            <span className="self-start rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 sm:self-auto">{lessons.total ?? lessons.data.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lesson Title</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Course Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Materials</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lessons.data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      কোনো লেসন বা ম্যাটেরিয়াল পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  lessons.data.map((item) => (
                    <tr key={item.id} className="transition-colors hover:bg-slate-50/70">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                            <Icon name="play-circle" className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-bold text-slate-900">{item.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                        {item.course?.title}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {item.video_url && (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-rose-50 text-rose-700 border border-rose-200">
                              Video
                            </span>
                          )}
                          {item.document_path && (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-sky-50 text-sky-700 border border-sky-200">
                              File / PDF
                            </span>
                          )}
                          {!item.video_url && !item.document_path && (
                            <span className="text-slate-400 text-xs italic">Text Only</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${item.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right no-print">
                        <div className="inline-flex items-center justify-end gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                          <button onClick={() => setViewingItem(item)} className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-emerald-800 hover:shadow-sm" title="View Details" aria-label={`View ${item.title}`}>
                            <Icon name="eye" className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setEditingItem(item); setFormOpen(true); }} className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-amber-700 hover:shadow-sm" title="Edit Lesson" aria-label={`Edit ${item.title}`}>
                            <Icon name="edit" className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeletingItem(item)} className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-rose-700 hover:shadow-sm" title="Delete Lesson" aria-label={`Delete ${item.title}`}>
                            <Icon name="trash" className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="no-print border-t border-slate-100 bg-white px-6 py-4 rounded-b-2xl">
            <Pagination meta={lessons} />
          </div>
        </div>
      </div>

      {formOpen && <LessonFormModal item={editingItem} courses={courses} classes={classes} campuses={campuses} activeCampusId={auth?.active_campus_id} onClose={() => setFormOpen(false)} />}

      {viewingItem && <LessonShowModal item={viewingItem} onClose={() => setViewingItem(null)} />}

      {deletingItem && (
        <ConfirmDeleteModal item={{ name: `Lesson: ${deletingItem.title}` }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.lms.lessons.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}
