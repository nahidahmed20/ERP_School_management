import { useState, useEffect } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

function StudentViewModal({ student, onClose }) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [student]);

  if (!student) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row shadow-2xl overflow-hidden transform transition-all ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:hidden w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 z-50"
        >
          <Icon name="close" className="w-4 h-4" />
        </button>

        <div className="w-full md:w-2/5 lg:w-1/3 bg-slate-50 border-r border-slate-100 p-8 flex flex-col items-center text-center shrink-0 overflow-y-auto">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-white ring-4 ring-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-300 mb-5 relative group">
            {student.photo && !imageError ? (
              <img
                src={`/storage/${student.photo}`}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <svg className="w-16 h-16 text-slate-300 mt-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all">
              <Link href={route('admin.students.edit', student.id)} className="text-white text-xs font-semibold px-3 py-1.5 border border-white/50 rounded-lg hover:bg-white/20">
                Change Photo
              </Link>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight mb-1">
            {student.first_name} {student.last_name}
          </h2>
          <p className="text-sm font-medium text-slate-500 mb-4">{student.campus?.name ?? 'Main Campus'}</p>

          <div className="flex flex-wrap justify-center gap-2 w-full mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/50">
              ID: {student.admission_no}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/50">
              Active Student
            </span>
          </div>

          <div className="w-full space-y-3 mt-auto pt-6">
            <Link href={route('admin.students.edit', student.id)} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm">
              <Icon name="edit" className="w-4 h-4" /> Edit Full Profile
            </Link>
            <button className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-indigo-600 border border-transparent rounded-xl text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
              <Icon name="printer" className="w-4 h-4" /> Print ID Card
            </button>
          </div>
        </div>

        <div className="w-full md:w-3/5 lg:w-2/3 flex flex-col bg-white">
          <div className="hidden md:flex justify-end p-4 border-b border-slate-50">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
            <section>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Academic Info
              </h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Class & Section</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">{student.current_enrollment?.school_class?.name ?? 'N/A'} ({student.current_enrollment?.section?.name ?? 'N/A'})</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Roll Number</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">{student.current_enrollment?.roll_no ?? 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Admission Date</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">{student.admission_date ?? 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Category / House</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">{student.category?.name || 'General'} • {student.house?.name || 'No House'}</dd>
                </div>
              </dl>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Personal Details
              </h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Date of Birth</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">{student.date_of_birth ?? 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Gender</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900 capitalize">{student.gender ?? 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Blood Group</dt>
                  <dd className="mt-1 text-sm font-bold text-rose-600">{student.blood_group || 'Not Specified'}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Religion & Nationality</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">{student.religion ?? 'N/A'} ({student.nationality ?? 'N/A'})</dd>
                </div>
              </dl>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Guardian & Contacts
              </h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Father's Name</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">{student.guardian?.father_name ?? 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Father's Phone</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">{student.guardian?.father_phone ?? 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Mother's Name</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">{student.guardian?.mother_name ?? 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Guardian Email</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900 truncate" title={student.guardian?.guardian_email}>
                    {student.guardian?.guardian_email || 'N/A'}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Present Address</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                    {student.present_address ?? 'Address not provided'}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Index({ students, classes, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [classId, setClassId] = useState(filters.class_id ?? '');
  const [sectionId, setSectionId] = useState(filters.section_id ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [deletingItem, setDeletingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  const selectedClass = classes.find(c => c.id == classId);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000 });
  }, [flash]);

  useEffect(() => {
    const closeDropdown = () => setOpenDropdown(null);
    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, []);

  const applyFilters = (overrides = {}) => {
    router.get(route('admin.students.index'), {
      class_id: classId,
      section_id: sectionId,
      search: search,
      per_page: perPage,
      ...overrides
    }, { preserveState: true, replace: true });
  };

  const handlePrint = () => window.print();

  const exportToCSV = () => {
    if (!students.data.length) return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    const headers = ['Admission No', 'Student Name', 'Category', 'Campus', 'Class', 'Section', 'Roll', 'Father Name', 'Phone'];
    const rows = students.data.map(s => [
      s.admission_no, `${s.first_name} ${s.last_name || ''}`, s.category?.name || 'General', s.campus?.name ?? '',
      s.current_enrollment?.school_class?.name ?? '', s.current_enrollment?.section?.name ?? '', s.current_enrollment?.roll_no ?? '',
      s.guardian?.father_name ?? '', s.guardian?.father_phone ?? ''
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Students_Directory_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!students.data.length) return;
    let text = "Admission No\tStudent Name\tClass\tRoll\tFather's Name\tPhone\n";
    students.data.forEach(s => {
      text += `${s.admission_no}\t${s.first_name} ${s.last_name || ''}\t${s.current_enrollment?.school_class?.name ?? ''}\t${s.current_enrollment?.roll_no ?? ''}\t${s.guardian?.father_name ?? ''}\t${s.guardian?.father_phone ?? ''}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Table data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Students Directory" />

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          nav, aside, header, .no-print, button, a, select, input { display: none !important; }
          body, html { background: #f8fafc !important; }
          .print-table-wrapper { width: 100% !important; border: none !important; box-shadow: none !important; }
          .print-title { display: block !important; font-size: 24px !important; font-weight: bold !important; margin-bottom: 20px !important; }
        }
        @media screen { .print-title { display: none; } }
      `}} />

      <div className="print-title">Students Directory - {new Date().toLocaleDateString('en-GB')}</div>

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8 no-print">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Directory</h1>
            <p className="text-sm text-slate-500 mt-1">Manage enrollments, view profiles, and update records.</p>
          </div>
          <Link
            href={route('admin.students.create')}
            className="inline-flex w-full sm:w-auto justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/20 active:scale-95"
          >
            <Icon name="plus" className="w-4 h-4" /> New Admission
          </Link>
        </div>

        {/* ----------------------------------------------------- */}
        {/* Unified Modern Toolbar (FULLY RESPONSIVE)           */}
        {/* ----------------------------------------------------- */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6">

          {/* Left Group: Filters */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full lg:w-auto">

            <select
              value={perPage}
              onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}
              className="w-full sm:w-auto appearance-none bg-none py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer text-center sm:text-left"
              style={{ backgroundImage: 'none' }}
            >
              <option value="10">10 / Page</option>
              <option value="25">25 / Page</option>
              <option value="50">50 / Page</option>
              <option value="100">100 / Page</option>
              <option value="all">All</option>
            </select>

            <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

            <div className="relative w-full sm:w-56">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <select
              value={classId}
              onChange={e => { setClassId(e.target.value); setSectionId(''); }}
              className="w-full sm:w-36 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select
              value={sectionId}
              onChange={e => setSectionId(e.target.value)}
              disabled={!classId}
              className="w-full sm:w-36 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer disabled:opacity-50"
            >
              <option value="">All Sections</option>
              {selectedClass?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <button
              onClick={() => applyFilters()}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              Apply
            </button>
          </div>

          {/* Right Group: Export Actions (Responsive Fix) */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center justify-between sm:justify-end gap-3 border-t lg:border-none border-slate-100 pt-4 lg:pt-0 mt-2 lg:mt-0">
            <div className="flex items-center justify-between sm:justify-center w-full sm:w-auto gap-1 bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
              <button
                onClick={copyToClipboard}
                className="flex-1 sm:flex-none flex justify-center items-center gap-2 py-2 px-3 text-slate-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                title="Copy Table"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span className="sm:hidden text-xs font-semibold">Copy</span>
              </button>

              <div className="w-px h-5 bg-slate-200 mx-1"></div>

              <button
                onClick={exportToCSV}
                className="flex-1 sm:flex-none flex justify-center items-center gap-2 py-2 px-3 text-slate-500 hover:text-emerald-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                title="Export CSV"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span className="sm:hidden text-xs font-semibold">CSV</span>
              </button>

              <div className="w-px h-5 bg-slate-200 mx-1"></div>

              <button
                onClick={handlePrint}
                className="flex-1 sm:flex-none flex justify-center items-center gap-2 py-2 px-3 text-slate-500 hover:text-rose-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                title="Print"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                <span className="sm:hidden text-xs font-semibold">Print</span>
              </button>
            </div>
          </div>

        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 print-table-wrapper" style={{ minHeight: '400px' }}>
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Details</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrollment</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Guardian</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.data.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                          <Icon name="users" className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-base font-medium text-slate-900">No students found</p>
                        <p className="text-sm text-slate-500 mt-1">Adjust your filters or add a new student.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  students.data.map((student) => {
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="relative w-10 h-10 rounded-full bg-slate-100 ring-2 ring-white shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                                {student.photo ? (
                                  <img
                                    src={`/storage/${student.photo}`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'block';
                                    }}
                                  />
                                ) : null}
                                <svg
                                  className="w-6 h-6 text-slate-300 mt-1"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                  style={{ display: student.photo ? 'none' : 'block' }}
                                >
                                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div>
                              <span className="text-sm font-bold text-slate-900 block cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => setViewingItem(student)}>
                                {student.first_name} {student.last_name || ''}
                              </span>
                              <span className="text-xs text-slate-500 font-mono mt-0.5 block">{student.admission_no}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {student.current_enrollment ? (
                            <div>
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 mb-1 border border-indigo-100">
                                Class {student.current_enrollment.school_class?.name} • {student.current_enrollment.section?.name}
                              </span>
                              <div className="text-xs text-slate-500 font-medium ml-1">Roll: {student.current_enrollment.roll_no || 'N/A'}</div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-500">
                              Not Enrolled
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900">{student.guardian?.father_name ?? 'N/A'}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <Icon name="phone" className="w-3 h-3 text-slate-400" /> {student.guardian?.father_phone ?? 'N/A'}
                          </div>
                        </td>

                        <td className="px-6 py-4 no-print text-right relative">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); setViewingItem(student); }}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors tooltip-trigger"
                              title="Quick View"
                            >
                              <Icon name="eye" className="w-4 h-4" />
                            </button>

                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdown(openDropdown === student.id ? null : student.id);
                                }}
                                className={`p-2 rounded-lg transition-colors ${openDropdown === student.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'}`}
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle>
                                </svg>
                              </button>

                              {openDropdown === student.id && (
                                <div
                                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl ring-1 ring-slate-900/5 z-50 py-2 animate-in fade-in zoom-in-95 duration-100 origin-top-right"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="px-3 py-1.5 mb-1 border-b border-slate-50">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Actions</p>
                                  </div>

                                  <Link href={route('admin.students.edit', student.id)} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                                    <Icon name="edit" className="w-4 h-4" /> Edit Profile
                                  </Link>
                                  <Link href={route('admin.students.id-card', student.id)} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                                    <Icon name="printer" className="w-4 h-4" /> Print ID Card
                                  </Link>
                                  <Link href={route('admin.students.attendance', student.id)} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                                    <Icon name="calendar" className="w-4 h-4" /> Attendance
                                  </Link>
                                  <Link href={route('admin.students.results', student.id)} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                                    <Icon name="book" className="w-4 h-4" /> Results
                                  </Link>
                                  <Link href={route('admin.students.fees', student.id)} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                                    <Icon name="wallet" className="w-4 h-4" /> Fees History
                                  </Link>

                                  <div className="h-px bg-slate-100 my-1"></div>

                                  <button
                                    onClick={() => { setOpenDropdown(null); setDeletingItem(student); }}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                                  >
                                    <Icon name="trash" className="w-4 h-4" /> Delete Record
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="no-print border-t border-slate-100 bg-white px-6 py-4 rounded-b-2xl">
            <Pagination meta={students} />
          </div>
        </div>
      </div>

      {viewingItem && (
        <StudentViewModal student={viewingItem} onClose={() => setViewingItem(null)} />
      )}

      {deletingItem && (
        <ConfirmDeleteModal
          item={deletingItem}
          onCancel={() => setDeletingItem(null)}
          onConfirm={() => {
            router.delete(route('admin.students.destroy', deletingItem.id), {
              onSuccess: () => setDeletingItem(null)
            });
          }}
        />
      )}
    </AuthenticatedLayout>
  );
}
