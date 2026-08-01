import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import RequestModal from './Partials/RequestModal';
import ProcessModal from './Partials/ProcessModal';
import Swal from 'sweetalert2';

export default function Index({ approvals, campuses, activeCampusId, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [statusFilter, setStatusFilter] = useState(filters.status ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [processingItem, setProcessingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
  }, [flash]);

  function applyFilters() {
    router.get(route('admin.workflow-approvals.index'), { search, status: statusFilter, per_page: perPage }, { preserveState: true, replace: true });
  }

  useEffect(() => {
    if (perPage !== (filters.per_page ?? '10') || statusFilter !== (filters.status ?? '')) applyFilters();
  }, [perPage, statusFilter]);

  // Color mapping for statuses
  const getStatusStyle = (status) => {
    switch(status) {
      case 'Approved': return 'text-green-600 border-green-600 bg-green-50';
      case 'Rejected': return 'text-red-600 border-red-600 bg-red-50';
      case 'In Review': return 'text-blue-600 border-blue-600 bg-blue-50';
      default: return 'text-orange-600 border-orange-600 bg-orange-50';
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">System / Workflow & Forms</span><h1>Approval Workflows</h1></div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => setIsRequestModalOpen(true)}>
              <Icon name="plus" /> New Request
            </button>
          </div>
        </div>
      }
    >
      <Head title="Approval Workflows" />
      <div className="card mm-card">

        <div className="mm-filters" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Show</span>
            <select value={perPage} onChange={(e) => setPerPage(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <option value="10">10</option><option value="25">25</option><option value="50">50</option>
              <option value="100">100</option><option value="All">All</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Review">In Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <div className="search">
              <Icon name="search" />
              <input placeholder="Search requests..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
            </div>
            <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
          </div>
        </div>

        <div className="mm-table-wrap mt-3">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>SL</th>
                <th>Request Title & Details</th>
                <th>Type</th>
                <th>Requester</th>
                <th>Status</th>
                <th className="mm-actions-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {approvals.data.length === 0 && <tr><td colSpan={6} className="mm-empty">No requests found.</td></tr>}
              {approvals.data.map((item, index) => (
                <tr key={item.id}>
                  <td>{(approvals.from ?? 1) + index}</td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{item.title}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{item.details?.substring(0, 50)}...</div>
                  </td>
                  <td><span className="badge-outline">{item.type}</span></td>
                  <td>{item.requester_name}</td>
                  <td>
                    <span className={`badge-outline ${getStatusStyle(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => setProcessingItem(item)}>Review</button>
                      <button className="icon-btn icon-btn-danger" onClick={() => setDeletingItem(item)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={approvals} />
      </div>

      {/* Modals */}
      {isRequestModalOpen && <RequestModal campuses={campuses} activeCampusId={activeCampusId} onClose={() => setIsRequestModalOpen(false)} />}

      {processingItem && <ProcessModal item={processingItem} onClose={() => { setProcessingItem(null); applyFilters(); }} />}

      {deletingItem && (
        <ConfirmDeleteModal item={{ name: deletingItem.title }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.workflow-approvals.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}
