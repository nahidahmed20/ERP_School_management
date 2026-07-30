import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import TemplateFormModal from './Partials/TemplateFormModal';
import TemplateShowModal from './Partials/TemplateShowModal';
import Swal from 'sweetalert2';

export default function Index({ templates, campuses, activeCampusId, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
    }
  }, [flash]);

  function applyFilters() {
    router.get(route('admin.documents.certificatetemplates.index'), { search }, { preserveState: true, replace: true });
  }

  const handleStatusToggle = (item) => {
    router.put(route('admin.documents.certificatetemplates.update', item.id), {
      campus_id: item.campus_id,
      title: item.title,
      template_type: item.template_type,
      content_body: item.content_body,
      is_active: !item.is_active
    }, { preserveScroll: true });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">Documents & Certificates</span><h1>Certificate Templates</h1></div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => { setEditingItem(null); setIsFormOpen(true); }}><Icon name="plus" /> Create Template</button>
          </div>
        </div>
      }
    >
      <Head title="Certificate Templates" />
      <div className="card mm-card">
        <div className="mm-filters">
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search template title..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>
          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>SL</th>
                <th>Template Title</th>
                <th>Type</th>
                <th>Status</th>
                <th className="mm-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.data.length === 0 && <tr><td colSpan={5} className="mm-empty">No certificate templates found.</td></tr>}
              {templates.data.map((item, index) => (
                <tr key={item.id}>
                  <td>{(templates.from ?? 1) + index}</td>
                  <td>
                    <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{item.title}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Created via system editor</div>
                  </td>
                  <td><span className="badge-outline">{item.template_type}</span></td>
                  <td>
                    <button 
                      onClick={() => handleStatusToggle(item)}
                      className={`mm-badge ${item.is_active ? 'badge-active' : 'badge-inactive'}`}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      {item.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" title="Preview Certificate" onClick={() => setViewingItem(item)}><Icon name="eye" /></button>
                      <button className="icon-btn" title="Edit Template" onClick={() => { setEditingItem(item); setIsFormOpen(true); }}><Icon name="edit" /></button>
                      <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => setDeletingItem(item)}><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={templates} />
      </div>

      {isFormOpen && <TemplateFormModal item={editingItem} campuses={campuses} activeCampusId={activeCampusId} onClose={() => setIsFormOpen(false)} />}
      {viewingItem && <TemplateShowModal item={viewingItem} onClose={() => setViewingItem(null)} />}
      {deletingItem && (
        <ConfirmDeleteModal item={{ name: deletingItem.title }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.documents.certificatetemplates.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}