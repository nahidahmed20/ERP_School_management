import { useState, useEffect } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import SaleShowModal from './Partials/SaleShowModal';
import Swal from 'sweetalert2';

export default function Index({ sales, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [deletingItem, setDeletingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
    }
  }, [flash]);

  function applyFilters(overrides = {}) {
    router.get(route('admin.sales.index'), { search, per_page: perPage, ...overrides }, { preserveState: true, replace: true });
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Sales & POS</span>
            <h1>Sales History</h1>
          </div>
          <div className="mm-head-actions">
            <Link href={route('admin.sales.create')} className="btn" style={{ background: '#16a34a', borderColor: '#16a34a' }}>
              <Icon name="monitor" /> Open POS
            </Link>
          </div>
        </div>
      }
    >
      <Head title="Sales History" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select value={perPage} onChange={(e) => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}>
            <option value="10">10 / page</option>
            <option value="50">50 / page</option>
            <option value="all">Show All</option>
          </select>

          <div className="search">
            <Icon name="search" />
            <input placeholder="Search Invoice or Customer..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>

          <button className="btn btn-outline" onClick={() => applyFilters()}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>SL</th>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Due</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.data.length === 0 && (
                <tr><td colSpan={6} className="mm-empty">কোনো সেলস রেকর্ড পাওয়া যায়নি।</td></tr>
              )}
              {sales.data.map((sale, index) => (
                <tr key={sale.id}>
                <td style={{ color: '#64748b', fontWeight: 500 }}>
                    {(sales.from ?? 1) + index}
                  </td>
                  <td>
                    <div className="mm-label-cell">
                      <Icon name="receipt" className="mm-row-icon" />
                      <strong style={{ color: '#111827' }}>{sale.invoice_number}</strong>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{sale.customer_name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{sale.customer_phone || '-'}</div>
                  </td>
                  <td>{new Date(sale.created_at).toLocaleDateString()}</td>
                  <td><strong style={{ color: '#16a34a' }}>৳ {Number(sale.total_amount).toFixed(2)}</strong></td>
                  <td>
                    {sale.due_amount > 0
                      ? <strong style={{ color: '#b91c1c' }}>৳ {Number(sale.due_amount).toFixed(2)}</strong>
                      : <span style={{ color: '#15803d', fontSize: '12px', fontWeight: 'bold' }}>Paid</span>}
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" title="View" onClick={() => setViewingItem(sale)}><Icon name="eye" /></button>
                      <Link href={route('admin.sales.invoice', sale.id)} className="icon-btn" title="Print Invoice" target="_blank">
                          <Icon name="printer" />
                      </Link>
                      <Link href={route('admin.sales.edit', sale.id)} className="icon-btn" title="Edit"><Icon name="edit" /></Link>
                      <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => setDeletingItem(sale)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={sales} />
      </div>

      {viewingItem && <SaleShowModal sale={viewingItem} onClose={() => setViewingItem(null)} />}
      {deletingItem && (
        <ConfirmDeleteModal item={{ name: `Invoice ${deletingItem.invoice_number}` }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.sales.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}
