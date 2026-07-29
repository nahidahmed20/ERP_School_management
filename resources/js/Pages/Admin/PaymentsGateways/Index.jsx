import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import FormModal from './Partials/FormModal';
import ShowModal from './Partials/ShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ gateways, filters }) {
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
    router.get(route('admin.payments.gateways.index'), { search }, { preserveState: true });
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      router.delete(route('admin.payments.gateways.destroy', deleteId), {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const handleStatusToggle = (id, currentStatus) => {
    router.patch(route('admin.payments.gateways.update-status', id), {
      is_active: !currentStatus
    }, { preserveScroll: true });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Finance & Payments</span>
            <h1>Payment Gateways</h1>
            <p className="desc">অনলাইন ফি সংগ্রহের জন্য পেমেন্ট গেটওয়েগুলোর API কনফিগারেশন করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Add Gateway
            </button>
          </div>
        </div>
      }
    >
      <Head title="Payment Gateways" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px' }}>
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search gateway..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>
          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Gateway / Logo</th>
                <th>Mode</th>
                <th>Currency</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {gateways.data.length === 0 && (
                <tr><td colSpan={5} className="mm-empty">কোনো পেমেন্ট গেটওয়ে কনফিগার করা নেই।</td></tr>
              )}
              {gateways.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {item.logo ? (
                        <img src={`/storage/${item.logo}`} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'contain', background: '#f8fafc', borderRadius: '4px', padding: '2px' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', background: '#e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="card" />
                        </div>
                      )}
                      <div>
                        <strong style={{ color: '#0f172a' }}>{item.name}</strong>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Slug: {item.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ backgroundColor: item.mode === 'live' ? '#fee2e2' : '#fef3c7', color: item.mode === 'live' ? '#b91c1c' : '#d97706', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      {item.mode}
                    </span>
                  </td>
                  <td>{item.currency}</td>
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
                      <button className="icon-btn" title="View Keys" onClick={() => setShowItem(item)}><Icon name="eye" /></button>
                      <button className="icon-btn" title="Edit" onClick={() => { setEditingItem(item); setFormOpen(true); }}><Icon name="edit" /></button>
                      <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => setDeleteId(item.id)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={gateways} />
      </div>

      {formOpen && <FormModal item={editingItem} onClose={() => setFormOpen(false)} />}
      {showItem && <ShowModal item={showItem} onClose={() => setShowItem(null)} />}

      {deleteId && (
        <ConfirmDeleteModal
          show={Boolean(deleteId)}
          onClose={() => setDeleteId(null)}
          onCancel={() => setDeleteId(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Gateway"
          message="আপনি কি নিশ্চিত যে এই পেমেন্ট গেটওয়েটি মুছে ফেলতে চান?"
        />
      )}
      
    </AuthenticatedLayout>
  );
}