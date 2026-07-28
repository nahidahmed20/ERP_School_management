import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import AdmissionFormModal from './Partials/AdmissionFormModal';
import StatusUpdateModal from './Partials/StatusUpdateModal';
import Swal from 'sweetalert2';

export default function Index({ admissions, classes, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [classId, setClassId] = useState(filters.class_id ?? '');
  const [status, setStatus] = useState(filters.status ?? '');

  const [formOpen, setFormOpen] = useState(false);
  const [statusItem, setStatusItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
    }
    if (flash?.error) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000 });
    }
  }, [flash]);

  const applyFilters = () => {
    router.get(route('admin.students.admissions.index'), { search, class_id: classId, status }, { preserveState: true });
  };

  const getStatusColor = (s) => {
    if (s === 'Approved') return { bg: '#dcfce7', text: '#15803d' };
    if (s === 'Rejected') return { bg: '#fee2e2', text: '#b91c1c' };
    return { bg: '#fef3c7', text: '#d97706' }; // Pending
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Students</span>
            <h1>Admission Applications</h1>
            <p className="desc">নতুন শিক্ষার্থীদের ভর্তির আবেদন এবং ইনকোয়ারি পরিচালনা করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => router.get(route('admin.students.create'))}>
                <Icon name="plus" /> New Admission
            </button>
            </div>
        </div>
      }
    >
      <Head title="Admissions" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>

          <select value={classId} onChange={(e) => { setClassId(e.target.value); applyFilters(); }}>
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select value={status} onChange={(e) => { setStatus(e.target.value); applyFilters(); }}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Applicant Name</th>
                <th>Applied Class</th>
                <th>Guardian & Contact</th>
                <th>Apply Date</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admissions.data.length === 0 && (
                <tr><td colSpan={6} className="mm-empty">কোনো আবেদন পাওয়া যায়নি।</td></tr>
              )}
              {admissions.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong style={{ color: '#111827' }}>{item.first_name} {item.last_name}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>DOB: {item.date_of_birth} ({item.gender})</div>
                  </td>
                  <td><span className="badge">{item.school_class?.name}</span></td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{item.guardian_name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}><Icon name="phone" style={{fontSize: '10px'}}/> {item.phone}</div>
                  </td>
                  <td>{item.application_date}</td>
                  <td>
                    <span style={{ 
                        backgroundColor: getStatusColor(item.status).bg, 
                        color: getStatusColor(item.status).text,
                        padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" title="Update Status" onClick={() => setStatusItem(item)}>
                        <Icon name="check-circle" />
                      </button>
                      <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => {
                        if(confirm('আবেদনটি মুছে ফেলতে চান?')) router.delete(route('admin.students.admissions.destroy', item.id));
                      }}>
                        <Icon name="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={admissions} />
      </div>

      {formOpen && <AdmissionFormModal classes={classes} onClose={() => setFormOpen(false)} />}
      
      {/* এখানে classes={classes} পাস করা হয়েছে */}
      {statusItem && <StatusUpdateModal item={statusItem} classes={classes} onClose={() => setStatusItem(null)} />}
      
    </AuthenticatedLayout>
  );
}