import { useState, useEffect } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import OrderShowModal from './Partials/OrderShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ orders, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [status, setStatus] = useState(filters.status ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [deletingItem, setDeletingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
    }
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.purchase.orders.index'), { search, status, per_page: perPage, ...overrides }, { preserveState: true, replace: true });
  }

  const handleStatusChange = (id, newStatus) => {
    router.patch(route('admin.purchase.orders.update-status', id), { status: newStatus }, { preserveScroll: true });
  };

  const getStatusColor = (status) => {
    switch(status) {
        case 'Pending': return { bg: '#fef3c7', text: '#d97706' };
        case 'Ordered': return { bg: '#e0f2fe', text: '#0369a1' };
        case 'Received': return { bg: '#dcfce7', text: '#15803d' };
        case 'Cancelled': return { bg: '#fee2e2', text: '#b91c1c' };
        default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Purchase & Assets</span>
            <h1>Purchase Orders (PO)</h1>
          </div>
          <div className="mm-head-actions">
            <Link href={route('admin.purchase.orders.create')} className="btn">
              <Icon name="plus" /> Create PO
            </Link>
          </div>
        </div>
      }
    >
      <Head title="Purchase Orders" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select value={perPage} onChange={(e) => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}>
            <option value="10">10 / page</option>
            <option value="all">Show All</option>
          </select>

          <div className="search">
            <Icon name="search" />
            <input placeholder="Search PO number or vendor..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>

          <select value={status} onChange={(e) => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Ordered">Ordered</option>
            <option value="Received">Received</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button className="btn btn-outline" onClick={() => applyFilters()}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Vendor</th>
                <th>Dates</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.data.length === 0 && (
                <tr><td colSpan={6} className="mm-empty">কোনো Purchase Order পাওয়া যায়নি।</td></tr>
              )}
              {orders.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="mm-label-cell">
                      <Icon name="file" className="mm-row-icon" />
                      <strong style={{ color: '#111827' }}>{item.order_number}</strong>
                    </div>
                  </td>
                  <td><div style={{ fontWeight: 500 }}>{item.vendor?.name}</div></td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>Order: {item.order_date}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>Del: {item.delivery_date || 'N/A'}</div>
                  </td>
                  <td><strong style={{ color: '#047857' }}>৳ {item.total_amount}</strong></td>
                  <td>
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      style={{
                        backgroundColor: getStatusColor(item.status).bg,
                        color: getStatusColor(item.status).text,
                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', border: 'none', outline: 'none', cursor: 'pointer'
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Ordered">Ordered</option>
                      <option value="Received">Received</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" title="View" onClick={() => setViewingItem(item)}><Icon name="eye" /></button>

                      <Link href={route('admin.purchase.orders.edit', item.id)} className="icon-btn" title="Edit">
                        <Icon name="edit" />
                      </Link>

                      <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => setDeletingItem(item)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={orders} />
      </div>

      {viewingItem && <OrderShowModal item={viewingItem} onClose={() => setViewingItem(null)} />}

      {deletingItem && (
        <ConfirmDeleteModal item={{ name: `Order ${deletingItem.order_number}` }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.orders.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}
