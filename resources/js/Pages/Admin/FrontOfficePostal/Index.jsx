import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import FormModal from './Partials/FormModal';
import ShowModal from './Partials/ShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ records, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [typeFilter, setTypeFilter] = useState(filters.type ?? '');

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
    router.get(route('admin.frontoffice.postal.index'), { search, type: typeFilter }, { preserveState: true });
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      router.delete(route('admin.frontoffice.postal.destroy', deleteId), {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Front Office</span>
            <h1>Postal Dispatch / Receive</h1>
            <p className="desc">স্কুলে আসা চিঠি বা পার্সেল এবং পাঠানো ডকুমেন্টস ট্র্যাক করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Add Record
            </button>
          </div>
        </div>
      }
    >
      <Head title="Postal Dispatch / Receive" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search title or ref..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>

          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); applyFilters(); }}>
            <option value="">All Types</option>
            <option value="Receive">Receive (গৃহীত)</option>
            <option value="Dispatch">Dispatch (প্রেরিত)</option>
          </select>

          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Title / Name</th>
                <th>Reference No</th>
                <th>Type</th>
                <th>Date</th>
                <th>Attachment</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.data.length === 0 && (
                <tr><td colSpan={6} className="mm-empty">কোনো পোস্টাল রেকর্ড পাওয়া যায়নি।</td></tr>
              )}
              {records.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{item.title}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {item.address ? (item.address.length > 30 ? item.address.substring(0,30)+'...' : item.address) : '-'}
                    </div>
                  </td>
                  <td>{item.reference_no || '-'}</td>
                  <td>
                    <span style={{ backgroundColor: item.type === 'Receive' ? '#dcfce7' : '#dbeafe', color: item.type === 'Receive' ? '#15803d' : '#1d4ed8', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                      {item.type}
                    </span>
                  </td>
                  <td>{item.date}</td>
                  <td>
                    {item.attachment ? (
                      <a href={`/storage/${item.attachment}`} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px' }}>
                        <Icon name="download" style={{fontSize: '12px'}}/> View
                      </a>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>N/A</span>
                    )}
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
        <Pagination meta={records} />
      </div>

      {formOpen && <FormModal item={editingItem} onClose={() => setFormOpen(false)} />}
      {showItem && <ShowModal item={showItem} onClose={() => setShowItem(null)} />}

      {deleteId && (
        <ConfirmDeleteModal
          show={Boolean(deleteId)}
          onClose={() => setDeleteId(null)}
          onCancel={() => setDeleteId(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Postal Record"
          message="আপনি কি নিশ্চিত যে এই রেকর্ডটি চিরতরে মুছে ফেলতে চান?"
        />
      )}
      
    </AuthenticatedLayout>
  );
}