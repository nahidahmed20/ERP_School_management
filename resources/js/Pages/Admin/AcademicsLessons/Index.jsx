import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import FormModal from './Partials/FormModal';
import ShowModal from './Partials/ShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ lessons, classes, subjects, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [classId, setClassId] = useState(filters.class_id ?? '');
  const [subjectId, setSubjectId] = useState(filters.subject_id ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');
  const filterSubjects = classId
    ? classes.find((schoolClass) => String(schoolClass.id) === String(classId))?.subjects ?? []
    : subjects;

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showItem, setShowItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
      setFormOpen(false);
    }
  }, [flash]);

  const applyFilters = (overrides = {}) => {
    router.get(route('admin.lesson-plans.index'), {
      search,
      class_id: classId,
      subject_id: subjectId,
      per_page: perPage,
      ...overrides
    }, { preserveState: true, replace: true });
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      router.delete(route('admin.lesson-plans.destroy', deleteId), {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const getStatusBadge = (s) => {
    if (s === 'Completed') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'Ongoing') return 'bg-sky-50 text-sky-700 border-sky-200';
    return 'bg-amber-50 text-amber-700 border-amber-200'; // Pending
  };

  // --- Export Functions ---
  const handlePrint = () => window.print();

  const exportToCSV = () => {
    if (!lessons.data.length) return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    const headers = ['Title', 'Class', 'Subject', 'Status'];
    const rows = lessons.data.map(item => [
      item.title || 'N/A',
      item.school_class?.name || 'N/A',
      item.subject?.name || 'N/A',
      item.status || 'N/A'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Lesson_Plans_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!lessons.data.length) return;
    let text = "Title\tClass\tSubject\tStatus\n";
    lessons.data.forEach(item => {
      text += `${item.title || 'N/A'}\t${item.school_class?.name || 'N/A'}\t${item.subject?.name || 'N/A'}\t${item.status || 'N/A'}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Lesson & Syllabus" />

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

      <div className="print-title">Lesson & Syllabus - {new Date().toLocaleDateString('en-GB')}</div>

      <div className="lessons-directory-page w-full space-y-6 px-3 py-4 sm:px-5 sm:py-6 lg:px-8 no-print">

        {/* Page Header */}
        <div className="flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 px-5 py-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <span className="text-xs font-extrabold tracking-[0.18em] text-emerald-800 uppercase">Academics</span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 sm:text-3xl">Lesson & Syllabus</h1>
            <p className="text-sm text-slate-500 mt-1">শ্রেণি ও বিষয়ভিত্তিক সিলেবাস এবং লেসন প্ল্যান তৈরি করুন।</p>
          </div>
          <button
            onClick={() => { setEditingItem(null); setFormOpen(true); }}
            className="w-full sm:w-auto inline-flex min-h-11 justify-center items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
          >
            <Icon name="plus" className="w-4 h-4" /> Add Lesson
          </button>
        </div>

        {/* Unified Modern Toolbar */}
        <div className="lessons-directory-toolbar overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-1 border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div><h2 className="text-sm font-extrabold text-slate-800">Find lesson plans</h2><p className="mt-0.5 text-xs text-slate-500">Search by title or narrow the list by class and subject.</p></div>
            <span className="text-xs font-semibold text-slate-500">{lessons.total ?? lessons.data.length} records</span>
          </div>
          <div className="p-4 sm:p-5">
          <div className="lessons-directory-filters grid w-full grid-cols-1 items-center gap-3 sm:grid-cols-2 xl:grid-cols-5">

            {/* Per Page */}
            <select
              value={perPage}
              onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 cursor-pointer"
              style={{ backgroundImage: 'none' }}
            >
              <option value="10">10 / Page</option>
              <option value="50">50 / Page</option>
              <option value="all">All Page</option>
            </select>

            {/* Class Filter */}
            <select
              value={classId}
              onChange={(e) => {
                setClassId(e.target.value);
                setSubjectId('');
                applyFilters({ class_id: e.target.value, subject_id: '' });
              }}
              className="lesson-class-filter w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 cursor-pointer"
            >
              <option value="">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            {/* Subject Filter */}
            <select
              value={subjectId}
              onChange={(e) => { setSubjectId(e.target.value); applyFilters({ subject_id: e.target.value }); }}
              className="lesson-subject-filter w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">All Subjects</option>
              {filterSubjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>

            {/* Search Input */}
            <div className="lessons-directory-search relative min-w-0 sm:col-span-2 xl:col-span-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm placeholder:text-slate-400 outline-none transition-all focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/15"
              />
            </div>

            {/* Apply Button */}
            <button
              onClick={() => applyFilters()}
              className="w-full sm:col-span-2 xl:col-span-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900"
            >
              <Icon name="filter" className="h-4 w-4" />
              Filter
            </button>
          </div>

          {/* Export Actions */}
          <div className="lessons-directory-export-actions mt-4 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500"><Icon name="download" className="h-4 w-4" /> Export current list</div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
              <button onClick={copyToClipboard} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800" title="Copy to Clipboard">
                <Icon name="copy" className="h-4 w-4" /> Copy
              </button>
              <button onClick={exportToCSV} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-3 text-xs font-bold text-white transition hover:bg-emerald-900" title="Export CSV">
                <Icon name="excel" className="h-4 w-4" /> CSV file
              </button>
              <button type="button" disabled title="Excel export is not configured" className="inline-flex min-h-10 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 text-xs font-bold text-slate-400">
                <Icon name="excel" className="h-4 w-4" /> Excel
              </button>
              <button type="button" disabled title="PDF export is not configured" className="inline-flex min-h-10 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 text-xs font-bold text-slate-400">
                <Icon name="pdf" className="h-4 w-4" /> PDF
              </button>
              <button onClick={handlePrint} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-800" title="Print List">
                <Icon name="printer" className="h-4 w-4" /> Print
              </button>
            </div>
          </div>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="lessons-directory-table bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 print-table-wrapper">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-5 sm:px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Lesson plans</h2>
              <p className="text-xs text-slate-500 mt-0.5">Syllabus, class assignments and learning resources</p>
            </div>
            <span className="lessons-directory-count inline-flex items-center self-start sm:self-auto rounded-full px-3 py-1 text-xs font-semibold">
              {lessons.total ?? lessons.data.length} records
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title / Topic</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Attachment</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lessons.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      কোনো লেসন বা সিলেবাস পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  lessons.data.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                            <Icon name="book" className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold text-slate-900">{item.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-bold whitespace-nowrap">
                          {item.school_class?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                        {item.subject?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        {item.attachment ? (
                          <a href={`/storage/${item.attachment}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100">
                            <Icon name="download" className="w-3.5 h-3.5" /> View File
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs italic">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right no-print">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => setShowItem(item)} className="lesson-action-button p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Details">
                            <Icon name="eye" className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setEditingItem(item); setFormOpen(true); }} className="lesson-action-button p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit Lesson">
                            <Icon name="edit" className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(item.id)} className="lesson-action-button p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Lesson">
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

      {/* Modals */}
      {formOpen && <FormModal item={editingItem} classes={classes} onClose={() => setFormOpen(false)} />}
      {showItem && <ShowModal item={showItem} onClose={() => setShowItem(null)} />}

      {deleteId && (
        <ConfirmDeleteModal
            item={{ name: "Lesson Plan" }}
            onClose={() => setDeleteId(null)}
            onCancel={() => setDeleteId(null)}
            onConfirm={handleDeleteConfirm}
        />
      )}

    </AuthenticatedLayout>
  );
}
