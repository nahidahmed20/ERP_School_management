import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import LogDetailsModal from './Partials/LogDetailsModal';

export default function Index({ logs, filters }) {
  const [search, setSearch] = useState(filters.search ?? '');
  const [statusFilter, setStatusFilter] = useState(filters.sync_status ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '50');
  
  const [viewingLog, setViewingLog] = useState(null);

  function applyFilters() {
    router.get(route('admin.biometric.synclogs'), { search, sync_status: statusFilter, per_page: perPage }, { preserveState: true, replace: true });
  }

  useEffect(() => {
    if (perPage !== (filters.per_page ?? '50') || statusFilter !== (filters.sync_status ?? '')) applyFilters();
  }, [perPage, statusFilter]);

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">System / Biometric Devices</span><h1>Device Sync Logs</h1></div>
          <div className="mm-head-actions">
            <button className="btn btn-outline" onClick={applyFilters}>
              <Icon name="refresh" /> Refresh Logs
            </button>
          </div>
        </div>
      }
    >
      <Head title="Sync Logs" />
      <div className="card mm-card">
        
        <div className="mm-filters" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Show</span>
            <select value={perPage} onChange={(e) => setPerPage(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <option value="25">25</option><option value="50">50</option><option value="100">100</option>
              <option value="500">500</option><option value="All">All</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <option value="">All Status</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
            </select>
            <div className="search">
              <Icon name="search" />
              <input placeholder="Search User or Bio ID..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
            </div>
            <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
          </div>
        </div>

        <div className="mm-table-wrap mt-3">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Punch Time</th>
                <th>User Details</th>
                <th>Device</th>
                <th>State</th>
                <th>Sync Status</th>
                <th className="mm-actions-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.data.length === 0 && <tr><td colSpan={6} className="mm-empty">No sync logs found.</td></tr>}
              {logs.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{new Date(item.punch_time).toLocaleTimeString()}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{new Date(item.punch_time).toLocaleDateString()}</div>
                  </td>
                  <td>
                    {item.enrolled_user ? (
                      <>
                        <strong style={{ color: '#0f172a' }}>{item.enrolled_user.user_name}</strong>
                        <div style={{ fontSize: '11px', color: '#4f46e5' }}>{item.enrolled_user.user_type} (Bio ID: {item.biometric_id})</div>
                      </>
                    ) : (
                      <span style={{ color: '#ef4444' }}>Unknown (Bio ID: {item.biometric_id})</span>
                    )}
                  </td>
                  <td>{item.device?.name || <span style={{ color: '#94a3b8' }}>Deleted Device</span>}</td>
                  <td><span className="badge-outline">{item.punch_state}</span></td>
                  <td>
                    <span className={`badge-outline ${item.sync_status === 'Success' ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'}`}>
                      {item.sync_status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => setViewingLog(item)}>Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={logs} />
      </div>

      {viewingLog && <LogDetailsModal log={viewingLog} onClose={() => setViewingLog(null)} />}
    </AuthenticatedLayout>
  );
}