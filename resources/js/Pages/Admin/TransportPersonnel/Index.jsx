import { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ personnel, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
    }
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.transport-personnel.index'), {
      search, per_page: perPage, ...overrides
    }, { preserveState: true, replace: true });
  }

  // --- Form Modal Component ---
  const PersonnelFormModal = ({ item, onClose }) => {
    const isEdit = !!item;
    const { data, setData, post, put, processing, errors, reset } = useForm({
      type: item?.type ?? 'driver',
      name: item?.name ?? '',
      phone: item?.phone ?? '',
      license_no: item?.license_no ?? '',
      license_expires_at: item?.license_expires_at ? item.license_expires_at.split('T')[0] : '',
      national_id: item?.national_id ?? '',
      is_active: item?.is_active ?? true,
    });

    const submit = (e) => {
      e.preventDefault();
      const options = { onSuccess: () => { reset(); onClose(); } };
      if (isEdit) put(route('admin.transport-personnel.update', item.id), options);
      else post(route('admin.transport-personnel.store'), options);
    };

    const inputClass = "block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none";

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="px-6 py-5 border-b flex justify-between items-center bg-slate-50 rounded-t-2xl">
            <h3 className="text-xl font-bold">{isEdit ? 'Edit Personnel' : 'Add Personnel'}</h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-200"><Icon name="close" className="w-4 h-4" /></button>
          </div>
          <form onSubmit={submit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-sm font-semibold mb-1 block">Role Type</label>
                <select value={data.type} onChange={e => setData('type', e.target.value)} className={inputClass}>
                  <option value="driver">Driver</option>
                  <option value="helper">Helper</option>
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-sm font-semibold mb-1 block">Full Name *</label>
                <input value={data.name} onChange={e => setData('name', e.target.value)} required className={inputClass} />
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-sm font-semibold mb-1 block">Phone Number *</label>
                <input value={data.phone} onChange={e => setData('phone', e.target.value)} required className={inputClass} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-sm font-semibold mb-1 block">National ID (NID)</label>
                <input value={data.national_id} onChange={e => setData('national_id', e.target.value)} className={inputClass} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-sm font-semibold mb-1 block">License Number</label>
                <input value={data.license_no} onChange={e => setData('license_no', e.target.value)} className={inputClass} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-sm font-semibold mb-1 block">License Expiry</label>
                <input type="date" value={data.license_expires_at} onChange={e => setData('license_expires_at', e.target.value)} className={inputClass} />
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="w-5 h-5 rounded border-slate-300" />
                <span className="font-semibold text-slate-700">Currently Active</span>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border font-semibold">Cancel</button>
              <button type="submit" disabled={processing} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold flex items-center gap-2">
                <Icon name="save" className="w-4 h-4" /> Save
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <AuthenticatedLayout>
      <Head title="Transport Personnel" />
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Transport Personnel</h1>
            <p className="text-sm text-slate-500">Manage drivers and helpers.</p>
          </div>
          <button onClick={() => { setEditingItem(null); setIsFormOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md">
            <Icon name="plus" className="w-4 h-4" /> Add Personnel
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
          <div className="flex gap-4">
            <select value={perPage} onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }} className="rounded-xl border-slate-200 text-sm">
              <option value="10">10 / Page</option><option value="25">25 / Page</option><option value="All">All</option>
            </select>
            <input type="text" placeholder="Search name or phone..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyFilters()} className="rounded-xl border-slate-200 text-sm w-64" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Personnel Info</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">License & Expiry</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {personnel.data.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <b className="block text-slate-900">{item.name}</b>
                    <span className="text-sm text-slate-500">Phone: {item.phone}</span>
                  </td>
                  <td className="px-6 py-4"><span className="uppercase text-xs font-bold bg-slate-100 px-2 py-1 rounded">{item.type}</span></td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-600">
                    {item.license_no || 'N/A'}<br/>
                    {item.license_expires_at && <span className="text-xs text-rose-500 font-sans">Exp: {new Date(item.license_expires_at).toLocaleDateString()}</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => { setEditingItem(item); setIsFormOpen(true); }} className="p-2 text-slate-400 hover:text-amber-600"><Icon name="edit" className="w-4 h-4" /></button>
                    <button onClick={() => setDeletingItem(item)} className="p-2 text-slate-400 hover:text-rose-600"><Icon name="trash" className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-white border-t border-slate-100"><Pagination meta={personnel} /></div>
        </div>
      </div>

      {isFormOpen && <PersonnelFormModal item={editingItem} onClose={() => setIsFormOpen(false)} />}
      {deletingItem && (
        <ConfirmDeleteModal
          item={{ name: deletingItem.name }}
          onCancel={() => setDeletingItem(null)}
          onConfirm={() => router.delete(route('admin.transport-personnel.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) })}
        />
      )}
    </AuthenticatedLayout>
  );
}
