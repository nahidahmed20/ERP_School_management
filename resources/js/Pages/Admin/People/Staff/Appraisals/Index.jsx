import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import AppraisalFormModal from './Partials/AppraisalFormModal';
import Swal from 'sweetalert2';

export default function Index({ appraisals, staffList, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  
  const [editingItem, setEditingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
  }, [flash]);

  function applyFilters() {
    router.get(route('admin.staff-appraisals.index'), { search }, { preserveState: true, replace: true });
  }

  // Helper to render stars
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= Math.round(rating) ? '#eab308' : '#e2e8f0', fontSize: '18px' }}>
          ★
        </span>
      );
    }
    return <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>{stars} <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '5px' }}>({rating}/5)</span></div>;
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">HR & Payroll</span><h1>Performance & Appraisals</h1></div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setIsFormOpen(true); }}>
              <Icon name="star" /> Evaluate Staff
            </button>
          </div>
        </div>
      }
    >
      <Head title="Performance & Appraisals" />
      <div className="card mm-card">
        
        <div className="mm-filters" style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="search">
              <Icon name="search" />
              <input placeholder="Search Staff Name/ID..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
            </div>
            <button className="btn btn-outline" onClick={applyFilters}>Search</button>
          </div>
        </div>

        <div className="mm-table-wrap mt-3">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>SL</th>
                <th>Staff Member</th>
                <th>Appraisal Period</th>
                <th>Performance Rating</th>
                <th>Evaluator & Date</th>
                <th className="mm-actions-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {appraisals.data.length === 0 && <tr><td colSpan={6} className="mm-empty">No appraisal records found.</td></tr>}
              {appraisals.data.map((item, index) => (
                <tr key={item.id}>
                  <td>{(appraisals.from ?? 1) + index}</td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{item.staff?.first_name} {item.staff?.last_name}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      ID: {item.staff?.staff_id_no} | {item.staff?.designation?.name || 'Staff'}
                    </div>
                  </td>
                  <td>
                    <span className="badge-outline border-blue-600 text-blue-700">{item.period}</span>
                  </td>
                  <td>
                    {renderStars(item.rating)}
                    {item.remarks && (
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        "{item.remarks}"
                      </div>
                    )}
                  </td>
                  <td>
                    <strong style={{ color: '#334155', fontSize: '13px' }}>{new Date(item.appraisal_date).toLocaleDateString()}</strong>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>By: {item.evaluator?.name}</div>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" onClick={() => { setEditingItem(item); setIsFormOpen(true); }}><Icon name="edit" /></button>
                      <button className="icon-btn icon-btn-danger" onClick={() => setDeletingItem(item)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={appraisals} />
      </div>

      {isFormOpen && <AppraisalFormModal item={editingItem} staffList={staffList} onClose={() => setIsFormOpen(false)} />}
      
      {deletingItem && (
        <ConfirmDeleteModal 
          item={{ name: "this appraisal record" }} 
          message="Are you sure you want to delete this performance review? This action cannot be undone."
          onCancel={() => setDeletingItem(null)} 
          onConfirm={() => {
            router.delete(route('admin.staff-appraisals.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
          }} 
        />
      )}
    </AuthenticatedLayout>
  );
}