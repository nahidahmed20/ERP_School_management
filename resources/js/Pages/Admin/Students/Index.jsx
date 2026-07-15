import { useState, useEffect } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

function StudentViewModal({ student, onClose }) {
  if (!student) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()} style={{
        background: '#fff',
        borderRadius: '16px',
        width: '95%',
        maxWidth: '1150px',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div className="mm-modal-head" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid #f1f5f9',
          background: '#f8fafc',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="user" style={{ color: '#4f46e5' }} /> Complete Student Profile
          </h3>
          <button className="icon-btn" onClick={onClose} style={{
            background: '#cbd5e1',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}>
            <Icon name="close" />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Profile Summary Badge */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: '#e0e7ff',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.25rem',
              fontWeight: '700',
              overflow: 'hidden',
              border: '3px solid #fff',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              {student.photo ? (
                <img 
                  src={`/storage/${student.photo}`} 
                  alt={`${student.first_name}'s Photo`} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                student.first_name ? student.first_name[0].toUpperCase() : 'S'
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>
                {student.first_name} {student.last_name}
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: '#475569' }}>
                <span><strong>Admission No:</strong> <span style={{ color: '#4f46e5', fontWeight: '600' }}>{student.admission_no}</span></span>
                <span>•</span>
                <span><strong>Admission Date:</strong> {student.admission_date ?? 'N/A'}</span>
                <span>•</span>
                <span><strong>Campus:</strong> {student.campus?.name ?? 'Main Campus'}</span>
              </div>
            </div>
          </div>

          {/* Details Grid: Academic, Personal & Guardian */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            
            {/* 1. Academic Information */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700', color: '#4f46e5', borderBottom: '2px solid #e0e7ff', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon name="book" style={{ fontSize: '16px' }} /> Academic Details
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Class:</span> <strong>{student.current_enrollment?.school_class?.name ?? 'N/A'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Section:</span> <strong>{student.current_enrollment?.section?.name ?? 'N/A'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Roll No:</span> <strong>{student.current_enrollment?.roll_no ?? 'N/A'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Category:</span> <strong>{student.category?.name || 'General'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>House:</span> <strong>{student.house?.name || 'N/A'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Current Session:</span> <strong style={{ color: '#0369a1' }}>{student.current_enrollment?.academic_session?.name ?? 'Active Session'}</strong></div>
              </div>
            </div>

            {/* 2. Personal Information */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700', color: '#0ea5e9', borderBottom: '2px solid #e0f2fe', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon name="user" style={{ fontSize: '16px' }} /> Personal Details
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Date of Birth:</span> <strong>{student.date_of_birth ?? 'N/A'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Gender:</span> <strong style={{ textTransform: 'capitalize' }}>{student.gender ?? 'N/A'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Blood Group:</span> <strong style={{ color: '#be123c' }}>{student.blood_group || 'N/A'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Religion / Nat:</span> <strong>{student.religion ?? 'N/A'} ({student.nationality ?? 'N/A'})</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Birth Cert No:</span> <strong>{student.birth_certificate_no || 'N/A'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>National ID:</span> <strong>{student.national_id || 'N/A'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Mother Tongue:</span> <strong>{student.mother_tongue || 'N/A'}</strong></div>
              </div>
            </div>

            {/* 3. Contact & Guardian Details */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700', color: '#f59e0b', borderBottom: '2px solid #fef3c7', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon name="phone" style={{ fontSize: '16px' }} /> Contact & Guardian
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Student's Phone:</span> <strong>{student.phone || 'N/A'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Student's Email:</span> <strong>{student.email || 'N/A'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Father's Name:</span> <strong>{student.guardian?.father_name ?? 'N/A'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Father's Phone:</span> <strong>{student.guardian?.father_phone ?? 'N/A'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Mother's Name:</span> <strong>{student.guardian?.mother_name ?? 'N/A'}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>Guardian Email:</span> <strong>{student.guardian?.guardian_email || 'N/A'}</strong></div>
              </div>
            </div>

          </div>

          {/* Full-width Details Section (Addresses & Medical) */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '14px' }}>
              <span style={{ color: '#64748b', display: 'block', fontWeight: '600', marginBottom: '4px' }}>Present Address:</span>
              <strong style={{ color: '#1e293b' }}>{student.present_address ?? 'N/A'}</strong>
            </div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', fontSize: '14px' }}>
              <span style={{ color: '#64748b', display: 'block', fontWeight: '600', marginBottom: '4px' }}>Permanent Address:</span>
              <strong style={{ color: '#1e293b' }}>{student.permanent_address ?? 'N/A'}</strong>
            </div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', fontSize: '14px' }}>
              <span style={{ color: '#64748b', display: 'block', fontWeight: '600', marginBottom: '4px' }}>Previous School Details:</span>
              <strong style={{ color: '#1e293b' }}>{student.previous_school_details || 'N/A'}</strong>
            </div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', fontSize: '14px' }}>
              <span style={{ color: '#ef4444', display: 'block', fontWeight: '600', marginBottom: '4px' }}>Medical History & Allergies:</span>
              <strong style={{ color: '#1e293b' }}>{student.medical_history || 'None / Not Provided'}</strong>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
          <button className="btn btn-outline" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '6px', fontWeight: '600' }}>Close Portal</button>
        </div>
      </div>
    </div>
  );
}

export default function Index({ students, classes, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [classId, setClassId] = useState(filters.class_id ?? '');
  const [sectionId, setSectionId] = useState(filters.section_id ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');
  
  const [deletingItem, setDeletingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  const selectedClass = classes.find(c => c.id == classId);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000, timerProgressBar: true });
    }
    if (flash?.error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000, timerProgressBar: true });
    }
  }, [flash]);

  const applyFilters = (overrides = {}) => {
    router.get(route('admin.students.index'), {
      class_id: classId,
      section_id: sectionId,
      search: search,
      per_page: perPage,
      ...overrides
    }, { preserveState: true, replace: true });
  };

  const exportToCSV = () => {
    if (!students.data.length) {
      Swal.fire({ icon: 'warning', title: 'No Data!', text: 'Export করার মতো কোনো ডেটা নেই।' });
      return;
    }
    // Updated Headers: Added Category and House, kept Campus
    const headers = ['Admission No', 'Student Name', 'Category', 'House', 'Campus', 'Class', 'Section', 'Roll', 'Father Name', 'Phone'];
    const rows = students.data.map(student => [
      student.admission_no,
      `${student.first_name} ${student.last_name || ''}`,
      student.category?.name || 'General',
      student.house?.name || 'N/A',
      student.campus?.name ?? '',
      student.current_enrollment?.school_class?.name ?? '',
      student.current_enrollment?.section?.name ?? '',
      student.current_enrollment?.roll_no ?? '',
      student.guardian?.father_name ?? '',
      student.guardian?.father_phone ?? ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Students_List_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
    if (!students.data.length) return;
    // Updated Headers: Added Category, House and Campus to clipboard
    let text = "Admission No\tStudent Name\tCategory\tHouse\tCampus\tClass\tRoll\tFather's Name\tPhone\n";
    students.data.forEach(student => {
      text += `${student.admission_no}\t${student.first_name} ${student.last_name || ''}\t${student.category?.name || 'General'}\t${student.house?.name || 'N/A'}\t${student.campus?.name ?? ''}\t${student.current_enrollment?.school_class?.name ?? ''}\t${student.current_enrollment?.roll_no ?? ''}\t${student.guardian?.father_name ?? ''}\t${student.guardian?.father_phone ?? ''}\n`;
    });
    navigator.clipboard.writeText(text);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'টেবিল ডেটা ক্লিপবোর্ডে কপি হয়েছে!', showConfirmButton: false, timer: 2000 });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="eyebrow">Directory</span>
            <h1>Students Directory</h1>
            <p className="desc">শিক্ষার্থীদের ভর্তি, ফিল্টারিং ও একাডেমিক সেশন পরিচালনা করুন।</p>
          </div>
          <div className="mm-head-actions">
            <Link href={route('admin.students.create')} className="btn" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Icon name="plus" /> New Admission
            </Link>
          </div>
        </div>
      }
    >
      <Head title="Students Directory" />

      {/* Adding Print-specific styles directly in the component */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Hide sidebar, navigation, filters, buttons and pagination */
          nav, aside, header, .page-head, .no-print, button, a, select, input, .mm-head-actions, .mm-filters {
            display: none !important;
          }
          /* Reset page margins and background colors for clean look */
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
          /* Style table for optimal paper print */
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
          /* Show a clean title only when printing */
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
        Students Directory - {new Date().toLocaleDateString('en-GB')}
      </div>

      {/* Filter Card marked with 'no-print' class */}
      <div className="card mm-card no-print" style={{ marginBottom: '20px', background: '#fff', padding: '20px', borderRadius: '12px' }}>
        <div className="mm-filters" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Per Page dropdown */}
          <select 
            value={perPage} 
            onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }} 
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minWidth: '110px', background: '#fff' }}
          >
            <option value="10">10 / Page</option>
            <option value="20">20 / Page</option>
            <option value="50">50 / Page</option>
            <option value="100">100 / Page</option>
            <option value="500">500 / Page</option>
            <option value="1000">1000 / Page</option>
            <option value="all">Show All</option>
          </select>

          {/* Search Field */}
          <div className="search" style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <input
              placeholder="Search by Admission No, Name, Phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              style={{ padding: '10px 10px 10px 35px', borderRadius: '6px', border: '1px solid #ddd', width: '100%' }}
            />
            <Icon name="search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>

          {/* Class selector */}
          <select 
            value={classId} 
            onChange={e => { setClassId(e.target.value); setSectionId(''); }} 
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minWidth: '150px' }}
          >
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {/* Section selector */}
          <select 
            value={sectionId} 
            onChange={e => setSectionId(e.target.value)} 
            disabled={!classId} 
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minWidth: '150px' }}
          >
            <option value="">All Sections</option>
            {selectedClass?.sections?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <button className="btn btn-outline" onClick={() => applyFilters()} style={{ padding: '10px 20px', borderRadius: '6px' }}>
            Filter
          </button>
        </div>

        {/* Export Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', display: 'flex', alignItems: 'center', marginRight: '8px' }}>
            Export Options:
          </span>
          <button className="btn btn-outline" onClick={copyToClipboard} style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="copy" /> Copy Table
          </button>
          <button className="btn btn-outline" onClick={exportToCSV} style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="excel" /> CSV
          </button>
          <button className="btn btn-outline" onClick={exportToCSV} style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="excel" /> Excel
          </button>
          <button className="btn btn-outline" onClick={handlePrint} style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                <th style={{ padding: '15px' }}>Admission No</th>
                <th style={{ padding: '15px' }}>Student Name</th>
                <th style={{ padding: '15px' }}>Campus</th>
                <th style={{ padding: '15px' }}>Class (Sec) & Roll</th>
                <th style={{ padding: '15px' }}>Guardian Info</th>
                <th className="no-print" style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.data.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                    কোনো স্টুডেন্ট পাওয়া যায়নি।
                  </td>
                </tr>
              )}
              {students.data.map((student, index) => (
                <tr key={student.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background-color 0.2s' }}>
                 <td>{index+1}</td>
                  <td style={{ padding: '15px' }}><strong>{student.admission_no}</strong></td>
                  <td style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img 
                        src={student.photo ? `/storage/${student.photo}` : '/images/default-avatar.png'} 
                        alt="Student" 
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                    />
                    {student.first_name} {student.last_name || ''}
                </td>
                  <td style={{ padding: '15px' }}>{student.campus?.name ?? 'Main Campus'}</td>
                  <td style={{ padding: '15px' }}>
                    {student.current_enrollment ? (
                      <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                        {student.current_enrollment.school_class?.name} ({student.current_enrollment.section?.name}) - Roll: {student.current_enrollment.roll_no || 'N/A'}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not Enrolled</span>
                    )}
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontWeight: '500' }}>{student.guardian?.father_name ?? 'N/A'}</div>
                    <small style={{ color: '#64748b' }}>{student.guardian?.father_phone ?? ''}</small>
                  </td>
                  <td className="no-print" style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {/* View Details Button */}
                      <button 
                        onClick={() => setViewingItem(student)} 
                        title="View Details" 
                        style={{ padding: '6px', color: '#4f46e5', background: '#f5f3ff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        <Icon name="eye" />
                      </button>
                      
                      {/* Edit Button */}
                      <Link 
                        href={route('admin.students.edit', student.id)} 
                        title="Edit Student"
                        style={{ padding: '6px', color: '#3b82f6', background: '#eff6ff', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                      >
                        <Icon name="edit" />
                      </Link>

                      {/* Delete Button */}
                      <button 
                        onClick={() => setDeletingItem(student)} 
                        title="Delete Student"
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
          <Pagination meta={students} />
        </div>
      </div>

      {/* Modals */}
      {viewingItem && (
        <StudentViewModal student={viewingItem} onClose={() => setViewingItem(null)} />
      )}

      {deletingItem && (
        <ConfirmDeleteModal 
          item={deletingItem} 
          onCancel={() => setDeletingItem(null)} 
          onConfirm={() => { 
            router.delete(route('admin.students.destroy', deletingItem.id), { 
              onSuccess: () => setDeletingItem(null) 
            }); 
          }} 
        />
      )}
    </AuthenticatedLayout>
  );
}