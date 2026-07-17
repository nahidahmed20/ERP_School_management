import { useState, useEffect } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

// --- Staff View Modal Component ---
function StaffViewModal({ staff, onClose }) {
  if (!staff) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
    }}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()} style={{
        background: '#fff', borderRadius: '16px', width: '95%', maxWidth: '900px', maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column'
      }}>
        <div className="mm-modal-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10 }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="briefcase" style={{ color: '#4f46e5' }} /> Staff Profile Details
          </h3>
          <button onClick={onClose} style={{ background: '#cbd5e1', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
            <Icon name="close" />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Info Banner */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '4px solid #fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              {staff.photo ? <img src={`/storage/${staff.photo}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icon name="user" style={{ fontSize: '45px', color: '#4f46e5' }} />}
            </div>
            <div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>{staff.first_name} {staff.last_name || ''}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '14px', color: '#475569' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><strong>EMP ID:</strong> <span style={{ color: '#4f46e5', fontWeight: '600' }}>{staff.staff_id_no}</span></span>
                <span>•</span>
                <span><strong>Designation:</strong> {staff.designation?.name}</span>
                <span>•</span>
                <span><strong>Department:</strong> {staff.department?.name}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {/* Employment Info */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#4f46e5', borderBottom: '2px solid #e0e7ff', paddingBottom: '8px' }}>Employment Details</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Joining Date:</span> <strong>{staff.joining_date}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Basic Salary:</span> <strong>৳ {staff.basic_salary}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Qualification:</span> <strong>{staff.qualification || 'N/A'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Experience:</span> <strong>{staff.experience || 'N/A'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Portal Access:</span>
                  {staff.user_id ? (
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>Enabled</span>
                  ) : (
                    <span style={{ background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>Disabled</span>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#0ea5e9', borderBottom: '2px solid #e0f2fe', paddingBottom: '8px' }}>Personal Details</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Father's Name:</span> <strong>{staff.father_name || 'N/A'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Mother's Name:</span> <strong>{staff.mother_name || 'N/A'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>DOB / Gender:</span> <strong>{staff.date_of_birth} ({staff.gender})</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Blood Group:</span> <strong style={{ color: '#be123c' }}>{staff.blood_group || 'N/A'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Marital Status:</span> <strong>{staff.marital_status || 'N/A'}</strong></div>
              </div>
            </div>

            {/* Contact Info */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#10b981', borderBottom: '2px solid #d1fae5', paddingBottom: '8px' }}>Contact Details</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Phone:</span> <strong>{staff.phone}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Emergency:</span> <strong>{staff.emergency_phone || 'N/A'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Email:</span> <strong>{staff.email || 'N/A'}</strong></div>
              </div>
            </div>
          </div>

          {/* Address Info */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '14px' }}><span style={{ color: '#64748b', display: 'block', fontWeight: '600', marginBottom: '4px' }}>Present Address:</span><span style={{ color: '#1e293b', lineHeight: '1.5' }}>{staff.present_address || 'N/A'}</span></div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', fontSize: '14px' }}><span style={{ color: '#64748b', display: 'block', fontWeight: '600', marginBottom: '4px' }}>Permanent Address:</span><span style={{ color: '#1e293b', lineHeight: '1.5' }}>{staff.permanent_address || 'N/A'}</span></div>
          </div>
        </div>

        <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', position: 'sticky', bottom: 0, borderRadius: '0 0 16px 16px' }}>
          <button className="btn btn-outline" onClick={onClose} style={{ padding: '8px 20px', borderRadius: '6px', fontWeight: '600' }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// --- Main Index Component ---
export default function Index({ staff, departments, designations, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [departmentId, setDepartmentId] = useState(filters.department_id ?? '');
  const [designationId, setDesignationId] = useState(filters.designation_id ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [deletingItem, setDeletingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
  }, [flash]);

  const applyFilters = (overrides = {}) => {
    router.get(route('admin.staff.index'), {
      department_id: departmentId, designation_id: designationId, search: search, per_page: perPage, ...overrides
    }, { preserveState: true, replace: true });
  };

  // Handle Search Input clear
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if(val === '') {
      applyFilters({ search: '' });
    }
  };

  const exportToCSV = () => {
    if (!staff.data.length) return Swal.fire({ icon: 'warning', title: 'No Data!' });
    const headers = ['EMP ID', 'Name', 'Department', 'Designation', 'Phone', 'Joining Date', 'Status'];
    const rows = staff.data.map(s => [ s.staff_id_no, `${s.first_name} ${s.last_name || ''}`, s.department?.name, s.designation?.name, s.phone, s.joining_date, s.is_active ? 'Active' : 'Inactive' ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Staff_List_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const copyToClipboard = () => {
    if (!staff.data.length) return;
    let text = "EMP ID\tName\tDepartment\tDesignation\tPhone\n";
    staff.data.forEach(s => { text += `${s.staff_id_no}\t${s.first_name} ${s.last_name || ''}\t${s.department?.name}\t${s.designation?.name}\t${s.phone}\n`; });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Copied to Clipboard!', showConfirmButton: false, timer: 2000 });
  };

  const confirmDelete = () => {
    if(!deletingItem) return;
    router.delete(route('admin.staff.destroy', deletingItem.id), {
      onSuccess: () => setDeletingItem(null),
    });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="eyebrow" style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Directory</span>
            <h1 style={{ margin: '4px 0', fontSize: '24px', color: '#0f172a' }}>Staff & Teachers</h1>
            <p className="desc" style={{ margin: 0, color: '#475569', fontSize: '14px' }}>Manage all employees, teachers, and staff members.</p>
          </div>
          <div className="mm-head-actions">
            <Link href={route('admin.staff.create')} className="btn btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#4f46e5', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
              <Icon name="plus" /> Add New Staff
            </Link>
          </div>
        </div>
      }
    >
      <Head title="Staff Directory" />

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          nav, aside, header, .page-head, .no-print, button, a, select, input, .mm-head-actions, .mm-filters { display: none !important; }
          body, html { background: #fff !important; color: #000 !important; margin: 0 !important; padding: 15px !important; }
          .card, .mm-card { border: none !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; width: 100% !important; }
          .mm-table th, .mm-table td { border: 1px solid #cbd5e1 !important; padding: 8px 12px !important; font-size: 11px !important; color: #000 !important; }
          .print-only-title { display: block !important; font-size: 18px !important; font-weight: bold !important; text-align: center !important; margin-bottom: 15px !important; border-bottom: 2px solid #000; padding-bottom: 8px; }
        }
        @media screen { .print-only-title { display: none; } }
      `}} />

      <div className="print-only-title">Staff & Teachers Directory - {new Date().toLocaleDateString('en-GB')}</div>

      {/* Filters Section */}
      <div className="card mm-card no-print" style={{ marginBottom: '20px', background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <div className="mm-filters" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={perPage} onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', color: '#334155' }}>
            <option value="10">10 / Page</option><option value="20">20 / Page</option><option value="50">50 / Page</option><option value="all">Show All</option>
          </select>

          <div className="search" style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
            <input placeholder="Search ID, Name, Phone..." value={search} onChange={handleSearchChange} onKeyDown={e => e.key === 'Enter' && applyFilters()} style={{ padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', outline: 'none' }} />
            <Icon name="search" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>

          <select value={departmentId} onChange={e => setDepartmentId(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', color: '#334155' }}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>

          <select value={designationId} onChange={e => setDesignationId(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', color: '#334155' }}>
            <option value="">All Designations</option>
            {designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>

          <button className="btn btn-outline" onClick={() => applyFilters()} style={{ padding: '10px 20px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', fontWeight: '600', cursor: 'pointer' }}>Filter</button>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
          <button className="btn btn-outline" onClick={copyToClipboard} style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center', borderRadius: '6px', cursor: 'pointer', background: 'transparent', border: '1px solid #e2e8f0' }}><Icon name="copy" size="16"/> Copy Table</button>
          <button className="btn btn-outline" onClick={exportToCSV} style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center', borderRadius: '6px', cursor: 'pointer', background: 'transparent', border: '1px solid #e2e8f0' }}><Icon name="excel" size="16"/> CSV / Excel</button>
          <button className="btn btn-outline" onClick={() => window.print()} style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center', borderRadius: '6px', cursor: 'pointer', background: 'transparent', border: '1px solid #e2e8f0' }}><Icon name="print" size="16"/> Print PDF</button>
        </div>
      </div>

      {/* Table Section */}
      <div className="card mm-card" style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <div className="mm-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="mm-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '16px', color: '#475569', fontWeight: '600' }}>SL</th>
                <th style={{ padding: '16px', color: '#475569', fontWeight: '600' }}>EMP ID</th>
                <th style={{ padding: '16px', color: '#475569', fontWeight: '600' }}>Staff Profile</th>
                <th style={{ padding: '16px', color: '#475569', fontWeight: '600' }}>Department & Role</th>
                <th style={{ padding: '16px', color: '#475569', fontWeight: '600' }}>Contact</th>
                <th className="no-print" style={{ padding: '16px', textAlign: 'center', color: '#475569', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.data.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '15px' }}>কোনো স্টাফ ডেটা পাওয়া যায়নি।</td></tr>
              )}
              {staff.data.map((s, index) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '16px', color: '#64748b' }}>{(staff.current_page - 1) * staff.per_page + index + 1}</td>
                  <td style={{ padding: '16px', fontWeight: '600', color: '#0f172a' }}>{s.staff_id_no}</td>
                  <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={s.photo ? `/storage/${s.photo}` : '/images/default-avatar.png'} alt="avatar" style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                    <div>
                      <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '15px' }}>{s.first_name} {s.last_name || ''}</div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: s.is_active ? '#dcfce7' : '#fee2e2', color: s.is_active ? '#166534' : '#991b1b', fontWeight: '500' }}>
                          {s.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {/* User Account Indicator Badge */}
                        {s.user_id && (
                           <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: '#e0e7ff', color: '#3730a3', fontWeight: '500' }} title="Has Portal Access">
                             Portal Access
                           </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '600', color: '#3730a3', fontSize: '14px' }}>{s.designation?.name}</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{s.department?.name}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ color: '#1e293b', fontSize: '14px', fontWeight: '500' }}>{s.phone}</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{s.email || 'N/A'}</div>
                  </td>
                  <td className="no-print" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                      <button onClick={() => setViewingItem(s)} style={{ padding: '8px', color: '#4f46e5', background: '#e0e7ff', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'transform 0.1s' }} title="View Profile">
                        <Icon name="eye" size="18" />
                      </button>
                      <Link href={route('admin.staff.edit', s.id)} style={{ padding: '8px', color: '#0284c7', background: '#e0f2fe', borderRadius: '8px', display: 'flex', alignItems: 'center' }} title="Edit Staff">
                        <Icon name="edit" size="18" />
                      </Link>
                      <button onClick={() => setDeletingItem(s)} style={{ padding: '8px', color: '#e11d48', background: '#ffe4e6', border: 'none', borderRadius: '8px', cursor: 'pointer' }} title="Delete Staff">
                        <Icon name="trash" size="18" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="no-print" style={{ padding: '20px', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
          <Pagination meta={staff} />
        </div>
      </div>

      {viewingItem && <StaffViewModal staff={viewingItem} onClose={() => setViewingItem(null)} />}

      {deletingItem && (
        <ConfirmDeleteModal
          item={deletingItem}
          message={deletingItem.user_id ? "Are you sure? This will also permanently delete their User Account (Portal Access)." : "Are you sure you want to delete this staff record?"}
          onCancel={() => setDeletingItem(null)}
          onConfirm={confirmDelete}
        />
      )}
    </AuthenticatedLayout>
  );
}
