import { useState, useEffect } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

// --- View Modal Component ---
function PayrollViewModal({ item, onClose }) {
  if (!item) return null;

  const formatMonth = (yyyymm) => {
    if (!yyyymm) return '';
    const date = new Date(yyyymm + '-01');
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'paid': return <span style={{ background: '#ecfdf5', color: '#059669', padding: '6px 14px', borderRadius: '50px', fontSize: '13px', fontWeight: '600', border: '1px solid #a7f3d0' }}>Paid</span>;
      case 'unpaid': return <span style={{ background: '#fef2f2', color: '#dc2626', padding: '6px 14px', borderRadius: '50px', fontSize: '13px', fontWeight: '600', border: '1px solid #fca5a5' }}>Unpaid</span>;
      default: return <span style={{ background: '#fffbeb', color: '#d97706', padding: '6px 14px', borderRadius: '50px', fontSize: '13px', fontWeight: '600', border: '1px solid #fde68a' }}>Pending</span>;
    }
  };

  return (
    <div className="mm-modal-overlay" onClick={onClose} style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.3)',  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div
        className="mm-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '700px',
          maxHeight: '90vh',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Payroll Slip Details</h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: '0.2s' }}>✖</button>
        </div>

        <div style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflowY: 'auto',
          flex: 1,
        }}>

          {/* Staff Info Header Card */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '700' }}>{item.staff?.first_name} {item.staff?.last_name || ''}</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>{item.staff?.designation?.name || 'Staff'} • ID: {item.staff?.staff_id_no}</p>
            </div>
            <div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4f46e5', background: '#eef2ff', padding: '6px 12px', borderRadius: '8px' }}>{formatMonth(item.salary_month)}</span>
            </div>
          </div>

          {/* Breakdown Section */}
          <div>
            <h5 style={{ margin: '0 0 10px 0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700' }}>Salary Breakdown</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#475569' }}>
                <span>Basic Salary</span>
                <span style={{ fontWeight: '500', color: '#0f172a' }}>৳ {item.basic_salary}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#475569' }}>
                <span>Allowance</span>
                <span style={{ fontWeight: '600', color: '#16a34a' }}>+ ৳ {item.allowance}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#475569' }}>
                <span>Deduction</span>
                <span style={{ fontWeight: '600', color: '#dc2626' }}>- ৳ {item.deduction}</span>
              </div>
            </div>
          </div>

          {/* Net Salary Total */}
          <div style={{ background: '#eef2ff', padding: '16px', borderRadius: '12px', border: '1px solid #e0e7ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#3730a3', fontWeight: '700', fontSize: '15px' }}>Net Payable Amount</span>
            <span style={{ fontWeight: '800', color: '#4f46e5', fontSize: '22px' }}>৳ {item.net_salary}</span>
          </div>

          {/* Payment & Status Section */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700' }}>Payment Information</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Status</p>
                {getStatusBadge(item.status)}
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>Method & Date</p>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                  {item.payment_method || 'N/A'}
                  {item.payment_date && <span style={{ fontWeight: '400', color: '#64748b', fontSize: '13px' }}> ({item.payment_date})</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {item.note && (
            <div style={{ background: '#fffbeb', padding: '12px 16px', borderRadius: '8px', border: '1px solid #fef3c7' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '700', color: '#b45309' }}>Note / Remarks:</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#d97706', fontStyle: 'italic' }}>{item.note}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
          <button type="button" onClick={onClose} style={{ padding: '9px 20px', background: '#fff', color: '#334155', borderRadius: '8px', fontWeight: '600', border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '14px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// --- Form Modal Component ---
function PayrollFormModal({ item, staffs, onClose }) {
  const isEdit = !!item;
  const currentMonth = new Date().toISOString().slice(0, 7);

  const { data, setData, post, put, processing, reset } = useForm({
    staff_id: item?.staff_id ?? '',
    salary_month: item?.salary_month ?? currentMonth,
    basic_salary: item?.basic_salary ?? '',
    allowance: item?.allowance ?? 0,
    deduction: item?.deduction ?? 0,
    payment_method: item?.payment_method ?? 'Cash',
    payment_date: item?.payment_date ?? '',
    status: item?.status ?? 'unpaid',
    note: item?.note ?? '',
  });

  useEffect(() => {
    if (!isEdit && data.staff_id) {
      const selectedStaff = staffs.find(s => s.id == data.staff_id);
      if (selectedStaff) {
        setData('basic_salary', selectedStaff.basic_salary);
      }
    }
  }, [data.staff_id]);

  const netSalary = (parseFloat(data.basic_salary || 0) + parseFloat(data.allowance || 0)) - parseFloat(data.deduction || 0);

  const submit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route('admin.staff-payrolls.update', item.id), { onSuccess: () => { reset(); onClose(); } });
    } else {
      post(route('admin.staff-payrolls.store'), { onSuccess: () => { reset(); onClose(); } });
    }
  };

  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#344054', marginBottom: '6px' };
  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d0d5dd', fontSize: '14px', outline: 'none', transition: '0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };

  return (
    <div className="mm-modal-overlay" onClick={onClose} style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.3)',  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="mm-modal" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '650px', background: '#fff', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>{isEdit ? 'Edit Payroll Record' : 'Generate New Payroll'}</h3>
          <button className="icon-btn" onClick={onClose} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', color: '#64748b' }}><Icon name="close" /></button>
        </div>

        {/* Form Body */}
        <form onSubmit={submit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Select Staff <span style={{color: '#d92d20'}}>*</span></label>
              <select value={data.staff_id} onChange={e => setData('staff_id', e.target.value)} required disabled={isEdit} style={{ ...inputStyle, background: isEdit ? '#f8fafc' : '#fff', color: isEdit ? '#64748b' : '#0f172a' }}>
                <option value="">-- Choose Staff --</option>
                {staffs.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name || ''} ({s.staff_id_no})</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Salary Month <span style={{color: '#d92d20'}}>*</span></label>
              <input type="month" value={data.salary_month} onChange={e => setData('salary_month', e.target.value)} required disabled={isEdit} style={{ ...inputStyle, background: isEdit ? '#f8fafc' : '#fff', color: isEdit ? '#64748b' : '#0f172a' }} />
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Basic Salary (৳)</label>
              <input type="number" step="0.01" value={data.basic_salary} onChange={e => setData('basic_salary', e.target.value)} required style={inputStyle} />
            </div>
            <div>
              <label style={{ ...labelStyle, color: '#16a34a' }}>Allowance (+)</label>
              <input type="number" step="0.01" value={data.allowance} onChange={e => setData('allowance', e.target.value)} style={{ ...inputStyle, border: '1px solid #bbf7d0', color: '#15803d', fontWeight: '600' }} />
            </div>
            <div>
              <label style={{ ...labelStyle, color: '#dc2626' }}>Deduction (-)</label>
              <input type="number" step="0.01" value={data.deduction} onChange={e => setData('deduction', e.target.value)} style={{ ...inputStyle, border: '1px solid #fecaca', color: '#b91c1c', fontWeight: '600' }} />
            </div>
          </div>

          {/* Net Amount Summary Banner */}
          <div style={{ background: '#eef2ff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e0e7ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#3730a3' }}>Net Payable Amount:</span>
            <span style={{ fontSize: '24px', fontWeight: '800', color: '#4f46e5' }}>৳ {netSalary.toFixed(2)}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={data.status} onChange={e => setData('status', e.target.value)} style={inputStyle}>
                <option value="unpaid">Unpaid</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Payment Method</label>
              <select value={data.payment_method} onChange={e => setData('payment_method', e.target.value)} style={inputStyle}>
                <option value="Cash">Cash</option>
                <option value="Bank">Bank Transfer</option>
                <option value="Mobile Banking">Mobile Banking</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Payment Date</label>
              <input type="date" value={data.payment_date} onChange={e => setData('payment_date', e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Note / Remarks</label>
            <input type="text" value={data.note} onChange={e => setData('note', e.target.value)} placeholder="Any special note for allowance/deduction" style={inputStyle} />
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: '#fff', border: '1px solid #d0d5dd', color: '#344054', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }} disabled={processing}>Cancel</button>
            <button type="submit" style={{ padding: '10px 24px', background: '#4f46e5', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: processing ? 'not-allowed' : 'pointer', fontSize: '14px', boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)' }} disabled={processing}>
              {processing ? 'Processing...' : 'Save Payroll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Index Component ---
export default function Index({ payrolls = { data: [] }, staffs = [], filters = {} }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [month, setMonth] = useState(filters.month ?? '');
  const [status, setStatus] = useState(filters.status ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [formOpen, setFormOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
    if (flash?.error) Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: flash.error, showConfirmButton: false, timer: 4000 });
  }, [flash]);

  const applyFilters = (overrides = {}) => {
    router.get(route('admin.staff-payrolls.index'), {
      search, month, status, per_page: perPage, ...overrides
    }, { preserveState: true, replace: true });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'paid': return <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>Paid</span>;
      case 'unpaid': return <span style={{ background: '#fef2f2', color: '#dc2626', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>Unpaid</span>;
      default: return <span style={{ background: '#fef9c3', color: '#ca8a04', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>Pending</span>;
    }
  };

  const formatMonth = (yyyymm) => {
    if (!yyyymm) return '';
    const date = new Date(yyyymm + '-01');
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="eyebrow" style={{ color: '#64748b', fontSize: '14px' }}>Accounts & HR</span>
            <h1 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>Staff Payroll Management</h1>
            <p className="desc" style={{ margin: '4px 0 0 0', color: '#64748b' }}>Generate and manage monthly salary records for staff and teachers.</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#0f172a', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
              <Icon name="plus" /> Generate Payroll
            </button>
          </div>
        </div>
      }
    >
      <Head title="Staff Payrolls" />

      <div className="card mm-card" style={{ marginBottom: '20px', background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div className="mm-filters" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={perPage} onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value }); }} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
            <option value="10">10 / Page</option>
            <option value="20">20 / Page</option>
            <option value="50">50 / Page</option>
            <option value="all">Show All</option>
          </select>

          <div className="search" style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <input placeholder="Search Staff Name or ID..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyFilters()} style={{ padding: '10px 10px 10px 35px', borderRadius: '6px', border: '1px solid #ddd', width: '100%' }} />
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
          </div>

          <input type="month" value={month} onChange={e => setMonth(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} title="Filter by Month" />

          <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="pending">Pending</option>
          </select>

          <button className="btn btn-outline" onClick={() => applyFilters()} style={{ padding: '10px 20px', borderRadius: '6px', background: '#f1f5f9', border: '1px solid #cbd5e1', cursor: 'pointer' }}>Filter</button>
        </div>
      </div>

      <div className="card mm-card" style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div className="mm-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="mm-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '15px', color: '#475569' }}>Month</th>
                <th style={{ padding: '15px', color: '#475569' }}>Staff Details</th>
                <th style={{ padding: '15px', color: '#475569' }}>Salary Breakdown</th>
                <th style={{ padding: '15px', color: '#475569' }}>Net Payable</th>
                <th style={{ padding: '15px', color: '#475569' }}>Status</th>
                <th style={{ padding: '15px', textAlign: 'center', color: '#475569' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrolls?.data?.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>কোনো বেতনের রেকর্ড পাওয়া যায়নি।</td></tr>
              )}
              {payrolls?.data?.map(payroll => (
                <tr key={payroll.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '15px', fontWeight: 'bold', color: '#0f172a' }}>{formatMonth(payroll.salary_month)}</td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{payroll.staff?.first_name} {payroll.staff?.last_name || ''}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{payroll.staff?.designation?.name} • ID: {payroll.staff?.staff_id_no}</div>
                  </td>
                  <td style={{ padding: '15px', fontSize: '13px' }}>
                    <div>Basic: ৳ {payroll.basic_salary}</div>
                    {payroll.allowance > 0 && <div style={{ color: '#16a34a' }}>+ Allow: ৳ {payroll.allowance}</div>}
                    {payroll.deduction > 0 && <div style={{ color: '#dc2626' }}>- Deduct: ৳ {payroll.deduction}</div>}
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontWeight: '800', color: '#4f46e5', fontSize: '16px' }}>৳ {payroll.net_salary}</div>
                    {payroll.payment_method && <div style={{ fontSize: '12px', color: '#64748b' }}>Via {payroll.payment_method}</div>}
                  </td>
                  <td style={{ padding: '15px' }}>
                    {getStatusBadge(payroll.status)}
                    {payroll.status === 'paid' && payroll.payment_date && <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>On {payroll.payment_date}</div>}
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {/* View Button */}
                      <button title="View Details" onClick={() => setViewingItem(payroll)} style={{ padding: '6px', color: '#10b981', background: '#d1fae5', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        <Icon name="eye" />
                      </button>

                      {/* Edit Button */}
                      <button title="Edit Payroll" onClick={() => { setEditingItem(payroll); setFormOpen(true); }} style={{ padding: '6px', color: '#3b82f6', background: '#eff6ff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        <Icon name="edit" />
                      </button>

                      {/* Delete Button */}
                      <button title="Delete Payroll" onClick={() => setDeletingItem(payroll)} style={{ padding: '6px', color: '#fff', background: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        <Icon name="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9' }}>
          {payrolls?.links && <Pagination meta={payrolls} />}
        </div>
      </div>

      {/* Modals */}
      {viewingItem && <PayrollViewModal item={viewingItem} onClose={() => setViewingItem(null)} />}
      {formOpen && <PayrollFormModal item={editingItem} staffs={staffs} onClose={() => setFormOpen(false)} />}
      {deletingItem && <ConfirmDeleteModal item={deletingItem} onCancel={() => setDeletingItem(null)} onConfirm={() => { router.delete(route('admin.staff-payrolls.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) }); }} />}
    </AuthenticatedLayout>
  );
}
