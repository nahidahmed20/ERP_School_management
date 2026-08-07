import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import FeeFormModal from './Partials/FeeFormModal';
import Swal from 'sweetalert2';

export default function Index({ fees, students, rooms, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [statusFilter, setStatusFilter] = useState(filters.status ?? '');
  const [monthFilter, setMonthFilter] = useState(filters.month ?? '');
  
  const [editingItem, setEditingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
  }, [flash]);

  function applyFilters() {
    router.get(route('admin.hostel-fees.index'), { search, status: statusFilter, month: monthFilter }, { preserveState: true, replace: true });
  }

  useEffect(() => {
    if (statusFilter !== (filters.status ?? '') || monthFilter !== (filters.month ?? '')) applyFilters();
  }, [statusFilter, monthFilter]);

  const getStatusBadge = (status) => {
    if (status === 'Paid') return 'border-green-600 text-green-700 bg-green-50';
    return 'border-yellow-500 text-yellow-700 bg-yellow-50'; // Pending
  };

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">Campus Life / Hostel</span><h1>Hostel Fee Collection</h1></div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setIsFormOpen(true); }}>
              <Icon name="plus" /> Add Fee Record
            </button>
          </div>
        </div>
      }
    >
      <Head title="Hostel Fees" />
      <div className="card mm-card">
        
        <div className="mm-filters" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <option value="">All Months</option>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <option value="">All Statuses</option>
              <option value="Pending">Pending (Due)</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="search">
              <Icon name="search" />
              <input placeholder="Search Student Name/ID..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
            </div>
            <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
          </div>
        </div>

        <div className="mm-table-wrap mt-3">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>SL</th>
                <th>Student Details</th>
                <th>Room Details</th>
                <th>Billing Period</th>
                <th>Amount & Status</th>
                <th className="mm-actions-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {fees.data.length === 0 && <tr><td colSpan={6} className="mm-empty">No hostel fee records found.</td></tr>}
              {fees.data.map((item, index) => (
                <tr key={item.id}>
                  <td>{(fees.from ?? 1) + index}</td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{item.student?.first_name} {item.student?.last_name}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>ID: {item.student?.admission_no}</div>
                  </td>
                  <td>
                    {item.room ? (
                      <>
                        <strong style={{ color: '#0f172a' }}>Room: {item.room.room_number}</strong>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{item.room.hostel_name}</div>
                      </>
                    ) : <span style={{ color: '#94a3b8' }}>N/A</span>}
                  </td>
                  <td>
                    <span className="badge-outline border-blue-600 text-blue-700">{item.month} {item.year}</span>
                  </td>
                  <td>
                    <strong style={{ color: '#16a34a', fontSize: '15px' }}>৳ {item.amount}</strong>
                    <div style={{ marginTop: '4px' }}>
                      <span className={`badge-outline ${getStatusBadge(item.status)}`} style={{ padding: '2px 6px', fontSize: '10px' }}>
                        {item.status}
                      </span>
                    </div>
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
        <Pagination meta={fees} />
      </div>

      {isFormOpen && <FeeFormModal item={editingItem} students={students} rooms={rooms} onClose={() => setIsFormOpen(false)} />}
      
      {deletingItem && (
        <ConfirmDeleteModal 
          item={{ name: "this fee record" }} 
          message="Are you sure you want to delete this hostel fee record? If paid, it will affect financial reports."
          onCancel={() => setDeletingItem(null)} 
          onConfirm={() => {
            router.delete(route('admin.hostel-fees.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
          }} 
        />
      )}
    </AuthenticatedLayout>
  );
}