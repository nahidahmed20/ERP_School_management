import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import IdCardShowModal from './Partials/IdCardShowModal';
import IdCardFormModal from './Partials/IdCardFormModal'; // 🟢 Modal Import
import Swal from 'sweetalert2';

export default function Index({ templates, campuses, activeCampusId, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [viewingItem, setViewingItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null); // 🟢 Edit State
  const [isFormOpen, setIsFormOpen] = useState(false); // 🟢 Form Open State
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.documents.idcards.index'), { search, per_page: perPage, ...overrides }, { preserveState: true, replace: true });
  }

  const handleStatusToggle = (item) => {
    router.put(route('admin.documents.idcards.update', item.id), { ...item, is_active: !item.is_active }, { 
      preserveScroll: true,
      onSuccess: () => Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Status updated!', showConfirmButton: false, timer: 2000 })
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title="ID Card Templates" />

      <div className="w-full space-y-6 sm:px-6 lg:px-8 py-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Documents &amp; Cards</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">ID Card Templates</h1>
            <p className="text-sm text-slate-500 mt-1">শিক্ষার্থী এবং স্টাফদের জন্য ১২টি প্রিমিয়াম ডিজাইনের আইডি কার্ড টেমপ্লেট।</p>
          </div>
          
          {/* 🟢 Create Button triggers Modal */}
          <button
            onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95"
          >
            <Icon name="plus" className="w-4 h-4" /> Create Template
          </button>
        </div>

        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col xl:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <select value={perPage} onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }} className="appearance-none px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="10">10 / Page</option>
              <option value="20">20 / Page</option>
            </select>
            <div className="relative flex-1 min-w-[200px] sm:w-80">
              <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input type="text" placeholder="Search title..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
            <button onClick={() => applyFilters()} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">Search</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">SL</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Title & Audience</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Design Theme</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Color</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {templates.data.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No ID Card templates found</td></tr>
                ) : (
                  templates.data.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-500 font-mono">{(templates.from ?? 1) + index}</td>
                      <td className="px-6 py-4">
                        <strong className="text-sm font-bold text-slate-900 block">{item.title}</strong>
                        <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">{item.audience}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-sky-50 text-sky-700 border border-sky-200">
                          {item.design_template.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full shadow-sm border border-slate-200" style={{ background: item.theme_color }}></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleStatusToggle(item)} className={`inline-flex px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide uppercase transition-all shadow-sm border ${item.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => setViewingItem(item)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Live Preview"><Icon name="eye" className="w-4 h-4" /></button>
                          
                          {/* 🟢 Edit Button triggers Modal */}
                          <button onClick={() => { setEditingItem(item); setIsFormOpen(true); }} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg" title="Edit Template">
                            <Icon name="edit" className="w-4 h-4" />
                          </button>
                          
                          <button onClick={() => setDeletingItem(item)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" title="Delete Template"><Icon name="trash" className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 bg-white px-6 py-4 rounded-b-2xl"><Pagination meta={templates} /></div>
        </div>
      </div>

      {/* 🟢 Modals */}
      {isFormOpen && <IdCardFormModal item={editingItem} campuses={campuses} activeCampusId={activeCampusId} onClose={() => setIsFormOpen(false)} />}
      {viewingItem && <IdCardShowModal item={viewingItem} onClose={() => setViewingItem(null)} />}
      
      {deletingItem && (
        <ConfirmDeleteModal 
          item={{ name: deletingItem.title }} 
          onCancel={() => setDeletingItem(null)} 
          onConfirm={() => { router.delete(route('admin.documents.idcards.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) }); }} 
        />
      )}
    </AuthenticatedLayout>
  );
}