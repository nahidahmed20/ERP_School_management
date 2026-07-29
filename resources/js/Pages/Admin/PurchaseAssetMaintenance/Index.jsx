import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import FormModal from './Partials/FormModal';
import ShowModal from './Partials/ShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ maintenances, assets, filters }) {
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
    router.get(route('admin.purchase.asset-maintenance.index'), { search, status: statusFilter }, { preserveState: true });
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      router.delete(route('admin.purchase.asset-maintenance.destroy', deleteId), {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const handleStatusChange = (id, newStatus) => {
    router.patch(route('admin.purchase.asset-maintenance.update-status', id), {
      status: newStatus
    }, { preserveScroll: true });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Completed': return { bg: '#dcfce7', text: '#15803d' };
      case 'In Progress': return { bg: '#dbeafe', text: '#1d4ed8' };
      case 'Cancelled': return { bg: '#fee2e2', text: '#b91c1c' };
      default: return { bg: '#fef3c7', text: '#d97706' }; // Pending
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Purchase & Assets</span>
            <h1>Asset Maintenance</h1>
            <p className="desc">স্কুলের সম্পদের মেরামত ও রক্ষণাবেক্ষণের কাজ ও খরচ ট্র্যাক করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Add Maintenance
            </button>
          </div>
        </div>
      }
    >
      <Head title="Asset Maintenance" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search task or provider..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>

          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); applyFilters(); }}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Asset / Task</th>
                <th>Provider & Type</th>
                <th>Cost</th>
                <th>Dates</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {maintenances.data.length === 0 && (
                <tr><td colSpan={6} className="mm-empty">কোনো মেইনটেন্যান্স রেকর্ড পাওয়া যায়নি।</td></tr>
              )}
              {maintenances.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{item.title}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{item.asset?.name}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '500' }}>{item.service_provider || 'In-house'}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{item.maintenance_type}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 'bold', color: '#b91c1c' }}>{item.cost} BDT</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px' }}>Start: {item.start_date}</div>
                    {item.end_date && <div style={{ fontSize: '12px', color: '#15803d' }}>End: {item.end_date}</div>}
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
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
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
        <Pagination meta={maintenances} />
      </div>

      {formOpen && <FormModal item={editingItem} assets={assets} onClose={() => setFormOpen(false)} />}
      {showItem && <ShowModal item={showItem} onClose={() => setShowItem(null)} />}

      {deleteId && (
        <ConfirmDeleteModal
          show={Boolean(deleteId)}
          onClose={() => setDeleteId(null)}
          onCancel={() => setDeleteId(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Maintenance Record"
          message="আপনি কি নিশ্চিত যে এই রেকর্ডটি মুছে ফেলতে চান?"
        />
      )}

    </AuthenticatedLayout>
  );
}
