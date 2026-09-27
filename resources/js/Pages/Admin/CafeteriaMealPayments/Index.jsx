import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import PaymentFormModal from './Partials/PaymentFormModal';
import PaymentShowModal from './Partials/PaymentShowModal';
import Swal from 'sweetalert2';

export default function Index({ payments, users, campuses, summary, activeCampusId, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    }
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.cafeteria.meal-payments.index'), {
      search, per_page: perPage, ...overrides
    }, { preserveState: true, replace: true });
  }

  return (
    <AuthenticatedLayout>
      <Head title="Wallet Top-ups & Payments" />

      {/* 🟢 Print CSS to hide everything except the receipt */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          nav, aside, header, .no-print, button, a, select, input { display: none !important; }
          body, html { background: #fff !important; }
        }
      `}} />

      <div className="max-w-7xl mx-auto p-6 space-y-6 no-print">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Wallet Management</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Top-ups & Payments</h1>
            <p className="text-sm text-slate-500 mt-1">Manage student and staff wallet balances and view transaction history.</p>
          </div>
          <button
            onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95"
          >
            <Icon name="plus" className="w-4 h-4" /> Add Top-up
          </button>
        </div>

        {/* 🟢 PRO Summary Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center"><Icon name="credit-card" className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Today's Transactions</p>
              <h3 className="text-2xl font-black text-slate-900 font-mono">{summary.today_count}</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center"><Icon name="dollar-sign" className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Today's Collection</p>
              <h3 className="text-2xl font-black text-slate-900 font-mono">৳ {Number(summary.today_amount).toLocaleString()}</h3>
            </div>
          </div>
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-4 text-white">
            <div className="w-12 h-12 bg-white/10 text-amber-400 rounded-full flex items-center justify-center"><Icon name="database" className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-semibold text-slate-300">Total All-Time Collection</p>
              <h3 className="text-2xl font-black text-white font-mono">৳ {Number(summary.total_amount).toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-3">
            <select value={perPage} onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }} className="bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500">
              <option value="10">10 / Page</option>
              <option value="25">25 / Page</option>
              <option value="50">50 / Page</option>
            </select>
            <div className="relative w-64">
              <Icon name="search" className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input type="text" placeholder="Search Txn ID or Name..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} className="w-full pl-9 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
            <button onClick={() => applyFilters()} className="px-6 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold rounded-xl transition-colors">Search</button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date & Txn ID</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Student / Staff Name</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.data.length === 0 ? <tr><td colSpan={5} className="p-12 text-center text-slate-400">No transactions found.</td></tr> : payments.data.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <strong className="block text-sm font-mono text-slate-700">{new Date(payment.created_at).toLocaleDateString()}</strong>
                      <span className="text-[11px] font-mono text-slate-400">{payment.reference_no || `TRX-${payment.id}`}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{payment.wallet?.user?.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-[11px] font-bold uppercase">{payment.payment_method}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-base font-black text-emerald-600 font-mono">৳ {Number(payment.amount).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setViewingItem(payment)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Print Receipt"><Icon name="printer" className="w-4 h-4" /></button>
                        <button onClick={() => { setEditingItem(payment); setIsFormOpen(true); }} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><Icon name="edit" className="w-4 h-4" /></button>
                        <button onClick={() => setDeletingItem(payment)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Icon name="trash" className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-white border-t border-slate-100"><Pagination meta={payments} /></div>
        </div>
      </div>

      {isFormOpen && <PaymentFormModal item={editingItem} users={users} campuses={campuses} activeCampusId={activeCampusId} onClose={() => setIsFormOpen(false)} />}
      {viewingItem && <PaymentShowModal item={viewingItem} onClose={() => setViewingItem(null)} />}
      {deletingItem && <ConfirmDeleteModal item={{ name: `Top-up of ৳${deletingItem.amount}` }} onCancel={() => setDeletingItem(null)} onConfirm={() => router.delete(route('admin.cafeteria.meal-payments.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) })} />}
    </AuthenticatedLayout>
  );
}