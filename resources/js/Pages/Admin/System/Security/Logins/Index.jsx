import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';

export default function Index({ logins, filters }) {
  const [search, setSearch] = useState(filters.search ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '50');

  function applyFilters() {
    router.get(route('admin.security.logins'), { search, per_page: perPage }, { preserveState: true, replace: true });
  }

  useEffect(() => {
    if (perPage !== (filters.per_page ?? '50')) applyFilters();
  }, [perPage]);

  // Helper to extract basic browser/OS info from user_agent
  const getBrowserInfo = (agent) => {
    if (!agent) return 'Unknown';
    if (agent.includes('Firefox')) return 'Firefox';
    if (agent.includes('Chrome') && !agent.includes('Edg')) return 'Chrome';
    if (agent.includes('Safari') && !agent.includes('Chrome')) return 'Safari';
    if (agent.includes('Edg')) return 'Edge';
    return 'Other Browser';
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">System / Security Logs</span><h1>Login History</h1></div>
          <div className="mm-head-actions">
            <button className="btn btn-outline" onClick={applyFilters}>
              <Icon name="refresh" /> Refresh
            </button>
          </div>
        </div>
      }
    >
      <Head title="Login History" />
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
            <div className="search">
              <Icon name="search" />
              <input placeholder="Search user or IP..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
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
                <th>IP Address</th>
                <th>Device & Browser</th>
                <th>Login Time</th>
              </tr>
            </thead>
            <tbody>
              {logins.data.length === 0 && <tr><td colSpan={5} className="mm-empty">No login history found.</td></tr>}
              {logins.data.map((item, index) => (
                <tr key={item.id}>
                  <td>{(logins.from ?? 1) + index}</td>
                  <td>
                    {item.user ? (
                      <>
                        <strong style={{ color: '#0f172a' }}>{item.user.name}</strong>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{item.user.email} <span className="badge-outline ml-1" style={{ fontSize: '10px', padding: '2px 4px' }}>{item.user.role || 'User'}</span></div>
                      </>
                    ) : (
                      <span style={{ color: '#ef4444' }}>Deleted User (ID: {item.user_id})</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Icon name="globe" style={{ width: '14px', height: '14px', color: '#64748b' }} />
                      <span style={{ color: '#4f46e5', fontWeight: 'bold' }}>{item.ip_address}</span>
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: '#334155' }}>{item.device_type}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }} title={item.user_agent}>
                      {getBrowserInfo(item.user_agent)}
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{new Date(item.login_at).toLocaleTimeString()}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{new Date(item.login_at).toLocaleDateString()}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={logins} />
      </div>
    </AuthenticatedLayout>
  );
}