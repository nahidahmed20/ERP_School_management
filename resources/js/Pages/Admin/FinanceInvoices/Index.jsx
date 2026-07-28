import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import InvoiceFormModal from './Partials/InvoiceFormModal';
import InvoiceShowModal from './Partials/InvoiceShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ invoices, students, feeGroups, campuses, filters }) {
  const { flash, auth } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [status, setStatus] = useState(filters.status ?? '');
  const [feeGroupId, setFeeGroupId] = useState(filters.fee_group_id ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    }
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.fees.invoices.create'), {
      search, status, fee_group_id: feeGroupId, per_page: perPage, ...overrides,
    }, { preserveState: true, replace: true });
  }

  const getStatusColor = (status) => {
    switch(status) {
        case 'Paid': return { bg: '#dcfce7', text: '#15803d' };
        case 'Partial': return { bg: '#e0f2fe', text: '#0369a1' };
        case 'Unpaid': return { bg: '#fef3c7', text: '#d97706' };
        case 'Cancelled': return { bg: '#fee2e2', text: '#b91c1c' };
        default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Finance & Accounts</span>
            <h1>Fee Invoices</h1>
            <p className="desc">স্টুডেন্টদের ফি এর ইনভয়েস বা বিল পরিচালনা করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Create Invoice
            </button>
          </div>
        </div>
      }
    >
      <Head title="Invoices" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select value={perPage} onChange={(e) => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}>
            <option value="10">10 / page</option>
            <option value="50">50 / page</option>
            <option value="all">Show All</option>
          </select>
          
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search invoice no or student..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>

          <select value={feeGroupId} onChange={(e) => { setFeeGroupId(e.target.value); applyFilters({ fee_group_id: e.target.value }); }}>
            <option value="">All Fee Groups</option>
            {feeGroups.map(fg => <option key={fg.id} value={fg.id}>{fg.name}</option>)}
          </select>

          <select value={status} onChange={(e) => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}>
            <option value="">All Status</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Partial">Partial</option>
            <option value="Paid">Paid</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button className="btn btn-outline" onClick={() => applyFilters()}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Student</th>
                <th>Fee Group</th>
                <th>Amount (৳)</th>
                <th>Due Date</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.data.length === 0 && (
                <tr><td colSpan={7} className="mm-empty">কোনো ইনভয়েস পাওয়া যায়নি।</td></tr>
              )}
              {invoices.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="mm-label-cell">
                      <Icon name="file-text" className="mm-row-icon" />
                      <strong style={{ color: '#111827' }}>{item.invoice_no}</strong>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{item.student?.first_name} {item.student?.last_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>ID: {item.student?.admission_no}</div>
                  </td>
                  <td>{item.fee_group?.name}</td>
                  <td><strong style={{ color: '#047857' }}>৳ {item.amount}</strong></td>
                  <td><span style={{ fontSize: '0.85rem', color: '#b91c1c' }}>{item.due_date}</span></td>
                  <td>
                    <span style={{ 
                        backgroundColor: getStatusColor(item.status).bg, 
                        color: getStatusColor(item.status).text,
                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" title="View" onClick={() => setViewingItem(item)}>
                        <Icon name="eye" />
                      </button>
                      <button className="icon-btn" title="Edit" onClick={() => { setEditingItem(item); setFormOpen(true); }}>
                        <Icon name="edit" />
                      </button>
                      <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => setDeletingItem(item)}>
                        <Icon name="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={invoices} />
      </div>

      {formOpen && <InvoiceFormModal item={editingItem} students={students} feeGroups={feeGroups} campuses={campuses} activeCampusId={auth?.active_campus_id} onClose={() => setFormOpen(false)} />}

      {viewingItem && <InvoiceShowModal item={viewingItem} onClose={() => setViewingItem(null)} />}

      {deletingItem && (
        <ConfirmDeleteModal item={{ name: `Invoice ${deletingItem.invoice_no}` }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.fees.invoices.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}