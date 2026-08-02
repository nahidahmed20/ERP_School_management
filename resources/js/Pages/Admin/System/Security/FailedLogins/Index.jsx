import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';

export default function Index({ failedLogins, filters }) {
  const [search, setSearch] = useState(filters.search ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '50');

  function applyFilters() {
    router.get(route('admin.security.failedlogins'), { search, per_page: perPage }, { preserveState: true, replace: true });
  }

  useEffect(() => {
    if (perPage !== (filters.per_page ?? '50')) applyFilters();
  }, [perPage]);

  // Helper to extract basic browser info
  const getBrowserInfo = (agent) => {
    if (!agent) return 'Unknown Browser';
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
          <div><span className="eyebrow">System / Security Logs</span><h1 style={{ color: '#dc2626' }}>Failed Login Attempts</h1></div>
          <div className="mm-head-actions">
            <button className="btn btn-outline" onClick={applyFilters}>
              <Icon name="refresh" /> Refresh Logs
            </button>
          </div>
        </div>
      }
    >
      <Head title="Failed Login Attempts" />
      
      {/* Alert Box for Security Warning */}
      <div style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '15px', borderRadius: '4px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <Icon name="shield" style={{ color: '#ef4444', width: '24px', height: '24px' }} />
        <div>
          <strong style={{ color: '#991b1b', display: 'block' }}>Security Notice</strong>
          <span style={{ color: '#b91c1c', fontSize: '14px' }}>These logs indicate unsuccessful attempts to access the system. Multiple attempts from the same IP may indicate a brute-force attack.</span>
        </div>
      </div>

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
              <input placeholder="Search Email or IP..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
            </div>
            <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
          </div>
        </div>

        <div className="mm-table-wrap mt-3">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>SL</th>
                <th>Attempted Email</th>
                <th>IP Address</th>
                <th>Browser Details</th>
                <th>Attempt Time</th>
              </tr>
            </thead>
            <tbody>
              {failedLogins.data.length === 0 && <tr><td colSpan={5} className="mm-empty">No failed login attempts recorded. System is secure!</td></tr>}
              {failedLogins.data.map((item, index) => (
                <tr key={item.id} style={{ background: '#fffcfc' }}>
                  <td>{(failedLogins.from ?? 1) + index}</td>
                  <td>
                    <strong style={{ color: '#dc2626' }}>{item.email_attempted}</strong>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Icon name="globe" style={{ width: '14px', height: '14px', color: '#64748b' }} />
                      <span style={{ color: '#4f46e5', fontWeight: 'bold' }}>{item.ip_address}</span>
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: '#334155' }}>{getBrowserInfo(item.user_agent)}</strong>
                    <div style={{ fontSize: '11px', color: '#64748b', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.user_agent}>
                      {item.user_agent}
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{new Date(item.attempted_at).toLocaleTimeString()}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{new Date(item.attempted_at).toLocaleDateString()}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={failedLogins} />
      </div>
    </AuthenticatedLayout>
  );
}