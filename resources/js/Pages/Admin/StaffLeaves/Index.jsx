import { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

// --- View Details Modal ---
function ViewLeaveModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Leave Details</h3>
            <p className="text-sm text-slate-500 mt-0.5">Staff leave application overview.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-200 shadow-sm">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Staff Name</span>
              <strong className="text-sm text-slate-900 mt-0.5 block">{item.staff?.first_name} {item.staff?.last_name || ''}</strong>
              <span className="text-xs text-slate-400 font-mono">ID: {item.staff?.staff_id_no}</span>
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Leave Type</span>
              <strong className="text-sm text-indigo-600 mt-0.5 block">{item.leave_type?.name}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="block font-bold text-slate-400 uppercase">Start Date</span>
              <span className="font-mono font-bold text-slate-800 text-sm">{item.start_date}</span>
            </div>
            <div>
              <span className="block font-bold text-slate-400 uppercase">End Date</span>
              <span className="font-mono font-bold text-slate-800 text-sm">{item.end_date}</span>
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Reason / Note</span>
            <div className="text-sm text-slate-700 bg-amber-50/50 border border-amber-100 p-3.5 rounded-xl min-h-[60px] whitespace-pre-wrap leading-relaxed">
              {item.reason}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</span>
              <span className={`inline-flex px-3 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border ${
                item.status?.toLowerCase() === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                item.status?.toLowerCase() === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {item.status}
              </span>
            </div>
            {item.attachment && (
              <div>
                <a href={`/storage/${item.attachment}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-100 shadow-sm">
                  <Icon name="download" className="w-3.5 h-3.5" /> View Attachment
                </a>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end rounded-b-2xl shrink-0">
          <button type="button" className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Form Modal Component ---
function LeaveFormModal({ item, staffs, leaveTypes, onClose, isSuperAdmin }) {
  const isEdit = !!item;

  const { data, setData, post, processing, errors, reset } = useForm({
    _method: isEdit ? 'PUT' : 'POST',
    staff_id: item?.staff_id ?? '',
    leave_type_id: item?.leave_type_id ?? '',
    start_date: item?.start_date ?? '',
    end_date: item?.end_date ?? '',
    reason: item?.reason ?? '',
    status: item?.status ?? 'pending',
    attachment: null,
  });

  const submit = (e) => {
    e.preventDefault();
    const routeName = isEdit ? route('admin.staff-leaves.update', item.id) : route('admin.staff-leaves.store');
    post(routeName, { forceFormData: true, onSuccess: () => { reset(); onClose(); } });
  };

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] shadow-2xl overflow-hidden transform transition-all flex flex-col ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Leave Application' : 'Add Leave Application'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure staff leave details.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-slate-100">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden" encType="multipart/form-data">
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div>
                <label className={labelClass}>Select Staff <span className="text-rose-500">*</span></label>
                <select value={data.staff_id} onChange={e => setData('staff_id', e.target.value)} required className={inputClass}>
                  <option value="" disabled>-- Choose Staff --</option>
                  {staffs.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name || ''} ({s.staff_id_no})</option>)}
                </select>
                {errors.staff_id && <p className="text-rose-500 text-xs mt-1">{errors.staff_id}</p>}
              </div>

              <div>
                <label className={labelClass}>Leave Type <span className="text-rose-500">*</span></label>
                <select value={data.leave_type_id} onChange={e => setData('leave_type_id', e.target.value)} required className={inputClass}>
                  <option value="" disabled>-- Choose Type --</option>
                  {leaveTypes.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                {errors.leave_type_id && <p className="text-rose-500 text-xs mt-1">{errors.leave_type_id}</p>}
              </div>

              <div>
                <label className={labelClass}>Start Date <span className="text-rose-500">*</span></label>
                <input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} required className={`${inputClass} font-mono`} />
                {errors.start_date && <p className="text-rose-500 text-xs mt-1">{errors.start_date}</p>}
              </div>

              <div>
                <label className={labelClass}>End Date <span className="text-rose-500">*</span></label>
                <input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} required className={`${inputClass} font-mono`} />
                {errors.end_date && <p className="text-rose-500 text-xs mt-1">{errors.end_date}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Reason / Note <span className="text-rose-500">*</span></label>
                <textarea value={data.reason} onChange={e => setData('reason', e.target.value)} required rows="3" placeholder="Enter reason for leave..." className={`${inputClass} resize-none`} />
                {errors.reason && <p className="text-rose-500 text-xs mt-1">{errors.reason}</p>}
              </div>

              {isSuperAdmin && (
                <div>
                  <label className={labelClass}>Status</label>
                  <select value={data.status} onChange={e => setData('status', e.target.value)} className={inputClass}>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              )}

              <div className={isSuperAdmin ? '' : 'sm:col-span-2'}>
                <label className={labelClass}>Attachment <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input 
                  type="file" 
                  onChange={e => setData('attachment', e.target.files[0])} 
                  accept=".jpg,.png,.jpeg,.pdf" 
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all border border-slate-200 rounded-xl bg-slate-50 cursor-pointer" 
                />
                {errors.attachment && <p className="text-rose-500 text-xs mt-1">{errors.attachment}</p>}
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} disabled={processing} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
              {processing ? 'Saving...' : 'Save Leave'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Index Component ---
export default function Index({ staffLeaves, staffs, leaveTypes, filters }) {
  const { auth, flash } = usePage().props;
  const isSuperAdmin = auth?.user?.roles?.includes('Super Admin') || auth?.user?.role === 'Super Admin';

  const [search, setSearch] = useState(filters.search ?? '');
  const [status, setStatus] = useState(filters.status ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [formOpen, setFormOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
  }, [flash]);

  const applyFilters = (overrides = {}) => {
    router.get(route('admin.staff-leaves.index'), {
      search: search, status: status, per_page: perPage, ...overrides
    }, { preserveState: true, replace: true });
  };

  const handleQuickStatus = (leave, newStatus) => {
    const actionText = newStatus === 'approved' ? 'Approve' : 'Reject';
    const color = newStatus === 'approved' ? '#16a34a' : '#dc2626';

    Swal.fire({
      title: `Are you sure?`,
      text: `Do you want to ${actionText} this leave?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: color,
      cancelButtonColor: '#64748b',
      confirmButtonText: `Yes, ${actionText}`,
      customClass: { popup: 'rounded-2xl' }
    }).then((result) => {
      if (result.isConfirmed) {
        setLoadingId(leave.id);

        router.put(route('admin.staff-leaves.update', leave.id), {
          _method: 'PUT',
          staff_id: leave.staff_id,
          leave_type_id: leave.leave_type_id,
          start_date: leave.start_date,
          end_date: leave.end_date,
          reason: leave.reason,
          status: newStatus
        }, {
          preserveScroll: true,
          onFinish: () => setLoadingId(null)
        });
      }
    });
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === 'approved') return <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">Approved</span>;
    if (s === 'rejected') return <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-rose-50 text-rose-700 border border-rose-200">Rejected</span>;
    return <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-amber-50 text-amber-700 border border-amber-200">Pending</span>;
  };

  // --- Export Functions ---
  const handlePrint = () => window.print();

  const exportToCSV = () => {
    if (!staffLeaves.data.length) return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    const headers = ['Start Date', 'End Date', 'Staff Name', 'Leave Type', 'Status'];
    const rows = staffLeaves.data.map(item => [
      item.start_date || 'N/A', 
      item.end_date || 'N/A', 
      `${item.staff?.first_name || ''} ${item.staff?.last_name || ''}`, 
      item.leave_type?.name || 'N/A', 
      item.status || 'Pending'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Staff_Leaves_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!staffLeaves.data.length) return;
    let text = "Start Date\tEnd Date\tStaff Name\tLeave Type\tStatus\n";
    staffLeaves.data.forEach(item => {
      text += `${item.start_date}\t${item.end_date}\t${item.staff?.first_name || ''} ${item.staff?.last_name || ''}\t${item.leave_type?.name}\t${item.status}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Staff Leaves" />

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

      <div className="print-title">Staff Leave Applications - {new Date().toLocaleDateString('en-GB')}</div>

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8 no-print">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">HR & Administration</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Leave Applications</h1>
            <p className="text-sm text-slate-500 mt-1">শিক্ষক ও কর্মচারীদের ছুটির আবেদনসমূহ পর্যালোচনা ও পরিচালনা করুন।</p>
          </div>
          <button
            onClick={() => { setEditingItem(null); setFormOpen(true); }}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/20 active:scale-95"
          >
            <Icon name="plus" className="w-4 h-4" /> Add Leave
          </button>
        </div>

        {/* Unified Modern Toolbar */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col xl:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            
            {/* Per Page */}
            <select
              value={perPage}
              onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}
              className="appearance-none bg-none pr-3 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer text-center font-mono"
              style={{ backgroundImage: 'none' }}
            >
              <option value="10">10 / Page</option>
              <option value="20">20 / Page</option>
              <option value="50">50 / Page</option>
              <option value="all">All</option>
            </select>

            <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

            {/* Status Filter */}
            <select 
              value={status} 
              onChange={e => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}
              className="w-full sm:w-40 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search Staff..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Apply Button */}
            <button
              onClick={() => applyFilters()}
              className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              Filter
            </button>
          </div>

          {/* Export Actions */}
          <div className="flex items-center justify-end gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl w-full xl:w-auto shadow-sm shrink-0 ml-auto">
            <button onClick={copyToClipboard} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Copy to Clipboard">
              Copy
            </button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={exportToCSV} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Export CSV">
              CSV
            </button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={() => alert('Backend Excel plugin needed')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-green-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Export Excel">
              Excel
            </button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={() => alert('Backend PDF plugin needed')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Export PDF">
              PDF
            </button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={handlePrint} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-600 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-1.5" title="Print List">
              Print
            </button>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 print-table-wrapper">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Staff Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Leave Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffLeaves.data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      কোনো ছুটির আবেদন পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  staffLeaves.data.map(leave => {
                    return (
                      <tr key={leave.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 text-xs font-medium text-slate-600">
                          <strong className="text-slate-900 font-bold block">{leave.start_date}</strong>
                          <span className="text-slate-400 font-semibold block mt-0.5">to {leave.end_date}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-900">{leave.staff?.first_name} {leave.staff?.last_name || ''}</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                          {leave.leave_type?.name}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {getStatusBadge(leave.status)}
                        </td>
                        <td className="px-6 py-4 text-right no-print">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* View Button */}
                            <button 
                              onClick={() => setViewingItem(leave)} 
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
                              title="View Details"
                            >
                              <Icon name="eye" className="w-4 h-4" />
                            </button>

                            {/* Approve Quick Button */}
                            <button
                              disabled={loadingId === leave.id}
                              onClick={() => handleQuickStatus(leave, 'approved')}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Approve Leave"
                            >
                              <Icon name="check" className="w-4 h-4" />
                            </button>

                            {/* Reject Quick Button */}
                            <button
                              disabled={loadingId === leave.id}
                              onClick={() => handleQuickStatus(leave, 'rejected')}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Reject Leave"
                            >
                              <Icon name="close" className="w-4 h-4" />
                            </button>

                            {/* Edit Button */}
                            <button 
                              onClick={() => { setEditingItem(leave); setFormOpen(true); }} 
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" 
                              title="Edit Leave"
                            >
                              <Icon name="edit" className="w-4 h-4" />
                            </button>

                            {/* Delete Button */}
                            <button 
                              onClick={() => setDeletingItem(leave)} 
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                              title="Delete Leave"
                            >
                              <Icon name="trash" className="w-4 h-4" />
                            </button>

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
            <Pagination meta={staffLeaves} />
          </div>
        </div>
      </div>

      {/* Modals */}
      {viewingItem && <ViewLeaveModal item={viewingItem} onClose={() => setViewingItem(null)} />}
      {formOpen && <LeaveFormModal item={editingItem} staffs={staffs} leaveTypes={leaveTypes} isSuperAdmin={isSuperAdmin} onClose={() => setFormOpen(false)} />}
      
      {deletingItem && (
        <ConfirmDeleteModal 
          item={deletingItem} 
          message="Are you sure you want to delete this leave application?"
          onCancel={() => setDeletingItem(null)} 
          onConfirm={() => { router.delete(route('admin.staff-leaves.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) }); }} 
        />
      )}
    </AuthenticatedLayout>
  );
}