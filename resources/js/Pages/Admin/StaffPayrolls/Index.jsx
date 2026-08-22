import { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

// --- View Modal Component ---
function PayrollViewModal({ item, onClose }) {
  if (!item) return null;

  const formatMonth = (yyyymm) => {
    if (!yyyymm) return '';
    const date = new Date(yyyymm + '-01');
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'paid': return <span className="inline-flex px-3 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">Paid</span>;
      case 'unpaid': return <span className="inline-flex px-3 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-rose-50 text-rose-700 border border-rose-200">Unpaid</span>;
      default: return <span className="inline-flex px-3 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-amber-50 text-amber-700 border border-amber-200">Pending</span>;
    }
  };

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
            <h3 className="text-xl font-bold text-slate-900">Payroll Slip Details</h3>
            <p className="text-sm text-slate-500 mt-0.5">Staff monthly salary summary.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-slate-100">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1">

          {/* Staff Info Header Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
            <div>
              <h4 className="text-base font-bold text-slate-900">{item.staff?.first_name} {item.staff?.last_name || ''}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{item.staff?.designation?.name || 'Staff'} • ID: {item.staff?.staff_id_no}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl">
                {formatMonth(item.salary_month)}
              </span>
            </div>
          </div>

          {/* Breakdown Section */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Salary Breakdown</h5>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Basic Salary</span>
                <strong className="text-slate-900">৳ {item.basic_salary}</strong>
              </div>
              <div className="flex justify-between">
                <span>Allowance</span>
                <strong className="text-emerald-600">+ ৳ {item.allowance}</strong>
              </div>
              <div className="flex justify-between">
                <span>Deduction</span>
                <strong className="text-rose-600">- ৳ {item.deduction}</strong>
              </div>
            </div>
          </div>

          {/* Net Salary Total */}
          <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 flex justify-between items-center">
            <span className="text-sm font-bold text-indigo-900">Net Payable Amount</span>
            <span className="text-2xl font-black text-indigo-600">৳ {item.net_salary}</span>
          </div>

          {/* Payment & Status Section */}
          <div className="border-t border-slate-100 pt-4">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Payment Information</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-xs text-slate-400 mb-1">Status</span>
                {getStatusBadge(item.status)}
              </div>
              <div>
                <span className="block text-xs text-slate-400 mb-1">Method &amp; Date</span>
                <span className="font-semibold text-slate-700 block">
                  {item.payment_method || 'N/A'}
                  {item.payment_date && <span className="font-normal text-slate-500 text-xs block">({item.payment_date})</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {item.note && (
            <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 text-xs space-y-1">
              <span className="font-bold text-amber-800 block">Note / Remarks:</span>
              <p className="text-amber-700 italic">{item.note}</p>
            </div>
          )}

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
function PayrollFormModal({ item, staffs, onClose }) {
  const isEdit = !!item;
  const currentMonth = new Date().toISOString().slice(0, 7);

  const { data, setData, post, put, processing, reset, errors } = useForm({
    staff_id: item?.staff_id ?? '',
    salary_month: item?.salary_month ?? currentMonth,
    basic_salary: item?.basic_salary ?? '',
    allowance: item?.allowance ?? 0,
    deduction: item?.deduction ?? 0,
    payment_method: item?.payment_method ?? 'Cash',
    payment_date: item?.payment_date ?? '',
    status: item?.status ?? 'unpaid',
    note: item?.note ?? '',
  });

  useEffect(() => {
    if (!isEdit && data.staff_id) {
      const selectedStaff = staffs.find(s => s.id == data.staff_id);
      if (selectedStaff) {
        setData('basic_salary', selectedStaff.basic_salary);
      }
    }
  }, [data.staff_id]);

  const netSalary = (parseFloat(data.basic_salary || 0) + parseFloat(data.allowance || 0)) - parseFloat(data.deduction || 0);

  const submit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route('admin.staff-payrolls.update', item.id), { onSuccess: () => { reset(); onClose(); } });
    } else {
      post(route('admin.staff-payrolls.store'), { onSuccess: () => { reset(); onClose(); } });
    }
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
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Payroll Record' : 'Generate New Payroll'}</h3>
            <p className="text-sm text-slate-500 mt-1">Configure staff monthly salary and deductions.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-slate-100">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="sm:col-span-2">
                <label className={labelClass}>Select Staff <span className="text-rose-500">*</span></label>
                <select value={data.staff_id} onChange={e => setData('staff_id', e.target.value)} required disabled={isEdit} className={`${inputClass} disabled:bg-slate-100 disabled:opacity-60`}>
                  <option value="" disabled>-- Choose Staff --</option>
                  {staffs.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name || ''} ({s.staff_id_no})</option>)}
                </select>
                {errors.staff_id && <p className="text-rose-500 text-xs mt-1">{errors.staff_id}</p>}
              </div>

              <div>
                <label className={labelClass}>Salary Month <span className="text-rose-500">*</span></label>
                <input type="month" value={data.salary_month} onChange={e => setData('salary_month', e.target.value)} required disabled={isEdit} className={`${inputClass} font-mono disabled:bg-slate-100 disabled:opacity-60`} />
                {errors.salary_month && <p className="text-rose-500 text-xs mt-1">{errors.salary_month}</p>}
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Basic Salary (৳)</label>
                <input type="number" step="0.01" value={data.basic_salary} onChange={e => setData('basic_salary', e.target.value)} required className={`${inputClass} font-mono`} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-emerald-700 mb-1.5">Allowance (+)</label>
                <input type="number" step="0.01" value={data.allowance} onChange={e => setData('allowance', e.target.value)} className="block w-full px-4 py-2.5 bg-emerald-50/50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-rose-700 mb-1.5">Deduction (-)</label>
                <input type="number" step="0.01" value={data.deduction} onChange={e => setData('deduction', e.target.value)} className="block w-full px-4 py-2.5 bg-rose-50/50 border border-rose-200 text-rose-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-rose-500 outline-none transition-all" />
              </div>
            </div>

            {/* Net Amount Summary Banner */}
            <div className="bg-indigo-50/80 p-4 rounded-xl border border-indigo-100 flex justify-between items-center">
              <span className="text-sm font-bold text-indigo-900">Net Payable Amount:</span>
              <span className="text-2xl font-black text-indigo-600 font-mono">৳ {netSalary.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Status</label>
                <select value={data.status} onChange={e => setData('status', e.target.value)} className={inputClass}>
                  <option value="unpaid">Unpaid</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Payment Method</label>
                <select value={data.payment_method} onChange={e => setData('payment_method', e.target.value)} className={inputClass}>
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="Mobile Banking">Mobile Banking</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Payment Date</label>
                <input type="date" value={data.payment_date} onChange={e => setData('payment_date', e.target.value)} className={`${inputClass} font-mono`} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Note / Remarks</label>
              <input type="text" value={data.note} onChange={e => setData('note', e.target.value)} placeholder="Any special note for allowance/deduction" className={inputClass} />
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} disabled={processing} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70 active:scale-95">
              {processing ? 'Processing...' : 'Save Payroll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Index Component ---
export default function Index({ payrolls = { data: [] }, staffs = [], filters = {} }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [month, setMonth] = useState(filters.month ?? '');
  const [status, setStatus] = useState(filters.status ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [formOpen, setFormOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
  }, [flash]);

  const applyFilters = (overrides = {}) => {
    router.get(route('admin.staff-payrolls.index'), {
      search, month, status, per_page: perPage, ...overrides
    }, { preserveState: true, replace: true });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'paid': return <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">Paid</span>;
      case 'unpaid': return <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-rose-50 text-rose-700 border border-rose-200">Unpaid</span>;
      default: return <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-amber-50 text-amber-700 border border-amber-200">Pending</span>;
    }
  };

  const formatMonth = (yyyymm) => {
    if (!yyyymm) return '';
    const date = new Date(yyyymm + '-01');
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // --- Export Functions ---
  const handlePrint = () => window.print();

  const exportToCSV = () => {
    if (!payrolls?.data?.length) return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    const headers = ['Month', 'Staff Name', 'Basic Salary', 'Net Salary', 'Status'];
    const rows = payrolls.data.map(item => [
      item.salary_month || 'N/A', 
      `${item.staff?.first_name || ''} ${item.staff?.last_name || ''}`, 
      item.basic_salary || '0', 
      item.net_salary || '0', 
      item.status || 'Unpaid'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Staff_Payrolls_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!payrolls?.data?.length) return;
    let text = "Month\tStaff Name\tBasic Salary\tNet Salary\tStatus\n";
    payrolls.data.forEach(item => {
      text += `${item.salary_month}\t${item.staff?.first_name || ''} ${item.staff?.last_name || ''}\t${item.basic_salary}\t${item.net_salary}\t${item.status}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Staff Payrolls" />

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

      <div className="print-title">Staff Payroll Management - {new Date().toLocaleDateString('en-GB')}</div>

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8 no-print">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Accounts & HR</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Staff Payroll Management</h1>
            <p className="text-sm text-slate-500 mt-1">শিক্ষক ও কর্মচারীদের মাসিক বেতনের রেকর্ড তৈরি ও ব্যবস্থাপনা করুন।</p>
          </div>
          <button
            onClick={() => { setEditingItem(null); setFormOpen(true); }}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-500/20 active:scale-95"
          >
            <Icon name="plus" className="w-4 h-4" /> Generate Payroll
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

            {/* Month Filter */}
            <input 
              type="month" 
              value={month} 
              onChange={e => { setMonth(e.target.value); applyFilters({ month: e.target.value }); }} 
              className="w-full sm:w-44 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer font-mono" 
              title="Filter by Month" 
            />

            {/* Status Filter */}
            <select 
              value={status} 
              onChange={e => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}
              className="w-full sm:w-36 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="pending">Pending</option>
            </select>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search Staff Name or ID..."
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
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Month</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Staff Details</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Salary Breakdown</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Payable</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payrolls?.data?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      কোনো বেতনের রেকর্ড পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  payrolls?.data?.map(payroll => (
                    <tr key={payroll.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">
                        {formatMonth(payroll.salary_month)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-900 block">{payroll.staff?.first_name} {payroll.staff?.last_name || ''}</span>
                        <span className="text-xs text-slate-500 font-medium block mt-0.5">{payroll.staff?.designation?.name} • ID: {payroll.staff?.staff_id_no}</span>
                      </td>
                      <td className="px-6 py-4 text-xs space-y-0.5">
                        <div className="text-slate-600">Basic: ৳ {payroll.basic_salary}</div>
                        {payroll.allowance > 0 && <div className="text-emerald-600 font-semibold">+ Allow: ৳ {payroll.allowance}</div>}
                        {payroll.deduction > 0 && <div className="text-rose-600 font-semibold">- Deduct: ৳ {payroll.deduction}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-indigo-600 font-mono block">৳ {payroll.net_salary}</span>
                        {payroll.payment_method && <span className="text-xs text-slate-400 block mt-0.5">Via {payroll.payment_method}</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(payroll.status)}
                        {payroll.status === 'paid' && payroll.payment_date && <span className="text-[10px] text-slate-400 block mt-1">On {payroll.payment_date}</span>}
                      </td>
                      <td className="px-6 py-4 text-right no-print">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => setViewingItem(payroll)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Slip">
                            <Icon name="eye" className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setEditingItem(payroll); setFormOpen(true); }} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit Payroll">
                            <Icon name="edit" className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeletingItem(payroll)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Payroll">
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
            {payrolls?.links && <Pagination meta={payrolls} />}
          </div>
        </div>
      </div>

      {/* Modals */}
      {viewingItem && <PayrollViewModal item={viewingItem} onClose={() => setViewingItem(null)} />}
      {formOpen && <PayrollFormModal item={editingItem} staffs={staffs} onClose={() => setFormOpen(false)} />}
      
      {deletingItem && (
        <ConfirmDeleteModal 
          item={{ name: `Payroll Record for ${deletingItem.staff?.first_name} (${formatMonth(deletingItem.salary_month)})` }} 
          message="Are you sure you want to delete this payroll record?"
          onCancel={() => setDeletingItem(null)} 
          onConfirm={() => { router.delete(route('admin.staff-payrolls.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) }); }} 
        />
      )}
    </AuthenticatedLayout>
  );
}