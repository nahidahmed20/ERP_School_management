import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import LoanFormModal from './Partials/LoanFormModal';
import Swal from 'sweetalert2';

export default function Index({ loans, staffList, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [statusFilter, setStatusFilter] = useState(filters.status ?? '');
  
  const [editingItem, setEditingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
  }, [flash]);

  function applyFilters() {
    router.get(route('admin.staff-loans.index'), { search, status: statusFilter }, { preserveState: true, replace: true });
  }

  useEffect(() => {
    if (statusFilter !== (filters.status ?? '')) applyFilters();
  }, [statusFilter]);

  const getStatusBadge = (status) => {
    if (status === 'Approved') return 'border-green-600 text-green-700 bg-green-50';
    if (status === 'Pending') return 'border-yellow-500 text-yellow-700 bg-yellow-50';
    if (status === 'Rejected') return 'border-red-600 text-red-700 bg-red-50';
    if (status === 'Completed') return 'border-blue-600 text-blue-700 bg-blue-50';
    return 'border-gray-600 text-gray-700';
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">HR & Payroll</span><h1>Advance Salary & Loans</h1></div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setIsFormOpen(true); }}>
              <Icon name="plus" /> Add Request
            </button>
          </div>
        </div>
      }
    >
      <Head title="Advance Salary & Loans" />
      <div className="card mm-card">
        
        <div className="mm-filters" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed (Paid Off)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="search">
              <Icon name="search" />
              <input placeholder="Search Staff Name/ID..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
            </div>
            <button className="btn btn-outline" onClick={applyFilters}>Search</button>
          </div>
        </div>

        <div className="mm-table-wrap mt-3">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>SL</th>
                <th>Staff Details</th>
                <th>Type & Reason</th>
                <th>Amount Details</th>
                <th>Status</th>
                <th className="mm-actions-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {loans.data.length === 0 && <tr><td colSpan={6} className="mm-empty">No loan or advance requests found.</td></tr>}
              {loans.data.map((item, index) => (
                <tr key={item.id}>
                  <td>{(loans.from ?? 1) + index}</td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{item.staff?.first_name} {item.staff?.last_name}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>ID: {item.staff?.staff_id_no}</div>
                  </td>
                  <td>
                    <span className="badge-outline border-indigo-600 text-indigo-600">{item.loan_type}</span>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.reason || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: '#16a34a', fontSize: '15px' }}>৳ {item.amount}</strong>
                    {item.monthly_deduction > 0 && (
                      <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '2px' }}>
                        Deduct: ৳ {item.monthly_deduction} / month
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge-outline ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                    {item.status === 'Approved' && item.approver && (
                      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>By: {item.approver.name}</div>
                    )}
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
        <Pagination meta={loans} />
      </div>

      {isFormOpen && <LoanFormModal item={editingItem} staffList={staffList} onClose={() => setIsFormOpen(false)} />}
      
      {deletingItem && (
        <ConfirmDeleteModal 
          item={{ name: deletingItem.loan_type }} 
          message="Are you sure you want to delete this record? This action cannot be undone."
          onCancel={() => setDeletingItem(null)} 
          onConfirm={() => {
            router.delete(route('admin.staff-loans.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
          }} 
        />
      )}
    </AuthenticatedLayout>
  );
}