import { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

// --- Safe Inline SVG Icons for Stats ---
const StatIcon = {
  Megaphone: () => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
    </svg>
  ),
  Calendar: () => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  Paperclip: () => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
    </svg>
  )
};

export default function Notices({ notices, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters?.search || '');
  const [perPage, setPerPage] = useState(filters?.per_page || '10');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    }
    if (flash?.error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
    }
  }, [flash]);

  const applyFilters = (overrides = {}) => {
    router.get(route('admin.frontoffice.notices.index'), {
      search, per_page: perPage, ...overrides
    }, { preserveState: true, replace: true });
  };

  const withAttachmentCount = notices.data.filter(n => n.attachment).length;
  const thisMonthCount = notices.data.filter(n => {
    const d = new Date(n.notice_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const getTypeBadge = (type) => {
    switch (type) {
      case 'Exam': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Holiday': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Event': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  // --- Export Functions ---
  const handlePrint = () => window.print();

  const exportToCSV = () => {
    if (!notices.data.length) return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    const headers = ['Date', 'Type', 'Title', 'Description', 'Has Attachment'];
    const rows = notices.data.map(item => [
      item.notice_date || 'N/A', 
      item.type || 'N/A', 
      item.title || 'N/A', 
      item.description || 'N/A', 
      item.attachment ? 'Yes' : 'No'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Notice_Board_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!notices.data.length) return;
    let text = "Date\tType\tTitle\tAttachment\n";
    notices.data.forEach(item => {
      text += `${item.notice_date}\t${item.type}\t${item.title}\t${item.attachment ? 'Yes' : 'No'}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Notice Board" />

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

      <div className="print-title">Notice Board - {new Date().toLocaleDateString('en-GB')}</div>

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8 no-print">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Front Office</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Notice Board</h1>
            <p className="text-sm text-slate-500 mt-1">ক্যাম্পাসের সকল গুরুত্বপূর্ণ নোটিশ, ইভেন্ট এবং ঘোষণা পরিচালনা করুন।</p>
          </div>
          <button
            onClick={() => { setEditingItem(null); setFormOpen(true); }}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/20 active:scale-95"
          >
            <Icon name="plus" className="w-4 h-4" /> Add Notice
          </button>
        </div>

        {/* Stat Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <StatIcon.Megaphone />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-slate-900">{notices.total ?? notices.data.length}</h4>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Total Notices</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <StatIcon.Calendar />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-slate-900">{thisMonthCount}</h4>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Posted This Month</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <StatIcon.Paperclip />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-slate-900">{withAttachmentCount}</h4>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">With Attachment</p>
            </div>
          </div>
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

            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search notices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Apply Button */}
            <button
              onClick={() => applyFilters()}
              className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              Search
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
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-40">Date &amp; Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Notice Details</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Attachment</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notices.data.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-100">
                        <StatIcon.Megaphone className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">No notices found</p>
                      <p className="text-xs text-slate-400 mt-1">Try a different search, or post a new notice</p>
                    </td>
                  </tr>
                ) : (
                  notices.data.map((notice) => (
                    <tr key={notice.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                          <Icon name="calendar" className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {notice.notice_date}
                        </div>
                        <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getTypeBadge(notice.type)}`}>
                          {notice.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900">{notice.title}</div>
                        {notice.description && (
                          <div className="text-xs text-slate-500 mt-1 line-clamp-2 max-w-lg leading-relaxed">{notice.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {notice.attachment ? (
                          <a
                            href={`/storage/${notice.attachment}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-200 shadow-sm"
                          >
                            <Icon name="paperclip" className="w-3.5 h-3.5" /> View File
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No Attachment</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right no-print">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => { setEditingItem(notice); setFormOpen(true); }} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit Notice">
                            <Icon name="edit" className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeletingItem(notice)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Notice">
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
            {Array.isArray(notices.links) ? (
              <Pagination meta={notices} />
            ) : null}
          </div>
        </div>
      </div>

      {formOpen && <NoticeFormModal item={editingItem} onClose={() => setFormOpen(false)} />}
      
      {deletingItem && (
        <ConfirmDeleteModal 
          item={{ name: deletingItem.title }} 
          message="Are you sure you want to delete this notice?"
          onCancel={() => setDeletingItem(null)} 
          onConfirm={() => {
            router.delete(route('admin.frontoffice.notices.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
          }} 
        />
      )}
    </AuthenticatedLayout>
  );
}

// --- Notice Form Modal Component ---
function NoticeFormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, processing, reset, errors } = useForm({
    title: item?.title ?? '',
    type: item?.type ?? 'General',
    notice_date: item?.notice_date ?? new Date().toISOString().split('T')[0],
    description: item?.description ?? '',
    attachment: null,
    _method: isEdit ? 'PUT' : 'POST'
  });

  function submit(e) {
    e.preventDefault();
    const routeName = isEdit ? route('admin.frontoffice.notices.update', item.id) : route('admin.frontoffice.notices.store');
    
    post(routeName, { 
      forceFormData: true,
      onSuccess: () => { reset(); onClose(); } 
    });
  }

  const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] shadow-2xl overflow-hidden transform transition-all flex flex-col ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Notice' : 'Post New Notice'}</h3>
            <p className="text-sm text-slate-500 mt-1">Publish an announcement or circular to the board.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-slate-100">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden" encType="multipart/form-data">
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="sm:col-span-2">
                <label className={labelClass}>Notice Title <span className="text-rose-500">*</span></label>
                <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} required placeholder="e.g. Summer Vacation Start" className={inputClass} autoFocus />
                {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className={labelClass}>Notice Type <span className="text-rose-500">*</span></label>
                <select value={data.type} onChange={e => setData('type', e.target.value)} required className={inputClass}>
                  <option value="General">General</option>
                  <option value="Exam">Exam</option>
                  <option value="Holiday">Holiday</option>
                  <option value="Event">Event</option>
                </select>
                {errors.type && <p className="text-rose-500 text-xs mt-1">{errors.type}</p>}
              </div>

              <div>
                <label className={labelClass}>Date <span className="text-rose-500">*</span></label>
                <input type="date" value={data.notice_date} onChange={e => setData('notice_date', e.target.value)} required className={`${inputClass} font-mono`} />
                {errors.notice_date && <p className="text-rose-500 text-xs mt-1">{errors.notice_date}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Description / Details</label>
                <textarea rows="4" value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Enter notice details..." className={`${inputClass} resize-none`} />
                {errors.description && <p className="text-rose-500 text-xs mt-1">{errors.description}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Attachment <span className="text-slate-400 font-normal">(PDF, Image)</span></label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-indigo-400 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Icon name="upload" className="w-6 h-6 text-slate-400 mb-1" />
                    <p className="text-sm text-slate-500 font-semibold">{data.attachment ? data.attachment.name : 'Click to select or drag and drop'}</p>
                  </div>
                  <input type="file" onChange={e => setData('attachment', e.target.files[0])} className="hidden" />
                </label>
                {isEdit && !data.attachment && (
                  <p className="text-xs text-slate-500 mt-1.5 italic">Leave empty to keep the current attachment.</p>
                )}
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
              <Icon name="save" className="w-4 h-4" />
              {processing ? 'Saving...' : (isEdit ? 'Update Notice' : 'Post Notice')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}