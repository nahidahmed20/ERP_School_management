import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import VoucherFormModal from './Partials/VoucherFormModal';
import Swal from 'sweetalert2';

export default function Index({ vouchers, accounts, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [typeFilter, setTypeFilter] = useState(filters.type ?? '');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
  }, [flash]);

  function applyFilters() {
    router.get(route('admin.accounting.vouchers.index'), { search, type: typeFilter }, { preserveState: true, replace: true });
  }

  useEffect(() => {
    if (typeFilter !== (filters.type ?? '')) applyFilters();
  }, [typeFilter]);

  const getTypeStyle = (type) => {
    if (type === 'Receipt') return 'border-green-600 text-green-700 bg-green-50';
    if (type === 'Payment') return 'border-red-600 text-red-700 bg-red-50';
    if (type === 'Contra') return 'border-blue-600 text-blue-700 bg-blue-50';
    return 'border-gray-600 text-gray-700'; // Journal
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">Finance & Accounts</span><h1>Accounting Vouchers</h1></div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => setIsFormOpen(true)}>
              <Icon name="plus" /> Create Voucher
            </button>
          </div>
        </div>
      }
    >
      <Head title="Accounting Vouchers" />
      <div className="card mm-card">
        
        <div className="mm-filters" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <option value="">All Voucher Types</option>
              <option value="Receipt">Receipts (Money In)</option>
              <option value="Payment">Payments (Money Out)</option>
              <option value="Contra">Contra (Bank-Cash)</option>
              <option value="Journal">Journal (Adjustments)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="search">
              <Icon name="search" />
              <input placeholder="Search Voucher No..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
            </div>
            <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
          </div>
        </div>

        <div className="mm-table-wrap mt-3">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Date & Voucher No</th>
                <th>Type</th>
                <th>Debit Account (DR)</th>
                <th>Credit Account (CR)</th>
                <th>Amount</th>
                <th className="mm-actions-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.data.length === 0 && <tr><td colSpan={6} className="mm-empty">No voucher entries found.</td></tr>}
              {vouchers.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{new Date(item.date).toLocaleDateString()}</strong>
                    <div style={{ fontSize: '12px', color: '#4f46e5', fontFamily: 'monospace', marginTop: '2px' }}>{item.voucher_no}</div>
                  </td>
                  <td>
                    <span className={`badge-outline ${getTypeStyle(item.voucher_type)}`}>{item.voucher_type}</span>
                  </td>
                  <td>
                    <div style={{ color: '#0f172a', fontSize: '13px', fontWeight: '500' }}>{item.debit_account?.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Code: {item.debit_account?.code || 'N/A'}</div>
                  </td>
                  <td>
                    <div style={{ color: '#0f172a', fontSize: '13px', fontWeight: '500' }}>{item.credit_account?.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Code: {item.credit_account?.code || 'N/A'}</div>
                  </td>
                  <td>
                    <strong style={{ color: '#16a34a', fontSize: '15px' }}>৳ {item.amount}</strong>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '12px' }} title="Print Voucher">
                        <Icon name="printer" style={{ width: '12px', height: '12px' }} />
                      </button>
                      <button className="icon-btn icon-btn-danger" onClick={() => setDeletingItem(item)} title="Delete/Reverse"><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={vouchers} />
      </div>

      {isFormOpen && <VoucherFormModal accounts={accounts} onClose={() => setIsFormOpen(false)} />}
      
      {deletingItem && (
        <ConfirmDeleteModal 
          item={{ name: deletingItem.voucher_no }} 
          message="Are you sure you want to delete this voucher? This will reverse the transaction in your accounts."
          onCancel={() => setDeletingItem(null)} 
          onConfirm={() => {
            router.delete(route('admin.accounting.vouchers.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
          }} 
        />
      )}
    </AuthenticatedLayout>
  );
}