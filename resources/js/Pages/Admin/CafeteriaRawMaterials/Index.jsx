import { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ materials, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    }
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.cafeteria.raw-materials.index'), {
      search, per_page: perPage, ...overrides
    }, { preserveState: true, replace: true });
  }

  // --- Export & Print Functions ---
  const handlePrint = () => window.print();

  const exportToCSV = () => {
    if (!materials.data.length) return Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
    const headers = ['Material Name', 'Current Stock', 'Alert Level', 'Unit', 'Status'];
    const rows = materials.data.map(item => [
      item.name || 'N/A',
      item.stock_quantity || '0',
      item.reorder_level || '0',
      item.stock_unit || 'pcs',
      item.is_active ? 'Active' : 'Inactive'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Kitchen_Raw_Materials_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!materials.data.length) return;
    let text = "Material Name\tStock\tAlert Level\tUnit\tStatus\n";
    materials.data.forEach(item => {
      text += `${item.name}\t${item.stock_quantity}\t${item.reorder_level}\t${item.stock_unit}\t${item.is_active ? 'Active' : 'Inactive'}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data copied to clipboard!', showConfirmButton: false, timer: 2000 });
  };

  // --- Form Modal Component ---
  const MaterialFormModal = ({ item, onClose }) => {
    const isEdit = !!item;
    const { data, setData, post, put, processing, reset } = useForm({
      name: item?.name ?? '',
      stock_quantity: item?.stock_quantity ?? 0,
      reorder_level: item?.reorder_level ?? 5,
      stock_unit: item?.stock_unit ?? 'kg',
      is_active: item?.is_active ?? true,
    });

    const submit = (e) => {
      e.preventDefault();
      const options = { onSuccess: () => { reset(); onClose(); } };
      if (isEdit) put(route('admin.cafeteria.raw-materials.update', item.id), options);
      else post(route('admin.cafeteria.raw-materials.store'), options);
    };

    const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
    const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";
    
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center rounded-t-2xl">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Raw Material' : 'Add Kitchen Stock'}</h3>
              <p className="text-sm text-slate-500 mt-1">Manage grocery and raw ingredient inventory.</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 bg-white border border-slate-200 shadow-sm"><Icon name="close" className="w-4 h-4" /></button>
          </div>
          <form onSubmit={submit} className="p-6 space-y-4">
            <div>
              <label className={labelClass}>Material Name <span className="text-rose-500">*</span></label>
              <input value={data.name} onChange={e => setData('name', e.target.value)} required placeholder="e.g. Basmati Rice, Chicken" className={inputClass} autoFocus />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Stock Qty</label>
                <input type="number" step="0.01" value={data.stock_quantity} onChange={e => setData('stock_quantity', e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Alert Level</label>
                <input type="number" step="0.01" value={data.reorder_level} onChange={e => setData('reorder_level', e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Unit</label>
                <input value={data.stock_unit} onChange={e => setData('stock_unit', e.target.value)} placeholder="kg, ltr, pcs" required className={inputClass} />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="font-semibold text-slate-700">Currently Active</span>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={processing} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold flex items-center gap-2 hover:bg-indigo-700 shadow-md">
                <Icon name="save" className="w-4 h-4" /> Save Material
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <AuthenticatedLayout>
      <Head title="Kitchen Raw Materials" />

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

      <div className="print-title">Kitchen Raw Materials Directory - {new Date().toLocaleDateString('en-GB')}</div>

      <div className="max-w-7xl mx-auto p-6 space-y-6 no-print">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Cafeteria</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Kitchen Raw Materials</h1>
            <p className="text-sm text-slate-500 mt-1">ক্যাফেটেরিয়ার রান্নার কাঁচামাল ও মুদি সামগ্রীর স্টক ম্যানেজ করুন।</p>
          </div>
          <button onClick={() => { setEditingItem(null); setIsFormOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md shadow-indigo-500/20 active:scale-95">
            <Icon name="plus" className="w-4 h-4" /> Add Material
          </button>
        </div>

        {/* Toolbar & Export Buttons */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col xl:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <select
              value={perPage}
              onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}
              className="appearance-none bg-none pr-3 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer font-mono"
            >
              <option value="10">10 / Page</option>
              <option value="20">20 / Page</option>
              <option value="50">50 / Page</option>
              <option value="all">All Page</option>
            </select>

            <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

            <div className="relative flex-1 min-w-[200px] sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search Material..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <button onClick={() => applyFilters()} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
              Search
            </button>
          </div>

          {/* Export Bar */}
          <div className="flex items-center justify-end gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl w-full xl:w-auto shadow-sm shrink-0 ml-auto">
            <button onClick={copyToClipboard} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Copy">Copy</button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={exportToCSV} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="CSV">CSV</button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={() => alert('Backend Excel plugin needed')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-green-600 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Excel">Excel</button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={() => alert('Backend PDF plugin needed')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="PDF">PDF</button>
            <div className="w-px h-4 bg-slate-200 mx-0.5"></div>
            <button onClick={handlePrint} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-600 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Print">Print</button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print-table-wrapper">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">SL</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Material Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Stock</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials.data.length === 0 ? (
                  <tr><td colSpan={5} className="p-12 text-center text-slate-400">No raw materials found.</td></tr>
                ) : (
                  materials.data.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-500 font-mono">
                        {(materials.from ?? 1) + index}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">{item.name}</td>
                      <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                        {item.stock_quantity} {item.stock_unit}
                        {item.stock_quantity <= item.reorder_level && (
                          <span className="ml-2 text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full animate-pulse">Low Stock</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border ${item.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right no-print">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => { setEditingItem(item); setIsFormOpen(true); }} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><Icon name="edit" className="w-4 h-4" /></button>
                          <button onClick={() => setDeletingItem(item)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Icon name="trash" className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-white border-t border-slate-100 no-print">
            <Pagination meta={materials} />
          </div>
        </div>
      </div>

      {isFormOpen && <MaterialFormModal item={editingItem} onClose={() => setIsFormOpen(false)} />}
      {deletingItem && (
        <ConfirmDeleteModal item={{ name: deletingItem.name }} onCancel={() => setDeletingItem(null)} onConfirm={() => router.delete(route('admin.cafeteria.raw-materials.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) })} />
      )}
    </AuthenticatedLayout>
  );
}