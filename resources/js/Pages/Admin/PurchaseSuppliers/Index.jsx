import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import FormModal from './Partials/FormModal';
import ShowModal from './Partials/ShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ suppliers, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');

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
    router.get(route('admin.purchase.suppliers.index'), { search }, { preserveState: true });
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      router.delete(route('admin.purchase.suppliers.destroy', deleteId), {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const handleStatusToggle = (id, currentStatus) => {
    router.patch(route('admin.purchase.suppliers.update-status', id), {
      is_active: !currentStatus
    }, { preserveScroll: true });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Purchase & Assets</span>
            <h1>Suppliers</h1>
            <p className="desc">যাদের কাছ থেকে স্কুলের পণ্য বা উপকরণ কেনা হয় তাদের তালিকা।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Add Supplier
            </button>
          </div>
        </div>
      }
    >
      <Head title="Suppliers" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px' }}>
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>
          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Contact Person</th>
                <th>Phone & Email</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.data.length === 0 && (
                <tr><td colSpan={5} className="mm-empty">কোনো সাপ্লায়ার পাওয়া যায়নি।</td></tr>
              )}
              {suppliers.data.map((item) => (
                <tr key={item.id}>
                  <td><strong style={{ color: '#0f172a' }}>{item.name}</strong></td>
                  <td>{item.contact_person || '-'}</td>
                  <td>
                    <div style={{ fontWeight: '500' }}>{item.phone}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{item.email || 'N/A'}</div>
                  </td>
                  <td>
                    <button
                      onClick={() => handleStatusToggle(item.id, item.is_active)}
                      style={{
                        backgroundColor: item.is_active ? '#dcfce7' : '#f1f5f9',
                        color: item.is_active ? '#15803d' : '#64748b',
                        border: 'none', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer'
                      }}
                    >
                      {item.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" title="View" onClick={() => setShowItem(item)}><Icon name="eye" /></button>
                      <button className="icon-btn" title="Edit" onClick={() => { setEditingItem(item); setFormOpen(true); }}><Icon name="edit" /></button>
                      <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => setDeleteId(item.id)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={suppliers} />
      </div>

      {formOpen && <FormModal item={editingItem} onClose={() => setFormOpen(false)} />}
      {showItem && <ShowModal item={showItem} onClose={() => setShowItem(null)} />}

      {deleteId && (
        <ConfirmDeleteModal
          show={Boolean(deleteId)}
          onClose={() => setDeleteId(null)}
          onCancel={() => setDeleteId(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Supplier"
          message="আপনি কি নিশ্চিত যে এই সাপ্লায়ারকে মুছে ফেলতে চান?"
        />
      )}

    </AuthenticatedLayout>
  );
}
