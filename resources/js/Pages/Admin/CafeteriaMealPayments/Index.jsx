import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import PaymentFormModal from './Partials/PaymentFormModal';
import PaymentShowModal from './Partials/PaymentShowModal';
import Swal from 'sweetalert2';

export default function Index({ payments, users, campuses, activeCampusId, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
    }
  }, [flash]);

  function applyFilters() {
    router.get(route('admin.cafeteria.meal-payments.index'), { search }, { preserveState: true, replace: true });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">Cafeteria</span><h1>Meal Payments</h1></div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setIsFormOpen(true); }}><Icon name="plus" /> Add Payment</button>
          </div>
        </div>
      }
    >
      <Head title="Meal Payments" />
      <div className="card mm-card">
        <div className="mm-filters">
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search Txn ID or Name..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>
          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>SL</th>
                <th>Date</th>
                <th>Student / Staff</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Txn ID</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.data.length === 0 && <tr><td colSpan={7} className="mm-empty">No payments found.</td></tr>}
              {payments.data.map((payment, index) => (
                <tr key={payment.id}>
                  <td>{(payments.from ?? 1) + index}</td>
                  <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                  <td><strong>{payment.user?.name}</strong></td>
                  <td><strong style={{ color: '#16a34a' }}>৳ {Number(payment.amount).toFixed(2)}</strong></td>
                  <td><span className="badge-outline">{payment.payment_method}</span></td>
                  <td>{payment.transaction_id || '-'}</td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" onClick={() => setViewingItem(payment)}><Icon name="eye" /></button>
                      <button className="icon-btn" onClick={() => { setEditingItem(payment); setIsFormOpen(true); }}><Icon name="edit" /></button>
                      <button className="icon-btn icon-btn-danger" onClick={() => setDeletingItem(payment)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={payments} />
      </div>

      {isFormOpen && <PaymentFormModal item={editingItem} users={users} campuses={campuses} activeCampusId={activeCampusId} onClose={() => setIsFormOpen(false)} />}
      {viewingItem && <PaymentShowModal item={viewingItem} onClose={() => setViewingItem(null)} />}
      {deletingItem && (
        <ConfirmDeleteModal item={{ name: `Payment of ৳${deletingItem.amount}` }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.cafeteria.meal-payments.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}