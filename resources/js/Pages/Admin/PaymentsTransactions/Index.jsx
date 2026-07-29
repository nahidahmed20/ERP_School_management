import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import FormModal from './Partials/FormModal';
import ShowModal from './Partials/ShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ transactions, gateways, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [statusFilter, setStatusFilter] = useState(filters.status ?? '');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showItem, setShowItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
      setFormOpen(false);
    }
  }, [flash]);

  const applyFilters = () => {
    router.get(route('admin.payments.transactions.index'), { search, status: statusFilter }, { preserveState: true });
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      router.delete(route('admin.payments.transactions.destroy', deleteId), {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const handleStatusChange = (id, newStatus) => {
    router.patch(route('admin.payments.transactions.update-status', id), {
      status: newStatus
    }, { preserveScroll: true });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Completed': return { bg: '#dcfce7', text: '#15803d' };
      case 'Failed': return { bg: '#fee2e2', text: '#b91c1c' };
      case 'Refunded': return { bg: '#e0e7ff', text: '#4338ca' };
      default: return { bg: '#fef3c7', text: '#d97706' }; // Pending
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Finance & Payments</span>
            <h1>Transactions</h1>
            <p className="desc">সব ধরনের পেমেন্ট লেনদেন এবং তাদের স্ট্যাটাস ট্র্যাক করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Add Manual Txn
            </button>
          </div>
        </div>
      }
    >
      <Head title="Transactions" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search">
            <Icon name="search" />
            <input placeholder="TrxID or Ref No..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>

          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); applyFilters(); }}>
            <option value="">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>

          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Gateway / Method</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.data.length === 0 && (
                <tr><td colSpan={6} className="mm-empty">কোনো ট্রানজেকশন পাওয়া যায়নি।</td></tr>
              )}
              {transactions.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{item.transaction_id}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Ref: {item.reference_no || 'N/A'}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '500' }}>{item.gateway?.name || 'Manual'}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{item.payment_method || '-'}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 'bold', color: '#16a34a' }}>
                      {item.amount} {item.currency}
                    </span>
                  </td>
                  <td>{item.transaction_date}</td>
                  <td>
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      style={{ 
                        backgroundColor: getStatusBadge(item.status).bg, 
                        color: getStatusBadge(item.status).text, 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: 'bold',
                        border: '1px solid transparent',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Failed">Failed</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" title="View Details" onClick={() => setShowItem(item)}><Icon name="eye" /></button>
                      <button className="icon-btn" title="Edit" onClick={() => { setEditingItem(item); setFormOpen(true); }}><Icon name="edit" /></button>
                      <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => setDeleteId(item.id)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={transactions} />
      </div>

      {formOpen && <FormModal item={editingItem} gateways={gateways} onClose={() => setFormOpen(false)} />}
      {showItem && <ShowModal item={showItem} onClose={() => setShowItem(null)} />}

      {deleteId && (
        <ConfirmDeleteModal
          show={Boolean(deleteId)}
          onClose={() => setDeleteId(null)}
          onCancel={() => setDeleteId(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Transaction"
          message="আপনি কি নিশ্চিত যে এই ট্রানজেকশন রেকর্ডটি মুছে ফেলতে চান? এটি হিসাব-নিকাশে প্রভাব ফেলতে পারে।"
        />
      )}
      
    </AuthenticatedLayout>
  );
}