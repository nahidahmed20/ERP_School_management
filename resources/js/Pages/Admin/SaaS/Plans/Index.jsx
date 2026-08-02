import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import PlanFormModal from './Partials/PlanFormModal';
import Swal from 'sweetalert2';

export default function Index({ plans, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [editingItem, setEditingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
  }, [flash]);

  function applyFilters() {
    router.get(route('admin.saas.plans.index'), { search, per_page: perPage }, { preserveState: true, replace: true });
  }

  useEffect(() => {
    if (perPage !== (filters.per_page ?? '10')) applyFilters();
  }, [perPage]);

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">SaaS, AI & Backups</span><h1>Subscription Plans</h1></div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setIsFormOpen(true); }}>
              <Icon name="plus" /> Add New Plan
            </button>
          </div>
        </div>
      }
    >
      <Head title="Subscription Plans" />
      <div className="card mm-card">

        <div className="mm-filters" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Show</span>
            <select value={perPage} onChange={(e) => setPerPage(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <option value="10">10</option><option value="25">25</option><option value="50">50</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="search">
              <Icon name="search" />
              <input placeholder="Search Plans..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
            </div>
            <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
          </div>
        </div>

        <div className="mm-table-wrap mt-3">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>SL</th>
                <th>Plan Name</th>
                <th>Pricing</th>
                <th>Features</th>
                <th>Status</th>
                <th className="mm-actions-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {plans.data.length === 0 && <tr><td colSpan={6} className="mm-empty">No subscription plans created yet.</td></tr>}
              {plans.data.map((item, index) => (
                <tr key={item.id}>
                  <td>{(plans.from ?? 1) + index}</td>
                  <td>
                    <strong style={{ color: '#0f172a', fontSize: '15px' }}>{item.name}</strong>
                  </td>
                  <td>
                    <strong style={{ color: '#4f46e5', fontSize: '16px' }}>{item.currency} {item.price}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>/ {item.billing_cycle}</div>
                  </td>
                  <td>
                    {item.features && item.features.length > 0 ? (
                      <ul style={{ paddingLeft: '15px', margin: 0, fontSize: '12px', color: '#475569' }}>
                        {item.features.slice(0, 3).map((feat, i) => <li key={i}>{feat}</li>)}
                        {item.features.length > 3 && <li style={{ listStyle: 'none', color: '#4f46e5' }}>+ {item.features.length - 3} more...</li>}
                      </ul>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>No features listed</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge-outline ${item.is_active ? 'border-green-600 text-green-600' : 'border-gray-500 text-gray-500'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
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
        <Pagination meta={plans} />
      </div>

      {isFormOpen && <PlanFormModal item={editingItem} onClose={() => setIsFormOpen(false)} />}

      {deletingItem && (
        <ConfirmDeleteModal
          item={{ name: deletingItem.name }}
          message="Are you sure you want to delete this subscription plan?"
          onCancel={() => setDeletingItem(null)}
          onConfirm={() => {
            router.delete(route('admin.saas.plans.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
          }}
        />
      )}
    </AuthenticatedLayout>
  );
}
