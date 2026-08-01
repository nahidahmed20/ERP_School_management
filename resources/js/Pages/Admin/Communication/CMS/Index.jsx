import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import CmsFormModal from './Partials/CmsFormModal';
import Swal from 'sweetalert2';

export default function Index({ contents, campuses, activeCampusId, filters }) {
  const { flash } = usePage().props;

  const [search, setSearch] = useState(filters.search ?? '');
  const [perPage, setPerPage] = useState(filters.per_page ?? '10');

  const [editingItem, setEditingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
  }, [flash]);

  function applyFilters() {
    router.get(route('admin.communication.cms.index'), { search, per_page: perPage }, { preserveState: true, replace: true });
  }

  useEffect(() => {
    if (perPage !== (filters.per_page ?? '10')) applyFilters();
  }, [perPage]);

  // Fast toggle publish status
  const togglePublish = (item) => {
    router.put(route('admin.communication.cms.update', item.id), { ...item, is_published: !item.is_published }, { preserveScroll: true });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">Communication</span><h1>Website CMS</h1></div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setIsFormOpen(true); }}>
              <Icon name="plus" /> Add Content
            </button>
          </div>
        </div>
      }
    >
      <Head title="Website CMS" />
      <div className="card mm-card">

        <div className="mm-filters" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Show</span>
            <select value={perPage} onChange={(e) => setPerPage(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}>
              <option value="10">10</option><option value="25">25</option><option value="50">50</option>
              <option value="100">100</option><option value="500">500</option><option value="All">All</option>
            </select>
            <span style={{ fontSize: '14px', color: '#64748b' }}>entries</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="search">
              <Icon name="search" />
              <input placeholder="Search title or type..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
            </div>
            <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
          </div>
        </div>

        <div className="mm-table-wrap mt-3">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '70px'}}>Image</th>
                <th>Content Details</th>
                <th>Type</th>
                <th>Status</th>
                <th className="mm-actions-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {contents.data.length === 0 && <tr><td colSpan={5} className="mm-empty">No content found.</td></tr>}
              {contents.data.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.featured_image ? (
                      <img src={`/storage/${item.featured_image}`} alt={item.title} style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                    ) : (
                      <div style={{ width: '50px', height: '40px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', color: '#94a3b8' }}><Icon name="image" /></div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{item.title}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>/{item.slug}</div>
                  </td>
                  <td><span className="badge-outline">{item.content_type}</span></td>
                  <td>
                    <button onClick={() => togglePublish(item)} className={`mm-badge ${item.is_published ? 'badge-active' : 'badge-inactive'}`} style={{ border: 'none', cursor: 'pointer' }}>
                      {item.is_published ? 'Published' : 'Draft'}
                    </button>
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

        <Pagination meta={contents} />
      </div>

      {isFormOpen && <CmsFormModal item={editingItem} campuses={campuses} activeCampusId={activeCampusId} onClose={() => setIsFormOpen(false)} />}

      {deletingItem && (
        <ConfirmDeleteModal item={{ name: deletingItem.title }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.communication.cms.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}
