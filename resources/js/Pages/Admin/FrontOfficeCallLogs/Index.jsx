import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import FormModal from './Partials/FormModal';
import ShowModal from './Partials/ShowModal';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import Swal from 'sweetalert2';

export default function Index({ callLogs, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [typeFilter, setTypeFilter] = useState(filters.call_type ?? '');

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
    router.get(route('admin.frontoffice.call-logs.index'), { search, call_type: typeFilter }, { preserveState: true });
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      router.delete(route('admin.frontoffice.call-logs.destroy', deleteId), {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const getTypeBadge = (type) => {
    if (type === 'Incoming') return { bg: '#dcfce7', text: '#15803d' };
    return { bg: '#dbeafe', text: '#1d4ed8' }; // Outgoing
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div>
            <span className="eyebrow">Front Office</span>
            <h1>Phone Call Logs</h1>
            <p className="desc">স্কুলের রিসিভ করা এবং করা ফোন কলের রেকর্ড পরিচালনা করুন।</p>
          </div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setFormOpen(true); }}>
              <Icon name="plus" /> Add Call Log
            </button>
          </div>
        </div>
      }
    >
      <Head title="Phone Call Logs" />

      <div className="card mm-card">
        <div className="mm-filters" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>

          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); applyFilters(); }}>
            <option value="">All Call Types</option>
            <option value="Incoming">Incoming</option>
            <option value="Outgoing">Outgoing</option>
          </select>

          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th>Name & Phone</th>
                <th>Call Type</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Follow-up</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {callLogs.data.length === 0 && (
                <tr><td colSpan={6} className="mm-empty">কোনো কল লগ পাওয়া যায়নি।</td></tr>
              )}
              {callLogs.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{item.name}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{item.phone}</div>
                  </td>
                  <td>
                    <span style={{ backgroundColor: getTypeBadge(item.call_type).bg, color: getTypeBadge(item.call_type).text, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                      {item.call_type}
                    </span>
                  </td>
                  <td>{item.date}</td>
                  <td>{item.call_duration || '-'}</td>
                  <td>{item.next_follow_up_date || '-'}</td>
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
        <Pagination meta={callLogs} />
      </div>

      {formOpen && <FormModal item={editingItem} onClose={() => setFormOpen(false)} />}
      {showItem && <ShowModal item={showItem} onClose={() => setShowItem(null)} />}

      {deleteId && (
        <ConfirmDeleteModal
          show={Boolean(deleteId)}
          onClose={() => setDeleteId(null)}
          onCancel={() => setDeleteId(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Call Log"
          message="আপনি কি নিশ্চিত যে এই কল লগের রেকর্ডটি চিরতরে মুছে ফেলতে চান?"
        />
      )}
      
    </AuthenticatedLayout>
  );
}