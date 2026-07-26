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
    if (val === '') {
      applyFilters({ search: '' });
    }
  };

  const exportToCSV = () => {
    if (!staff.data.length) {
      Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
      return;
    }
    const headers = ['EMP ID', 'Name', 'Department', 'Designation', 'Phone', 'Joining Date', 'Status'];
    const rows = staff.data.map(s => [
      s.staff_id_no,
      `${s.first_name} ${s.last_name || ''}`,
      s.department?.name,
      s.designation?.name,
      s.phone,
      s.joining_date,
      s.is_active ? 'Active' : 'Inactive'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Staff_List_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!staff.data.length) return;
    let text = "EMP ID\tName\tDepartment\tDesignation\tPhone\n";
    staff.data.forEach(s => { text += `${s.staff_id_no}\t${s.first_name} ${s.last_name || ''}\t${s.department?.name}\t${s.designation?.name}\t${s.phone}\n`; });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'টেবিল ডেটা ক্লিপবোর্ডে কপি হয়েছে!', showConfirmButton: false, timer: 2000 });
  };

  const handlePrint = () => {
    window.print();
  };

  const confirmDelete = () => {
    if (!deletingItem) return;
    router.delete(route('admin.staff.destroy', deletingItem.id), {
      onSuccess: () => setDeletingItem(null),
    });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="eyebrow">Directory</span>
            <h1>Staff &amp; Teachers Directory</h1>
            <p className="desc">কর্মচারী, শিক্ষক ও স্টাফদের তথ্য, ফিল্টারিং ও পোর্টাল অ্যাক্সেস পরিচালনা করুন।</p>
          </div>
          <div className="mm-head-actions">
            <Link href={route('admin.staff.create')} className="btn" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Icon name="plus" /> Add New Staff
            </Link>
          </div>
        </div>
      }
    >
      <Head title="Staff Directory" />

      {/* Print-specific styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          nav, aside, header, .page-head, .no-print, button, a, select, input, .mm-head-actions, .mm-filters {
            display: none !important;
          }
          body, html {
            background: #fff !important;
            color: #000 !important;
            margin: 0 !important;
            padding: 15px !important;
          }
          .card, .mm-card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          .mm-table-wrap {
            overflow: visible !important;
          }
          .mm-table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          .mm-table th, .mm-table td {
            border: 1px solid #cbd5e1 !important;
            padding: 8px 12px !important;
            font-size: 11px !important;
            color: #000 !important;
          }
          .mm-table th {
            background-color: #f1f5f9 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-only-title {
            display: block !important;
            font-size: 18px !important;
            font-weight: bold !important;
            text-align: center !important;
            margin-bottom: 15px !important;
            border-bottom: 2px solid #000;
            padding-bottom: 8px;
          }
        }
        @media screen {
          .print-only-title {
            display: none;
          }
        }
      `}} />

      {/* Print Only Header */}
      <div className="print-only-title">
        Staff & Teachers Directory - {new Date().toLocaleDateString('en-GB')}
      </div>

      <style>{`
        .stf-toolbar-scope {
          --stf-ink: #16213A; --stf-ink-soft: #56647B; --stf-forest: #21402F; --stf-forest-dark: #142720;
          --stf-brass: #AD7F35; --stf-brass-soft: #F1E4C8; --stf-mist: #EEF1EA; --stf-paper: #FFFFFF;
          --stf-line: #DCE2D8;
          --stf-font-display: 'Fraunces', Georgia, serif; --stf-font-body: 'Public Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          --stf-font-mono: 'JetBrains Mono', ui-monospace, monospace;
          font-family: var(--stf-font-body);
        }
        .stf-toolbar-scope *, .stf-toolbar-scope *::before, .stf-toolbar-scope *::after { box-sizing: border-box; }

        .stf-toolbar-card { background: var(--stf-paper); border: 1px solid var(--stf-line); border-radius: 14px; padding: 22px 24px; margin-bottom: 24px; }

        .stf-toolbar-filters { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }

        .stf-toolbar-select { padding: 10px 14px; border-radius: 8px; border: 1.5px solid var(--stf-line); min-width: 150px; background: #fff; font-family: var(--stf-font-body); font-size: 14px; color: var(--stf-ink); outline: none; transition: border-color .15s, box-shadow .15s; }
        .stf-toolbar-select:focus { border-color: var(--stf-brass); box-shadow: 0 0 0 3px rgba(173,127,53,.16); }
        .stf-toolbar-select:disabled { opacity: .55; cursor: not-allowed; }
        .stf-toolbar-select.mono { font-family: var(--stf-font-mono); }

        .stf-search-wrap { position: relative; flex: 1; min-width: 220px; }
        .stf-search-wrap input { width: 100%; padding: 10px 14px 10px 38px; border-radius: 8px; border: 1.5px solid var(--stf-line); font-size: 14px; font-family: var(--stf-font-body); color: var(--stf-ink); outline: none; transition: border-color .15s, box-shadow .15s; }
        .stf-search-wrap input:focus { border-color: var(--stf-brass); box-shadow: 0 0 0 3px rgba(173,127,53,.16); }
        .stf-search-wrap .stf-search-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: var(--stf-ink-soft); }

        .stf-filter-btn { padding: 10px 22px; border-radius: 8px; border: none; background: var(--stf-forest); color: #fff; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background .15s, transform .15s; }
        .stf-filter-btn:hover { background: var(--stf-forest-dark); transform: translateY(-1px); }

        .stf-export-row { display: flex; gap: 8px; margin-top: 18px; border-top: 1px solid var(--stf-line); padding-top: 16px; flex-wrap: wrap; align-items: center; }
        .stf-export-label { font-family: var(--stf-font-mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--stf-brass); font-weight: 600; margin-right: 6px; display: flex; align-items: center; gap: 6px; }
        .stf-export-label::before { content: ''; width: 14px; height: 1px; background: var(--stf-brass); display: inline-block; }
        .stf-export-btn { padding: 8px 14px; font-size: 13px; display: flex; align-items: center; gap: 7px; border-radius: 8px; border: 1.5px solid var(--stf-line); background: #fff; color: var(--stf-forest-dark); font-weight: 600; cursor: pointer; transition: all .15s; }
        .stf-export-btn:hover { border-color: var(--stf-brass); background: var(--stf-brass-soft); }
      `}</style>

      {/* Filter Card marked with 'no-print' class */}
      <div className="card mm-card no-print stf-toolbar-scope stf-toolbar-card">
        <div className="mm-filters stf-toolbar-filters">

          {/* Per Page dropdown */}
          <select
            value={perPage}
            onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }}
            className="stf-toolbar-select mono"
          >
            <option value="10">10 / Page</option>
            <option value="20">20 / Page</option>
            <option value="50">50 / Page</option>
            <option value="all">Show All</option>
          </select>

          {/* Search Field */}
          <div className="search stf-search-wrap">
            <input
              placeholder="Search ID, Name, Phone..."
              value={search}
              onChange={handleSearchChange}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
            />
            <Icon name="search" className="stf-search-icon" />
          </div>

          {/* Department selector */}
          <select
            value={departmentId}
            onChange={e => setDepartmentId(e.target.value)}
            className="stf-toolbar-select"
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>

          {/* Designation selector */}
          <select
            value={designationId}
            onChange={e => setDesignationId(e.target.value)}
            className="stf-toolbar-select"
          >
            <option value="">All Designations</option>
            {designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>

          <button className="btn btn-outline stf-filter-btn" onClick={() => applyFilters()}>
            Filter
          </button>
        </div>

        {/* Export Buttons */}
        <div className="stf-export-row">
          <span className="stf-export-label">Export</span>
          <button className="btn btn-outline stf-export-btn" onClick={copyToClipboard}>
            <Icon name="copy" /> Copy Table
          </button>
          <button className="btn btn-outline stf-export-btn" onClick={exportToCSV}>
            <Icon name="excel" /> CSV / Excel
          </button>
          <button className="btn btn-outline stf-export-btn" onClick={handlePrint}>
            <Icon name="print" /> PDF / Print
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="card mm-card" style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
        <div className="mm-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="mm-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '15px' }}>SL</th>
                <th style={{ padding: '15px' }}>EMP ID</th>
                <th style={{ padding: '15px' }}>Staff Profile</th>
                <th style={{ padding: '15px' }}>Department &amp; Role</th>
                <th style={{ padding: '15px' }}>Contact</th>
                <th className="no-print" style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.data.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                    কোনো স্টাফ ডেটা পাওয়া যায়নি।
                  </td>
                </tr>
              )}
              {staff.data.map((s, index) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '15px' }}>{(staff.current_page - 1) * staff.per_page + index + 1}</td>
                  <td style={{ padding: '15px' }}><strong>{s.staff_id_no}</strong></td>
                  <td style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={s.photo ? `/storage/${s.photo}` : '/images/default-avatar.png'}
                      alt="Staff"
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      {s.first_name} {s.last_name || ''}
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: s.is_active ? '#dcfce7' : '#fee2e2', color: s.is_active ? '#166534' : '#991b1b', fontWeight: '500' }}>
                          {s.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {s.user_id && (
                          <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: '#e0e7ff', color: '#3730a3', fontWeight: '500' }} title="Has Portal Access">
                            Portal Access
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontWeight: '500' }}>{s.designation?.name}</div>
                    <small style={{ color: '#64748b' }}>{s.department?.name}</small>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontWeight: '500' }}>{s.phone}</div>
                    <small style={{ color: '#64748b' }}>{s.email || 'N/A'}</small>
                  </td>
                  <td className="no-print" style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {/* View Details Button */}
                      <button
                        onClick={() => setViewingItem(s)}
                        title="View Profile"
                        style={{ padding: '6px', color: '#4f46e5', background: '#f5f3ff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        <Icon name="eye" />
                      </button>

                      {/* Edit Button */}
                      <Link
                        href={route('admin.staff.edit', s.id)}
                        title="Edit Staff"
                        style={{ padding: '6px', color: '#3b82f6', background: '#eff6ff', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                      >
                        <Icon name="edit" />
                      </Link>

                      {/* Delete Button */}
                      <button
                        onClick={() => setDeletingItem(s)}
                        title="Delete Staff"
                        style={{ padding: '6px', color: '#ef4444', background: '#fef2f2', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        <Icon name="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="no-print" style={{ padding: '20px', borderTop: '1px solid #f1f5f9' }}>
          <Pagination meta={staff} />
        </div>
      </div>

      {/* Modals */}
      {viewingItem && (
        <StaffViewModal staff={viewingItem} onClose={() => setViewingItem(null)} />
      )}

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