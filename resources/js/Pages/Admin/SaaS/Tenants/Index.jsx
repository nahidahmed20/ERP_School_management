import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import TenantFormModal from './Partials/TenantFormModal';
import Swal from 'sweetalert2';

export default function Index({ tenants, filters }) {
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
    router.get(route('admin.saas.tenants.index'), { search, per_page: perPage }, { preserveState: true, replace: true });
  }

  useEffect(() => {
    if (perPage !== (filters.per_page ?? '10')) applyFilters();
  }, [perPage]);

  // Check if subscription is expired
  const isExpired = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">SaaS, AI & Backups</span><h1>Tenants & Billing</h1></div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setIsFormOpen(true); }}>
              <Icon name="plus" /> Onboard New Tenant
            </button>
          </div>
        </div>
      }
    >
      <Head title="Tenants & Billing" />
      <div className="card mm-card">

        <div className="mm-filters" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Show</span>
            <select value={perPage} onChange={(e) => setPerPage(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <option value="10">10</option><option value="25">25</option><option value="50">50</option>
              <option value="100">100</option><option value="All">All</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="search">
              <Icon name="search" />
              <input placeholder="Search School, Domain..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
            </div>
            <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
          </div>
        </div>

        <div className="mm-table-wrap mt-3">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>SL</th>
                <th>Client / School Name</th>
                <th>Domain URL</th>
                <th>Current Plan</th>
                <th>Billing Valid Until</th>
                <th>Status</th>
                <th className="mm-actions-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {tenants.data.length === 0 && <tr><td colSpan={7} className="mm-empty">No tenants found. Start onboarding clients!</td></tr>}
              {tenants.data.map((item, index) => (
                <tr key={item.id}>
                  <td>{(tenants.from ?? 1) + index}</td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{item.company_name}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{item.admin_email}</div>
                  </td>
                  <td>
                    <a href={`https://${item.domain}`} target="_blank" rel="noreferrer" style={{ color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Icon name="external-link" style={{ width: '12px', height: '12px' }} /> {item.domain}
                    </a>
                  </td>
                  <td><span className="badge-outline border-indigo-600 text-indigo-600">{item.subscription_plan}</span></td>
                  <td>
                    {item.valid_until ? (
                      <span style={{ color: isExpired(item.valid_until) ? '#dc2626' : '#16a34a', fontWeight: 'bold' }}>
                        {new Date(item.valid_until).toLocaleDateString()}
                        {isExpired(item.valid_until) && <span style={{ display: 'block', fontSize: '11px' }}>(Expired)</span>}
                      </span>
                    ) : (
                      <span style={{ color: '#64748b' }}>Lifetime</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge-outline ${item.status === 'Active' ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'}`}>
                      {item.status}
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
        <Pagination meta={tenants} />
      </div>

      {isFormOpen && <TenantFormModal item={editingItem} onClose={() => setIsFormOpen(false)} />}

      {deletingItem && (
        <ConfirmDeleteModal
          item={{ name: deletingItem.company_name }}
          message="Warning: Deleting a tenant will remove all their data. Proceed with caution."
          onCancel={() => setDeletingItem(null)}
          onConfirm={() => {
            router.delete(route('admin.saas.tenants.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
          }}
        />
      )}
    </AuthenticatedLayout>
  );
}
