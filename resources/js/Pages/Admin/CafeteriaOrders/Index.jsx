import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import OrderFormModal from './Partials/OrderFormModal';
import OrderShowModal from './Partials/OrderShowModal';
import Swal from 'sweetalert2';

export default function Index({ orders, outlets, users, foods, campuses, activeCampusId, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [status, setStatus] = useState(filters.status ?? '');
  const [paymentStatus, setPaymentStatus] = useState(filters.payment_status ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [viewingItem, setViewingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    }
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.cafeteria.orders.index'), {
      search, status, payment_status: paymentStatus, per_page: perPage, ...overrides
    }, { preserveState: true, replace: true });
  }

  const handleStatusUpdate = (order, field, value) => {
    router.put(route('admin.cafeteria.orders.update', order.id), {
      status: field === 'status' ? value : order.status,
      payment_status: field === 'payment_status' ? value : order.payment_status,
    }, {
      preserveScroll: true, preserveState: true,
      onSuccess: () => Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Order status updated!', showConfirmButton: false, timer: 2000 })
    });
  };

  const getOrderStatusBadge = (st) => {
    if (st === 'Completed' || st === 'Served') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (st === 'Cancelled' || st === 'Voided') return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const getPaymentStatusBadge = (st) => (st === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200');

  return (
    <AuthenticatedLayout>
      <Head title="Cafeteria Orders" />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
            <p className="text-sm text-slate-500">Manage cafeteria food orders and payments.</p>
          </div>
          <button onClick={() => setIsFormOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md">
            <Icon name="plus" className="w-4 h-4" /> New Order
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-3">
          <select value={perPage} onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }} className="bg-slate-50 border border-slate-200 rounded-xl text-sm">
            <option value="10">10 / Page</option>
            <option value="25">25 / Page</option>
            <option value="50">50 / Page</option>
          </select>
          
          <select value={status} onChange={e => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }} className="bg-slate-50 border border-slate-200 rounded-xl text-sm">
            <option value="">All Order Status</option>
            <option value="Pending">Pending</option>
            <option value="Preparing">Preparing</option>
            <option value="Ready">Ready</option>
            <option value="Served">Served / Completed</option>
            <option value="Voided">Voided / Cancelled</option>
          </select>

          <select value={paymentStatus} onChange={e => { setPaymentStatus(e.target.value); applyFilters({ payment_status: e.target.value }); }} className="bg-slate-50 border border-slate-200 rounded-xl text-sm">
            <option value="">All Payments</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Refunded">Refunded</option>
          </select>

          <div className="relative flex-1 min-w-[200px]">
            <Icon name="search" className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input type="text" placeholder="Search Order No..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} className="w-full pl-9 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
          </div>
          <button onClick={() => applyFilters()} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl">Search</button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Order No</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Customer & Outlet</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-center">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-center">Payment</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.data.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-slate-400">No orders found.</td></tr> : orders.data.map(order => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold text-slate-900 font-mono">{order.order_number}</td>
                  <td className="px-6 py-4">
                    <span className="block font-semibold text-slate-800">{order.customer?.name}</span>
                    <span className="text-xs text-slate-500">{order.outlet?.name}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-emerald-700 font-mono">৳ {Number(order.total_amount).toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <select value={order.status} onChange={(e) => handleStatusUpdate(order, 'status', e.target.value)} className={`px-2 py-1 rounded text-xs font-bold uppercase border cursor-pointer ${getOrderStatusBadge(order.status)}`}>
                      <option value="Pending">Pending</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Ready">Ready</option>
                      <option value="Served">Served</option>
                      <option value="Voided">Voided</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <select value={order.payment_status} onChange={(e) => handleStatusUpdate(order, 'payment_status', e.target.value)} className={`px-2 py-1 rounded text-xs font-bold uppercase border cursor-pointer ${getPaymentStatusBadge(order.payment_status)}`}>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Paid">Paid</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setViewingItem(order)} className="p-2 text-slate-400 hover:text-indigo-600"><Icon name="eye" className="w-4 h-4" /></button>
                    <button onClick={() => setDeletingItem(order)} className="p-2 text-slate-400 hover:text-rose-600"><Icon name="trash" className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-white border-t border-slate-100"><Pagination meta={orders} /></div>
        </div>
      </div>

      {isFormOpen && <OrderFormModal outlets={outlets} users={users} foods={foods} campuses={campuses} activeCampusId={activeCampusId} onClose={() => setIsFormOpen(false)} />}
      {viewingItem && <OrderShowModal item={viewingItem} onClose={() => setViewingItem(null)} />}
      {deletingItem && <ConfirmDeleteModal item={{ name: deletingItem.order_number }} onCancel={() => setDeletingItem(null)} onConfirm={() => router.delete(route('admin.cafeteria.orders.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) })} />}
    </AuthenticatedLayout>
  );
}