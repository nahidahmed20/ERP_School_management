import { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

// --- View Details Modal ---
function ViewLeaveModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="mm-modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '500px', background: '#fff', borderRadius: '12px' }}>
        <div className="mm-modal-head" style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Leave Details</h3>
          <button type="button" className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <small style={{ color: '#64748b', fontWeight: 'bold' }}>Staff Name</small>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>{item.staff?.first_name} {item.staff?.last_name || ''}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>ID: {item.staff?.staff_id_no}</div>
            </div>
            <div>
              <small style={{ color: '#64748b', fontWeight: 'bold' }}>Leave Type</small>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>{item.leave_type?.name}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f1f5f9', padding: '12px', borderRadius: '8px' }}>
            <div>
              <small style={{ color: '#64748b', fontWeight: 'bold' }}>Start Date</small>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.start_date}</div>
            </div>
            <div>
              <small style={{ color: '#64748b', fontWeight: 'bold' }}>End Date</small>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.end_date}</div>
            </div>
          </div>

          <div>
            <small style={{ color: '#64748b', fontWeight: 'bold' }}>Reason</small>
            <div style={{ fontSize: '14px', background: '#fffbeb', padding: '12px', borderRadius: '8px', border: '1px solid #fef3c7', marginTop: '4px' }}>
              {item.reason}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <small style={{ color: '#64748b', fontWeight: 'bold', display: 'block' }}>Status</small>
              <span style={{
                background: item.status?.toLowerCase() === 'approved' ? '#dcfce7' : item.status?.toLowerCase() === 'rejected' ? '#fef2f2' : '#fef9c3',
                color: item.status?.toLowerCase() === 'approved' ? '#16a34a' : item.status?.toLowerCase() === 'rejected' ? '#dc2626' : '#ca8a04',
                padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'capitalize'
              }}>
                {item.status}
              </span>
            </div>
            {item.attachment && (
              <div>
                <a href={`/storage/${item.attachment}`} target="_blank" rel="noreferrer" style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>
                  View Attachment
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Form Modal Component ---
function LeaveFormModal({ item, staffs, leaveTypes, onClose, isSuperAdmin }) {
  const isEdit = !!item;

  const { data, setData, post, processing, errors, reset } = useForm({
    _method: isEdit ? 'PUT' : 'POST',
    staff_id: item?.staff_id ?? '',
    leave_type_id: item?.leave_type_id ?? '',
    start_date: item?.start_date ?? '',
    end_date: item?.end_date ?? '',
    reason: item?.reason ?? '',
    status: item?.status ?? 'pending',
    attachment: null,
  });

  const submit = (e) => {
    e.preventDefault();
    const routeName = isEdit ? route('admin.staff-leaves.update', item.id) : route('admin.staff-leaves.store');
    post(routeName, { forceFormData: true, onSuccess: () => { reset(); onClose(); } });
  };

  return (
    <div className="mm-modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px', background: '#fff', borderRadius: '12px' }}>
        <div className="mm-modal-head" style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>{isEdit ? 'Edit Leave Application' : 'Add Leave Application'}</h3>
          <button type="button" className="icon-btn" onClick={onClose}><Icon name="close" /></button>
        </div>

        <form onSubmit={submit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Select Staff <span style={{color: 'red'}}>*</span></label>
              <select value={data.staff_id} onChange={e => setData('staff_id', e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="">-- Choose Staff --</option>
                {staffs.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name || ''} ({s.staff_id_no})</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Leave Type <span style={{color: 'red'}}>*</span></label>
              <select value={data.leave_type_id} onChange={e => setData('leave_type_id', e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="">-- Choose Type --</option>
                {leaveTypes.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Start Date <span style={{color: 'red'}}>*</span></label>
              <input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>End Date <span style={{color: 'red'}}>*</span></label>
              <input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Reason / Note <span style={{color: 'red'}}>*</span></label>
            <textarea value={data.reason} onChange={e => setData('reason', e.target.value)} required rows="3" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {isSuperAdmin && (
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Status</label>
                <select value={data.status} onChange={e => setData('status', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Attachment</label>
              <input type="file" onChange={e => setData('attachment', e.target.files[0])} accept=".jpg,.png,.jpeg,.pdf" style={{ width: '100%', padding: '7px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: '#f1f5f9', borderRadius: '8px', fontWeight: '600' }} disabled={processing}>Cancel</button>
            <button type="submit" style={{ padding: '10px 24px', background: '#4f46e5', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: processing ? 'not-allowed' : 'pointer' }} disabled={processing}>Save Leave</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Index Component ---
export default function Index({ staffLeaves, staffs, leaveTypes, filters }) {
  const { auth, flash } = usePage().props;
  const isSuperAdmin = auth?.user?.roles?.includes('Super Admin') || auth?.user?.role === 'Super Admin';

  const [search, setSearch] = useState(filters.search ?? '');
  const [status, setStatus] = useState(filters.status ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [formOpen, setFormOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000 });
  }, [flash]);

  const applyFilters = (overrides = {}) => {
    router.get(route('admin.staff-leaves.index'), {
      search: search, status: status, per_page: perPage, ...overrides
    }, { preserveState: true, replace: true });
  };

  const handleQuickStatus = (leave, newStatus) => {
    const actionText = newStatus === 'approved' ? 'Approve' : 'Reject';
    const color = newStatus === 'approved' ? '#16a34a' : '#dc2626';

    Swal.fire({
      title: `Are you sure?`,
      text: `Do you want to ${actionText} this leave?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: color,
      cancelButtonColor: '#64748b',
      confirmButtonText: `Yes, ${actionText}`
    }).then((result) => {
      if (result.isConfirmed) {
        setLoadingId(leave.id);

        router.put(route('admin.staff-leaves.update', leave.id), {
          _method: 'PUT',
          staff_id: leave.staff_id,
          leave_type_id: leave.leave_type_id,
          start_date: leave.start_date,
          end_date: leave.end_date,
          reason: leave.reason,
          status: newStatus
        }, {
          preserveScroll: true,
          onFinish: () => setLoadingId(null)
        });
      }
    });
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === 'approved') return <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>Approved</span>;
    if (s === 'rejected') return <span style={{ background: '#fef2f2', color: '#dc2626', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>Rejected</span>;
    return <span style={{ background: '#fef9c3', color: '#ca8a04', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>Pending</span>;
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="eyebrow">HR & Administration</span>
            <h1>Leave Applications</h1>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Icon name="plus" /> Add Leave
            </button>
          </div>
        </div>
      }
    >
      <Head title="Staff Leaves" />

      {/* Filters Section */}
      <div className="card mm-card" style={{ marginBottom: '20px', background: '#fff', padding: '20px', borderRadius: '12px' }}>
        <div className="mm-filters" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={perPage} onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
            <option value="10">10 / Page</option><option value="20">20 / Page</option>
          </select>
          <div className="search" style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <input placeholder="Search Staff..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyFilters()} style={{ padding: '10px 10px 10px 35px', borderRadius: '6px', border: '1px solid #ddd', width: '100%' }} />
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="btn btn-outline" onClick={() => applyFilters()} style={{ padding: '10px 20px', borderRadius: '6px' }}>Filter</button>
        </div>
      </div>

      {/* Table Section */}
      <div className="card mm-card" style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
        <div className="mm-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="mm-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '15px' }}>Date</th>
                <th style={{ padding: '15px' }}>Staff Name</th>
                <th style={{ padding: '15px' }}>Leave Type</th>
                <th style={{ padding: '15px' }}>Status</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffLeaves.data.map(leave => {
                const currentStatus = leave.status?.toLowerCase();
                const isPending = currentStatus === 'pending' || !currentStatus;

                return (
                  <tr key={leave.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '15px', fontSize: '13px' }}>
                      <div style={{ fontWeight: '600' }}>{leave.start_date}</div>
                      <div style={{ color: '#64748b' }}>to {leave.end_date}</div>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: 'bold' }}>{leave.staff?.first_name} {leave.staff?.last_name || ''}</div>
                    </td>
                    <td style={{ padding: '15px', fontWeight: '500' }}>{leave.leave_type?.name}</td>
                    <td style={{ padding: '15px' }}>{getStatusBadge(leave.status)}</td>

                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>

                        {/* View Button */}
                        <button title="View Details" onClick={() => setViewingItem(leave)} style={{ padding: '6px', color: '#10b981', background: '#d1fae5', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                          <Icon name="eye" />
                        </button>

                          <>
                            <button
                              title="Approve"
                              disabled={loadingId === leave.id}
                              onClick={() => handleQuickStatus(leave, 'approved')}
                              style={{ padding: '6px', color: '#fff', background: '#16a34a', border: 'none', borderRadius: '6px', cursor: loadingId === leave.id ? 'not-allowed' : 'pointer', opacity: loadingId === leave.id ? 0.5 : 1 }}
                            >
                              {loadingId === leave.id ? '...' : <Icon name="check" />}
                            </button>
                            <button
                              title="Reject"
                              disabled={loadingId === leave.id}
                              onClick={() => handleQuickStatus(leave, 'rejected')}
                              style={{ padding: '6px', color: '#fff', background: '#dc2626', border: 'none', borderRadius: '6px', cursor: loadingId === leave.id ? 'not-allowed' : 'pointer', opacity: loadingId === leave.id ? 0.5 : 1 }}
                            >
                              {loadingId === leave.id ? '...' : <Icon name="close" />}
                            </button>
                          </>


                        {/* Edit & Delete */}
                        <button onClick={() => { setEditingItem(leave); setFormOpen(true); }} style={{ padding: '6px', color: '#3b82f6', background: '#eff6ff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Icon name="edit" /></button>
                        <button onClick={() => setDeletingItem(leave)} style={{ padding: '6px', color: '#ef4444', background: '#fef2f2', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Icon name="trash" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9' }}>
          <Pagination meta={staffLeaves} />
        </div>
      </div>

      {/* Modals */}
      {viewingItem && <ViewLeaveModal item={viewingItem} onClose={() => setViewingItem(null)} />}
      {formOpen && <LeaveFormModal item={editingItem} staffs={staffs} leaveTypes={leaveTypes} isSuperAdmin={isSuperAdmin} onClose={() => setFormOpen(false)} />}
      {deletingItem && <ConfirmDeleteModal item={deletingItem} onCancel={() => setDeletingItem(null)} onConfirm={() => { router.delete(route('admin.staff-leaves.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) }); }} />}
    </AuthenticatedLayout>
  );
}
