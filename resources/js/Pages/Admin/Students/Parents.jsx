import { useState, useEffect } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';

export default function Parents({ parents, filters }) {
  const [search, setSearch] = useState(filters.search ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const applyFilters = (overrides = {}) => {
    router.get(route('admin.students.parents'), {
      search: search,
      per_page: perPage,
      ...overrides
    }, { preserveState: true, replace: true });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Directory</span>
            <h1>Parents & Guardians</h1>
            <p className="desc">স্কুলের সকল শিক্ষার্থীর অভিভাবকের তালিকা এবং যোগাযোগের তথ্য।</p>
          </div>
        </div>
      }
    >
      <Head title="Parents & Guardians" />

      <div className="card mm-card" style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
        <div className="mm-filters" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>

          <select
            value={perPage}
            onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minWidth: '110px' }}
          >
            <option value="10">10 / Page</option>
            <option value="20">20 / Page</option>
            <option value="50">50 / Page</option>
          </select>

          <div className="search" style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <input
              placeholder="Search by Father/Mother Name or Phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              style={{ padding: '10px 10px 10px 35px', borderRadius: '6px', border: '1px solid #ddd', width: '100%' }}
            />
            <Icon name="search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>

          <button className="btn btn-outline" onClick={() => applyFilters()} style={{ padding: '10px 20px', borderRadius: '6px' }}>
            Filter
          </button>
        </div>
      </div>

      <div className="card mm-card" style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
        <div className="mm-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="mm-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '15px' }}>Father's Info</th>
                <th style={{ padding: '15px' }}>Mother's Info</th>
                <th style={{ padding: '15px' }}>Email & Address</th>
                <th style={{ padding: '15px' }}>Children (Students)</th>
              </tr>
            </thead>
            <tbody>
              {parents.data.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                    কোনো অভিভাবকের তথ্য পাওয়া যায়নি।
                  </td>
                </tr>
              )}
              {parents.data.map((guardian) => (
                <tr key={guardian.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{guardian.father_name || 'N/A'}</div>
                    <div style={{ fontSize: '13px', color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <Icon name="phone" style={{ fontSize: '12px' }} /> {guardian.father_phone || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{guardian.mother_name || 'N/A'}</div>
                    <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <Icon name="phone" style={{ fontSize: '12px' }} /> {guardian.mother_phone || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontSize: '14px', color: '#475569', marginBottom: '4px' }}>
                      {guardian.guardian_email || <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>No Email</span>}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={guardian.address}>
                      {guardian.address || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {guardian.students?.length > 0 ? (
                        guardian.students.map(student => (
                          <div key={student.id} style={{ background: '#f1f5f9', padding: '6px 10px', borderRadius: '6px', fontSize: '13px' }}>
                            <span style={{ fontWeight: '600', color: '#0f172a' }}>{student.first_name} {student.last_name || ''}</span>
                            <span style={{ color: '#64748b', marginLeft: '6px' }}>(Adm: {student.admission_no})</span>
                            {student.current_enrollment && (
                              <div style={{ fontSize: '11px', color: '#4f46e5', marginTop: '2px' }}>
                                Class: {student.current_enrollment.schoolClass?.name} | Roll: {student.current_enrollment.roll_no}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <span style={{ color: '#ef4444', fontSize: '13px' }}>No active students</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9' }}>
          <Pagination meta={parents} />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
