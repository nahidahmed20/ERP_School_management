import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ trustedDevices, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');
  
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
  }, [flash]);

  function applyFilters() {
    router.get(route('admin.security-devices.index'), { search, per_page: perPage }, { preserveState: true, replace: true });
  }

  useEffect(() => {
    if (perPage !== (filters.per_page ?? '10')) applyFilters();
  }, [perPage]);

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">System / Security Logs</span><h1>Trusted Devices</h1></div>
          <div className="mm-head-actions">
            <button className="btn btn-outline" onClick={applyFilters}>
              <Icon name="refresh" /> Refresh
            </button>
          </div>
        </div>
      }
    >
      <Head title="Trusted Devices" />
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
              <input placeholder="Search user or device..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
            </div>
            <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
          </div>
        </div>

        <div className="mm-table-wrap mt-3">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>SL</th>
                <th>User Details</th>
                <th>Device Name</th>
                <th>Last IP Address</th>
                <th>Last Used</th>
                <th className="mm-actions-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {trustedDevices.data.length === 0 && <tr><td colSpan={6} className="mm-empty">No trusted devices found.</td></tr>}
              {trustedDevices.data.map((item, index) => (
                <tr key={item.id}>
                  <td>{(trustedDevices.from ?? 1) + index}</td>
                  <td>
                    {item.user ? (
                      <>
                        <strong style={{ color: '#0f172a' }}>{item.user.name}</strong>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{item.user.email}</div>
                      </>
                    ) : (
                      <span style={{ color: '#ef4444' }}>Unknown User</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Icon name="monitor" style={{ width: '16px', height: '16px', color: '#4f46e5' }} />
                      <strong style={{ color: '#334155' }}>{item.device_name}</strong>
                    </div>
                  </td>
                  <td>{item.last_ip_address || 'N/A'}</td>
                  <td>
                    {item.last_used_at ? (
                      <>
                        <strong style={{ color: '#0f172a' }}>{new Date(item.last_used_at).toLocaleDateString()}</strong>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{new Date(item.last_used_at).toLocaleTimeString()}</div>
                      </>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>Never</span>
                    )}
                  </td>
                  <td>
                    <button className="btn btn-outline" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={() => setDeletingItem(item)}>
                      Revoke Access
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={trustedDevices} />
      </div>

      {deletingItem && (
        <ConfirmDeleteModal 
          item={{ name: deletingItem.device_name }} 
          message="Are you sure you want to revoke access for this device? The user will need to verify their identity again if they try to log in from it."
          onCancel={() => setDeletingItem(null)} 
          onConfirm={() => {
            router.delete(route('admin.security-devices.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
          }} 
        />
      )}
    </AuthenticatedLayout>
  );
}