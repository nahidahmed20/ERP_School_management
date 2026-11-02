import { useState, useEffect } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';
import { publicMediaUrl } from '@/Utils/publicMediaUrl';

const getPhotoUrl = (path) => publicMediaUrl(path, '/images/default-avatar.svg');
const showPhotoFallback = (event) => {
  const image = event.currentTarget;
  if (image.getAttribute('src') !== '/images/default-avatar.svg') image.src = '/images/default-avatar.svg';
};

// --- Staff View Modal Component ---
function StaffViewModal({ staff, onClose }) {
  if (!staff) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] shadow-2xl overflow-hidden transform transition-all flex flex-col ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Icon name="briefcase" className="w-5 h-5 text-indigo-600" /> Staff Profile Details
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-slate-100">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* Top Info Banner */}
          <div className="flex flex-col sm:flex-row items-center gap-5 bg-gradient-to-r from-slate-50 to-indigo-50/30 p-6 rounded-2xl border border-slate-200">
            <div className="w-24 h-24 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center overflow-hidden border-4 border-white shadow-md shrink-0">
              {staff.photo ? (
                // 💡 Updated Here
                <img src={getPhotoUrl(staff.photo)} onError={showPhotoFallback} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Icon name="user" className="w-12 h-12 text-indigo-400" />
              )}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-slate-900">{staff.first_name} {staff.last_name || ''}</h2>
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-xs sm:text-sm text-slate-600 mt-2 font-medium">
                <span><strong>EMP ID:</strong> <span className="text-indigo-600 font-bold">{staff.staff_id_no}</span></span>
                <span className="hidden sm:inline">•</span>
                <span><strong>Designation:</strong> {staff.designation?.name}</span>
                <span className="hidden sm:inline">•</span>
                <span><strong>Department:</strong> {staff.department?.name}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Employment Info */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-indigo-600 border-b border-indigo-100 pb-2.5 uppercase tracking-wider">Employment Details</h4>
              <div className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                <div className="flex justify-between"><span>Joining Date:</span> <strong className="text-slate-900">{staff.joining_date}</strong></div>
                <div className="flex justify-between"><span>Basic Salary:</span> <strong className="text-slate-900">৳ {staff.basic_salary}</strong></div>
                <div className="flex justify-between"><span>Qualification:</span> <strong className="text-slate-900">{staff.qualification || 'N/A'}</strong></div>
                <div className="flex justify-between"><span>Experience:</span> <strong className="text-slate-900">{staff.experience || 'N/A'}</strong></div>
                <div className="flex justify-between items-center">
                  <span>Portal Access:</span>
                  {staff.user_id ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">Enabled</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">Disabled</span>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-sky-600 border-b border-sky-100 pb-2.5 uppercase tracking-wider">Personal Details</h4>
              <div className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                <div className="flex justify-between"><span>Father's Name:</span> <strong className="text-slate-900">{staff.father_name || 'N/A'}</strong></div>
                <div className="flex justify-between"><span>Mother's Name:</span> <strong className="text-slate-900">{staff.mother_name || 'N/A'}</strong></div>
                <div className="flex justify-between"><span>DOB / Gender:</span> <strong className="text-slate-900">{staff.date_of_birth} ({staff.gender})</strong></div>
                <div className="flex justify-between"><span>Blood Group:</span> <strong className="text-rose-600 font-bold">{staff.blood_group || 'N/A'}</strong></div>
                <div className="flex justify-between"><span>Marital Status:</span> <strong className="text-slate-900">{staff.marital_status || 'N/A'}</strong></div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-emerald-600 border-b border-emerald-100 pb-2.5 uppercase tracking-wider">Contact Details</h4>
              <div className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                <div className="flex justify-between"><span>Phone:</span> <strong className="text-slate-900">{staff.phone}</strong></div>
                <div className="flex justify-between"><span>Emergency:</span> <strong className="text-slate-900">{staff.emergency_phone || 'N/A'}</strong></div>
                <div className="flex justify-between"><span>Email:</span> <strong className="text-slate-900 truncate max-w-[150px]">{staff.email || 'N/A'}</strong></div>
              </div>
            </div>

          </div>

          {/* Address Info */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3 text-xs sm:text-sm">
            <div>
              <span className="font-semibold text-slate-500 block mb-1 uppercase tracking-wider text-[11px]">Present Address:</span>
              <p className="text-slate-800 leading-relaxed font-medium">{staff.present_address || 'N/A'}</p>
            </div>
            <div className="border-t border-slate-200 pt-3">
              <span className="font-semibold text-slate-500 block mb-1 uppercase tracking-wider text-[11px]">Permanent Address:</span>
              <p className="text-slate-800 leading-relaxed font-medium">{staff.permanent_address || 'N/A'}</p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end rounded-b-2xl shrink-0">
          <button type="button" className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Index Component ---
export default function Index({ staff, departments, designations, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [departmentId, setDepartmentId] = useState(filters.department_id ?? '');
  const [designationId, setDesignationId] = useState(filters.designation_id ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [deletingItem, setDeletingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
  }, [flash]);

  const applyFilters = (overrides = {}) => {
    router.get(route('admin.staff.index'), {
      department_id: departmentId, designation_id: designationId, search: search, per_page: perPage, ...overrides
    }, { preserveState: true, replace: true });
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (val === '') {
      applyFilters({ search: '' });
    }
  };

  const exportToCSV = () => {
    if (!staff.data.length) {
      return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    }
    const headers = ['EMP ID', 'Name', 'Department', 'Designation', 'Phone', 'Joining Date', 'Status'];
    const rows = staff.data.map(s => [
      s.staff_id_no,
      `${s.first_name} ${s.last_name || ''}`,
      s.department?.name,
      s.designation?.name,
      s.phone,
      s.joining_date,
      s.is_active ? 'Active' : 'Inactive'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Staff_List_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!staff.data.length) return;
    let text = "EMP ID\tName\tDepartment\tDesignation\tPhone\n";
    staff.data.forEach(s => { text += `${s.staff_id_no}\t${s.first_name} ${s.last_name || ''}\t${s.department?.name}\t${s.designation?.name}\t${s.phone}\n`; });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'টেবিল ডেটা ক্লিপবোর্ডে কপি হয়েছে!', showConfirmButton: false, timer: 2000 });
  };

  const handlePrint = () => {
    window.print();
  };

  const confirmDelete = () => {
    if (!deletingItem) return;
    router.delete(route('admin.staff.destroy', deletingItem.id), {
      onSuccess: () => setDeletingItem(null),
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Staff Directory" />

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

      <div className="print-title">Staff & Teachers Directory - {new Date().toLocaleDateString('en-GB')}</div>

      <div className="staff-directory-page w-full space-y-5 px-3 py-4 sm:space-y-6 sm:px-5 sm:py-6 lg:px-8 no-print">

        {/* Page Header */}
        <div className="flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 px-5 py-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <span className="text-xs font-extrabold tracking-[0.18em] text-emerald-800 uppercase">Directory</span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 sm:text-3xl">Staff &amp; Teachers Directory</h1>
            <p className="text-sm text-slate-500 mt-1">কর্মচারী, শিক্ষক ও স্টাফদের তথ্য, ফিল্টারিং ও পোর্টাল অ্যাক্সেস পরিচালনা করুন।</p>
          </div>
          <Link
            href={route('admin.staff.create')}
            className="w-full sm:w-auto inline-flex min-h-11 justify-center items-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900"
          >
            <Icon name="plus" className="w-4 h-4" /> Add New Staff
          </Link>
        </div>

        {/* Unified Modern Toolbar */}
        <div className="staff-directory-toolbar overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-1 border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div><h2 className="text-sm font-extrabold text-slate-800">Find staff members</h2><p className="mt-0.5 text-xs text-slate-500">Search by ID, name or phone, or filter by department and designation.</p></div>
            <span className="text-xs font-semibold text-slate-500">{staff.total ?? staff.data.length} records</span>
          </div>
          <div className="p-4 sm:p-5">
          <div className="staff-directory-filters grid w-full grid-cols-1 items-center gap-3 sm:grid-cols-2 xl:grid-cols-6">

            {/* Per Page */}
            <select
              value={perPage}
              onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 cursor-pointer"
              style={{ backgroundImage: 'none' }}
            >
              <option value="10">10 / Page</option>
              <option value="20">20 / Page</option>
              <option value="50">50 / Page</option>
              <option value="all">All</option>
            </select>

            {/* Department Filter */}
            <select
              value={departmentId}
              onChange={e => setDepartmentId(e.target.value)}
              className="staff-department-filter w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 cursor-pointer"
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>

            {/* Designation Filter */}
            <select
              value={designationId}
              onChange={e => setDesignationId(e.target.value)}
              className="staff-designation-filter w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 cursor-pointer"
            >
              <option value="">All Designations</option>
              {designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>

            {/* Search Input */}
            <div className="staff-directory-search relative min-w-0 sm:col-span-2 xl:col-span-2">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <Icon name="search" className="h-4 w-4 text-emerald-700" />
              </div>
              <input
                type="text"
                aria-label="Search staff by ID, name or phone"
                placeholder="Search by staff ID, name or phone"
                value={search}
                onChange={handleSearchChange}
                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm placeholder:text-slate-400 outline-none transition-all focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>

            {/* Apply Button */}
            <button
              onClick={() => applyFilters()}
              className="w-full sm:col-span-2 xl:col-span-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900"
            >
              <Icon name="search" className="h-4 w-4" />
              Search
            </button>
          </div>

          {/* Export Actions */}
          <div className="staff-directory-export-actions mt-4 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500"><Icon name="download" className="h-4 w-4" /> Export current list</div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
            <button onClick={copyToClipboard} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800" title="Copy to Clipboard">
              <Icon name="copy" className="h-4 w-4" /> Copy
            </button>
            <button onClick={exportToCSV} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-3 text-xs font-bold text-white transition hover:bg-emerald-900" title="Export CSV">
              <Icon name="excel" className="h-4 w-4" /> CSV
            </button>
            <button onClick={() => alert('Backend Excel plugin needed')} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800" title="Export Excel">
              <Icon name="excel" className="h-4 w-4" /> Excel
            </button>
            <button onClick={() => alert('Backend PDF plugin needed')} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700" title="Export PDF">
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
        <div className="staff-directory-table bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 print-table-wrapper">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-5 sm:px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Staff records</h2>
              <p className="text-xs text-slate-500 mt-0.5">Staff profiles, roles and contact details</p>
            </div>
            <span className="staff-directory-count inline-flex items-center self-start sm:self-auto rounded-full px-3 py-1 text-xs font-semibold">
              {staff.total ?? staff.data.length} records
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">SL</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">EMP ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Staff Profile</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department &amp; Role</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      কোনো স্টাফ ডেটা পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  staff.data.map((s, index) => (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-500">
                        {(staff.current_page - 1) * staff.per_page + index + 1}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-700 text-sm">
                        {s.staff_id_no}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getPhotoUrl(s.photo)}
                            alt={`${s.first_name} ${s.last_name || ''}`.trim()}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                            onError={showPhotoFallback}
                          />
                          <div>
                            <span className="text-sm font-bold text-slate-900 block">{s.first_name} {s.last_name || ''}</span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${s.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                {s.is_active ? 'Active' : 'Inactive'}
                              </span>
                              {s.user_id && (
                                <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-200" title="Has Portal Access">
                                  Portal Access
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-800 block">{s.designation?.name}</span>
                        <span className="text-xs text-slate-500 font-medium block mt-0.5">{s.department?.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-800 block">{s.phone}</span>
                        <span className="text-xs text-slate-500 block mt-0.5">{s.email || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 text-right no-print">
                        <div className="inline-flex items-center justify-end gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                          <button
                            onClick={() => setViewingItem(s)}
                            className="staff-action-button text-slate-500 hover:text-indigo-700 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                            title="View Profile"
                            aria-label={`View ${s.first_name} profile`}
                          >
                            <Icon name="eye" className="w-4 h-4" />
                          </button>
                          <Link
                            href={route('admin.staff.edit', s.id)}
                            className="staff-action-button text-slate-500 hover:text-sky-700 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                            title="Edit Staff"
                            aria-label={`Edit ${s.first_name}`}
                          >
                            <Icon name="edit" className="w-4 h-4" />
                          </Link>
                          <Link href={route('admin.staff.report',s.id)} className="staff-action-button text-slate-500 hover:text-emerald-700 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Staff Reports" aria-label={`${s.first_name} reports`}><Icon name="chart" className="w-4 h-4"/></Link>
                          <Link href={route('admin.staff.id-card',s.id)} className="staff-action-button text-slate-500 hover:text-violet-700 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Print ID Card" aria-label={`Print ${s.first_name} ID card`}><Icon name="printer" className="w-4 h-4"/></Link>
                          {s.user_id&&<Link href={route('admin.documents.certificates.index',{user_id:s.user_id})} className="staff-action-button text-slate-500 hover:text-amber-700 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Certificates" aria-label={`${s.first_name} certificates`}><Icon name="document" className="w-4 h-4"/></Link>}
                          <button
                            onClick={() => setDeletingItem(s)}
                            className="staff-action-button text-slate-500 hover:text-rose-700 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                            title="Delete Staff"
                            aria-label={`Delete ${s.first_name}`}
                          >
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
            <Pagination meta={staff} />
          </div>
        </div>
      </div>

      {/* Modals */}
      {viewingItem && (
        <StaffViewModal staff={viewingItem} onClose={() => setViewingItem(null)} />
      )}

      {deletingItem && (
        <ConfirmDeleteModal
          item={deletingItem}
          message={deletingItem.user_id ? "Are you sure? This will also permanently delete their User Account (Portal Access)." : "Are you sure you want to delete this staff record?"}
          onCancel={() => setDeletingItem(null)}
          onConfirm={confirmDelete}
        />
      )}
    </AuthenticatedLayout>
  );
}
