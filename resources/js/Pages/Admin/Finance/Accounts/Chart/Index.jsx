import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import AccountFormModal from './Partials/AccountFormModal';
import Swal from 'sweetalert2';

export default function Index({ accounts, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [typeFilter, setTypeFilter] = useState(filters.type ?? '');
  
  const [editingItem, setEditingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
  }, [flash]);

  function applyFilters() {
    router.get(route('admin.accounting.chart.index'), { search, type: typeFilter }, { preserveState: true, replace: true });
  }

  useEffect(() => {
    if (typeFilter !== (filters.type ?? '')) applyFilters();
  }, [typeFilter]);

  const getTypeStyle = (type) => {
    if (type === 'Asset') return 'border-blue-600 text-blue-700 bg-blue-50'; // Banks, Cash
    if (type === 'Liability') return 'border-red-600 text-red-700 bg-red-50'; // Loans, Payables
    if (type === 'Income') return 'border-green-600 text-green-700 bg-green-50'; // Fees, Donations
    if (type === 'Expense') return 'border-orange-500 text-orange-700 bg-orange-50'; // Salaries, Bills
    if (type === 'Equity') return 'border-purple-600 text-purple-700 bg-purple-50'; // Capital
    return 'border-gray-600 text-gray-700';
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">Finance & Accounts</span><h1>Chart of Accounts & Banks</h1></div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setIsFormOpen(true); }}>
              <Icon name="plus" /> Add New Account
            </button>
          </div>
        </div>
      }
    >
      <Head title="Chart of Accounts" />
      <div className="card mm-card">
        
        <div className="mm-filters" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <option value="">All Account Types</option>
              <option value="Asset">Assets (Banks, Cash)</option>
              <option value="Liability">Liabilities (Payables)</option>
              <option value="Income">Income / Revenue</option>
              <option value="Expense">Expenses</option>
              <option value="Equity">Equity / Capital</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="search">
              <Icon name="search" />
              <input placeholder="Search Name or Code..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
            </div>
            <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
          </div>
        </div>

        <div className="mm-table-wrap mt-3">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>SL</th>
                <th>Account Code</th>
                <th>Account Name</th>
                <th>Category (Type)</th>
                <th>Opening Balance</th>
                <th>Status</th>
                <th className="mm-actions-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {accounts.data.length === 0 && <tr><td colSpan={7} className="mm-empty">No accounts found in the chart.</td></tr>}
              {accounts.data.map((item, index) => (
                <tr key={item.id}>
                  <td>{(accounts.from ?? 1) + index}</td>
                  <td>
                    <code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', color: '#475569' }}>
                      {item.code || 'N/A'}
                    </code>
                  </td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{item.name}</strong>
                    {item.description && <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{item.description}</div>}
                  </td>
                  <td>
                    <span className={`badge-outline ${getTypeStyle(item.type)}`}>
                      {item.type}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: '#334155' }}>৳ {item.opening_balance}</strong>
                  </td>
                  <td>
                    <span className={`badge-outline ${item.is_active ? 'border-green-600 text-green-600' : 'border-gray-500 text-gray-500'}`}>
                      {item.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" onClick={() => { setEditingItem(item); setIsFormOpen(true); }}><Icon name="edit" /></button>
                      <button className="icon-btn icon-btn-danger" onClick={() => setDeletingItem(item)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={accounts} />
      </div>

      {isFormOpen && <AccountFormModal item={editingItem} onClose={() => setIsFormOpen(false)} />}
      
      {deletingItem && (
        <ConfirmDeleteModal 
          item={{ name: deletingItem.name }} 
          message="Are you sure you want to delete this account? It cannot be deleted if there are transactions associated with it."
          onCancel={() => setDeletingItem(null)} 
          onConfirm={() => {
            router.delete(route('admin.accounting.chart.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
          }} 
        />
      )}
    </AuthenticatedLayout>
  );
}