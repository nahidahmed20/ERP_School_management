import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import ApiKeyFormModal from './Partials/ApiKeyFormModal';
import Swal from 'sweetalert2';

export default function Index({ apiKeys, tenants, filters }) {
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
    router.get(route('admin.saas.apikeys.index'), { search, per_page: perPage }, { preserveState: true, replace: true });
  }

  useEffect(() => {
    if (perPage !== (filters.per_page ?? '10')) applyFilters();
  }, [perPage]);

  const copyToClipboard = (key) => {
    navigator.clipboard.writeText(key);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'API Key Copied!', showConfirmButton: false, timer: 2000 });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">SaaS, AI & Backups</span><h1>API Keys & Access</h1></div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setIsFormOpen(true); }}>
              <Icon name="plus" /> Generate New Key
            </button>
          </div>
        </div>
      }
    >
      <Head title="API Keys" />
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
              <input placeholder="Search Key Name..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
            </div>
            <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
          </div>
        </div>

        <div className="mm-table-wrap mt-3">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>SL</th>
                <th>Key Name & Details</th>
                <th>Secret Key</th>
                <th>Assigned Tenant</th>
                <th>Status</th>
                <th className="mm-actions-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.data.length === 0 && <tr><td colSpan={6} className="mm-empty">No API Keys generated yet.</td></tr>}
              {apiKeys.data.map((item, index) => (
                <tr key={item.id}>
                  <td>{(apiKeys.from ?? 1) + index}</td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{item.name}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {item.expires_at ? `Expires: ${new Date(item.expires_at).toLocaleDateString()}` : 'Never Expires'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '5px 10px', borderRadius: '6px', width: 'fit-content' }}>
                      <code style={{ fontSize: '12px', color: '#334155', fontFamily: 'monospace' }}>
                        {item.api_key.substring(0, 15)}...
                      </code>
                      <button className="icon-btn" style={{ padding: '2px', background: '#e2e8f0' }} onClick={() => copyToClipboard(item.api_key)} title="Copy Full Key">
                        <Icon name="copy" />
                      </button>
                    </div>
                  </td>
                  <td>
                    {item.tenant ? (
                      <span className="badge-outline border-blue-600 text-blue-600">{item.tenant.company_name}</span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>Global / Master</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge-outline ${item.is_active ? 'border-green-600 text-green-600' : 'border-gray-500 text-gray-500'}`}>
                      {item.is_active ? 'Active' : 'Revoked'}
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
        <Pagination meta={apiKeys} />
      </div>

      {isFormOpen && <ApiKeyFormModal item={editingItem} tenants={tenants} onClose={() => setIsFormOpen(false)} />}

      {deletingItem && (
        <ConfirmDeleteModal
          item={{ name: deletingItem.name }}
          message="Are you sure you want to delete this API Key? Any application using it will lose access immediately."
          onCancel={() => setDeletingItem(null)}
          onConfirm={() => {
            router.delete(route('admin.saas.apikeys.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
          }}
        />
      )}
    </AuthenticatedLayout>
  );
}
