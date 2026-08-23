import { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

// --- Safe Inline SVG Icons for Stats ---
const StatIcon = {
  Users: () => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  LogIn: () => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  ),
  LogOut: () => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  )
};

export default function VisitorBook({ visitors, filters }) {
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
    router.get(route('admin.frontoffice.visitors.index'), {
      search, per_page: perPage, ...overrides
    }, { preserveState: true, replace: true });
  };

  const initials = (name) => (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  const checkedInCount = visitors.data.filter(v => !v.out_time).length;
  const checkedOutCount = visitors.data.length - checkedInCount;

  // --- Export Functions ---
  const handlePrint = () => window.print();

  const exportToCSV = () => {
    if (!visitors.data.length) return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    const headers = ['Visitor Name', 'Phone', 'Purpose', 'Person to Meet', 'Date', 'In Time', 'Out Time'];
    const rows = visitors.data.map(item => [
      item.name || 'N/A', 
      item.phone || 'N/A', 
      item.purpose || 'N/A', 
      item.person_to_meet || 'N/A', 
      item.visit_date || 'N/A', 
      item.in_time || 'N/A', 
      item.out_time || 'N/A'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Visitor_Logs_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!visitors.data.length) return;
    let text = "Visitor Name\tPhone\tPurpose\tDate\tIn\tOut\n";
    visitors.data.forEach(item => {
      text += `${item.name}\t${item.phone}\t${item.purpose}\t${item.visit_date}\t${item.in_time}\t${item.out_time || 'N/A'}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Visitor Book" />

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

      <div className="print-title">Visitor Log Book - {new Date().toLocaleDateString('en-GB')}</div>

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8 no-print">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Front Office</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Visitor Book</h1>
            <p className="text-sm text-slate-500 mt-1">ক্যাম্পাসে আগত ভিজিটরদের তথ্য এবং ইন/আউট টাইম ট্র্যাক করুন।</p>
          </div>
          <button
            onClick={() => { setEditingItem(null); setFormOpen(true); }}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/20 active:scale-95"
          >
            <Icon name="plus" className="w-4 h-4" /> Add Visitor
          </button>
        </div>

        {/* Stat Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <StatIcon.Users />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-slate-900">{visitors.total ?? visitors.data.length}</h4>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Total Visitors</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <StatIcon.LogIn />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-slate-900">{checkedInCount}</h4>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Currently In</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100">
              <StatIcon.LogOut />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-slate-900">{checkedOutCount}</h4>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Checked Out</p>
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
                placeholder="Search by name, phone..."
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
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Visitor</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Purpose &amp; Person</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visitors.data.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-100">
                        <Icon name="users" className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">No visitors found</p>
                      <p className="text-xs text-slate-400 mt-1">Try a different search, or add a new visitor</p>
                    </td>
                  </tr>
                ) : (
                  visitors.data.map((visitor) => (
                    <tr key={visitor.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center border border-indigo-100 shrink-0">
                            {initials(visitor.name)}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-900 block">{visitor.name}</span>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                              <Icon name="phone" className="w-3 h-3" /> {visitor.phone || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-800 block">{visitor.purpose}</span>
                        <span className="text-xs text-indigo-600 font-medium mt-0.5 block">To meet: {visitor.person_to_meet || '--'}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="font-semibold text-slate-700 block">{visitor.visit_date}</span>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200">
                            In {visitor.in_time}
                          </span>
                          {visitor.out_time && (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-rose-50 text-rose-700 border border-rose-200">
                              Out {visitor.out_time}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right no-print">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => { setEditingItem(visitor); setFormOpen(true); }} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit Log">
                            <Icon name="edit" className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeletingItem(visitor)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Log">
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
            <Pagination meta={visitors} />
          </div>
        </div>
      </div>

      {formOpen && <VisitorFormModal item={editingItem} onClose={() => setFormOpen(false)} />}
      
      {deletingItem && (
        <ConfirmDeleteModal 
          item={{ name: deletingItem.name }} 
          message="Are you sure you want to delete this visitor log?"
          onCancel={() => setDeletingItem(null)} 
          onConfirm={() => {
            router.delete(route('admin.frontoffice.visitors.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
          }} 
        />
      )}
    </AuthenticatedLayout>
  );
}

// --- Visitor Form Modal Component ---
function VisitorFormModal({ item, onClose }) {
  const isEdit = !!item;

  const { data, setData, post, put, processing, reset, errors } = useForm({
    name: item?.name ?? '',
    phone: item?.phone ?? '',
    purpose: item?.purpose ?? '',
    person_to_meet: item?.person_to_meet ?? '',
    visit_date: item?.visit_date ?? new Date().toISOString().split('T')[0],
    in_time: item?.in_time ?? '',
    out_time: item?.out_time ?? '',
  });

  function submit(e) {
    e.preventDefault();
    const options = { onSuccess: () => { reset(); onClose(); } };
    if (isEdit) put(route('admin.frontoffice.visitors.update', item.id), options);
    else post(route('admin.frontoffice.visitors.store'), options);
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
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Visitor' : 'Add New Visitor'}</h3>
            <p className="text-sm text-slate-500 mt-1">Log details for the campus visitor.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-slate-100">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div>
                <label className={labelClass}>Visitor Name <span className="text-rose-500">*</span></label>
                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required placeholder="e.g. John Doe" className={inputClass} autoFocus />
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className={labelClass}>Phone</label>
                <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="01XXXXXXXXX" className={`${inputClass} font-mono`} />
                {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className={labelClass}>Purpose <span className="text-rose-500">*</span></label>
                <input type="text" value={data.purpose} onChange={e => setData('purpose', e.target.value)} required placeholder="e.g. Meeting Principal" className={inputClass} />
                {errors.purpose && <p className="text-rose-500 text-xs mt-1">{errors.purpose}</p>}
              </div>

              <div>
                <label className={labelClass}>Person to Meet</label>
                <input type="text" value={data.person_to_meet} onChange={e => setData('person_to_meet', e.target.value)} placeholder="e.g. Mr. Rahim" className={inputClass} />
                {errors.person_to_meet && <p className="text-rose-500 text-xs mt-1">{errors.person_to_meet}</p>}
              </div>

              <div className="sm:col-span-2 bg-slate-50 p-5 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Date <span className="text-rose-500">*</span></label>
                  <input type="date" value={data.visit_date} onChange={e => setData('visit_date', e.target.value)} required className={`${inputClass} font-mono`} />
                </div>
                <div>
                  <label className={labelClass}>In Time <span className="text-rose-500">*</span></label>
                  <input type="time" value={data.in_time} onChange={e => setData('in_time', e.target.value)} required className={`${inputClass} font-mono border-emerald-200`} />
                </div>
                <div>
                  <label className={labelClass}>Out Time</label>
                  <input type="time" value={data.out_time} onChange={e => setData('out_time', e.target.value)} className={`${inputClass} font-mono border-rose-200`} />
                </div>
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
              {processing ? 'Saving...' : 'Save Visitor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}