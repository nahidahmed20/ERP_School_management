import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import AuditLogDetailsModal from './Partials/AuditLogDetailsModal';

export default function Index({ auditLogs, filters }) {
  const [search, setSearch] = useState(filters.search ?? '');
  const [actionType, setActionType] = useState(filters.action_type ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '50');

  const [viewingLog, setViewingLog] = useState(null);

  function applyFilters() {
    router.get(route('admin.security.auditlogs'), { search, action_type: actionType, per_page: perPage }, { preserveState: true, replace: true });
  }

  useEffect(() => {
    if (perPage !== (filters.per_page ?? '50') || actionType !== (filters.action_type ?? '')) applyFilters();
  }, [perPage, actionType]);

  const getActionColor = (action) => {
    switch(action.toLowerCase()) {
      case 'created': return 'text-green-600 border-green-600 bg-green-50';
      case 'updated': return 'text-blue-600 border-blue-600 bg-blue-50';
      case 'deleted': return 'text-red-600 border-red-600 bg-red-50';
      default: return 'text-gray-600 border-gray-600 bg-gray-50';
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">System / Security Logs</span><h1>System Audit Logs</h1></div>
          <div className="mm-head-actions">
            <button className="btn btn-outline" onClick={applyFilters}>
              <Icon name="refresh" /> Refresh Logs
            </button>
          </div>
        </div>
      }
    >
      <Head title="Audit Logs" />
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
            <select value={actionType} onChange={(e) => setActionType(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <option value="">All Actions</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="deleted">Deleted</option>
            </select>
            <div className="search">
              <Icon name="search" />
              <input placeholder="Search Module or User..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
            </div>
            <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
          </div>
        </div>

        <div className="mm-table-wrap mt-3">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Performed By</th>
                <th>Action</th>
                <th>Module / Model</th>
                <th>IP Address</th>
                <th className="mm-actions-col">Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.data.length === 0 && <tr><td colSpan={6} className="mm-empty">No audit logs available.</td></tr>}
              {auditLogs.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{new Date(item.created_at).toLocaleString()}</strong>
                  </td>
                  <td>
                    {item.user ? (
                      <>
                        <strong style={{ color: '#0f172a' }}>{item.user.name}</strong>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{item.user.role}</div>
                      </>
                    ) : (
                      <span style={{ color: '#64748b' }}>System / Guest</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge-outline ${getActionColor(item.action)}`} style={{ textTransform: 'uppercase', fontSize: '11px' }}>
                      {item.action}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: '#334155' }}>{item.model_type.split('\\').pop()}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>ID: {item.model_id}</div>
                  </td>
                  <td>{item.ip_address}</td>
                  <td>
                    <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => setViewingLog(item)}>
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={auditLogs} />
      </div>

      {viewingLog && <AuditLogDetailsModal log={viewingLog} onClose={() => setViewingLog(null)} />}
    </AuthenticatedLayout>
  );
}
