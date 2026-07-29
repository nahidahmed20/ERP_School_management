import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import FormModal from './Partials/FormModal';
import ShowModal from './Partials/ShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ assignments, assets, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [statusFilter, setStatusFilter] = useState(filters.status ?? '');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showItem, setShowItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
      setFormOpen(false);
    }
  }, [flash]);

  const applyFilters = () => {
    router.get(route('admin.purchase.asset-assignments.index'), { search, status: statusFilter }, { preserveState: true });
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      router.delete(route('admin.purchase.asset-assignments.destroy', deleteId), {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const handleStatusChange = (id, newStatus) => {
    router.patch(route('admin.purchase.asset-assignments.update-status', id), {
      status: newStatus
    }, { preserveScroll: true });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Returned': return { bg: '#dcfce7', text: '#15803d' };
      case 'Damaged': return { bg: '#fef3c7', text: '#d97706' };
      case 'Lost': return { bg: '#fee2e2', text: '#b91c1c' };
      default: return { bg: '#dbeafe', text: '#1d4ed8' }; // Assigned
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Purchase & Assets</span>
            <h1>Asset Assignments</h1>
            <p className="desc">স্টাফদের মাঝে বিতরণ করা স্কুলের সম্পদের হিসাব রাখুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Assign Asset
            </button>
          </div>
        </div>
      }
    >
      <Head title="Asset Assignments" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search asset or assignee..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>

          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); applyFilters(); }}>
            <option value="">All Status</option>
            <option value="Assigned">Assigned</option>
            <option value="Returned">Returned</option>
            <option value="Damaged">Damaged</option>
            <option value="Lost">Lost</option>
          </select>

          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Asset Details</th>
                <th>Assigned To</th>
                <th>Assigned Date</th>
                <th>Due / Returned</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.data.length === 0 && (
                <tr><td colSpan={6} className="mm-empty">কোনো অ্যাসাইনমেন্ট পাওয়া যায়নি।</td></tr>
              )}
              {assignments.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{item.asset?.name || 'Unknown Asset'}</strong>
                  </td>
                  <td>
                    <span style={{ fontWeight: '500' }}>{item.assignee_name}</span>
                  </td>
                  <td>{item.assigned_date}</td>
                  <td>
                    {item.status === 'Returned' ? (
                      <span style={{ color: '#15803d', fontWeight: '500' }}>Returned: {item.returned_date}</span>
                    ) : (
                      <span style={{ color: '#64748b' }}>Due: {item.due_date || 'N/A'}</span>
                    )}
                  </td>
                  <td>
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      style={{
                        backgroundColor: getStatusBadge(item.status).bg,
                        color: getStatusBadge(item.status).text,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        border: '1px solid transparent',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="Assigned">Assigned</option>
                      <option value="Returned">Returned</option>
                      <option value="Damaged">Damaged</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" title="View Details" onClick={() => setShowItem(item)}><Icon name="eye" /></button>
                      <button className="icon-btn" title="Edit" onClick={() => { setEditingItem(item); setFormOpen(true); }}><Icon name="edit" /></button>
                      <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => setDeleteId(item.id)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={assignments} />
      </div>

      {formOpen && <FormModal item={editingItem} assets={assets} onClose={() => setFormOpen(false)} />}
      {showItem && <ShowModal item={showItem} onClose={() => setShowItem(null)} />}

      {deleteId && (
        <ConfirmDeleteModal
          show={Boolean(deleteId)}
          onClose={() => setDeleteId(null)}
          onCancel={() => setDeleteId(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Assignment"
          message="আপনি কি নিশ্চিত যে এই রেকর্ডটি মুছে ফেলতে চান?"
        />
      )}

    </AuthenticatedLayout>
  );
}
