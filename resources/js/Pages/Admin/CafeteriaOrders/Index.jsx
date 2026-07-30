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
  const [viewingItem, setViewingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
    }
  }, [flash]);

  function applyFilters() {
    router.get(route('admin.cafeteria.orders.index'), { search }, { preserveState: true, replace: true });
  }

  const handleStatusUpdate = (order, field, value) => {
    router.put(route('admin.cafeteria.orders.update', order.id), {
      status: field === 'status' ? value : order.status,
      payment_status: field === 'payment_status' ? value : order.payment_status,
    }, { preserveScroll: true, preserveState: true });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">Cafeteria</span><h1>Orders</h1></div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => setIsFormOpen(true)}><Icon name="plus" /> New Order</button>
          </div>
        </div>
      }
    >
      <Head title="Cafeteria Orders" />
      <div className="card mm-card">
        <div className="mm-filters">
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search Order No..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>
          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Order No</th>
                <th>Customer</th>
                <th>Outlet</th>
                <th>Amount</th>
                <th>Order Status</th>
                <th>Payment Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.data.length === 0 && <tr><td colSpan={7} className="mm-empty">No orders found.</td></tr>}
              {orders.data.map(order => (
                <tr key={order.id}>
                  <td><strong>{order.order_number}</strong></td>
                  <td>{order.customer?.name}</td>
                  <td>{order.outlet?.name}</td>
                  <td><strong>৳ {Number(order.total_amount).toFixed(2)}</strong></td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order, 'status', e.target.value)}
                      style={{
                        padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold',
                        background: order.status === 'Completed' ? '#dcfce7' : (order.status === 'Cancelled' ? '#fee2e2' : '#fef3c7'),
                        color: order.status === 'Completed' ? '#166534' : (order.status === 'Cancelled' ? '#991b1b' : '#92400e')
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={order.payment_status}
                      onChange={(e) => handleStatusUpdate(order, 'payment_status', e.target.value)}
                      style={{
                        padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold',
                        background: order.payment_status === 'Paid' ? '#dcfce7' : '#fee2e2',
                        color: order.payment_status === 'Paid' ? '#166534' : '#991b1b'
                      }}
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" onClick={() => setViewingItem(order)}><Icon name="eye" /></button>
                      <button className="icon-btn icon-btn-danger" onClick={() => setDeletingItem(order)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={orders} />
      </div>

      {isFormOpen && <OrderFormModal outlets={outlets} users={users} foods={foods} campuses={campuses} activeCampusId={activeCampusId} onClose={() => setIsFormOpen(false)} />}
      {viewingItem && <OrderShowModal item={viewingItem} onClose={() => setViewingItem(null)} />}
      {deletingItem && (
        <ConfirmDeleteModal item={{ name: deletingItem.order_number }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.cafeteria.orders.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}