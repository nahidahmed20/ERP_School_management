import { useState, useEffect } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import IdCardShowModal from './Partials/IdCardShowModal';
import Swal from 'sweetalert2';

export default function Index({ templates, campuses, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [viewingItem, setViewingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
  }, [flash]);

  function applyFilters() {
    router.get(route('admin.documents.idcards.index'), { search }, { preserveState: true, replace: true });
  }

  const handleStatusToggle = (item) => {
    // Fast status toggle without going to edit page
    router.put(route('admin.documents.idcards.update', item.id), {
      ...item,
      is_active: !item.is_active
    }, { preserveScroll: true });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">Documents & Certificates</span><h1>ID Card Templates</h1></div>
          <div className="mm-head-actions">
            {/* LINK TO CREATE PAGE */}
            <Link href={route('admin.documents.idcards.create')} className="btn">
              <Icon name="plus" /> Create Template
            </Link>
          </div>
        </div>
      }
    >
      <Head title="ID Card Templates" />
      <div className="card mm-card">
        <div className="mm-filters">
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search title..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
          </div>
          <button className="btn btn-outline" onClick={applyFilters}>Filter</button>
        </div>

        <div className="mm-table-wrap">
          <table className="mm-table">
            <thead>
              <tr><th>Title</th><th>Layout</th><th>Color Theme</th><th>Status</th><th className="mm-actions-col">Actions</th></tr>
            </thead>
            <tbody>
              {templates.data.length === 0 && <tr><td colSpan={5} className="mm-empty">No templates found.</td></tr>}
              {templates.data.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.title}</strong></td>
                  <td><span className="badge-outline">{item.layout_type}</span></td>
                  <td><div style={{width: '24px', height: '24px', borderRadius: '4px', background: item.theme_color}}></div></td>
                  <td>
                    <button onClick={() => handleStatusToggle(item)} className={`mm-badge ${item.is_active ? 'badge-active' : 'badge-inactive'}`} style={{ border: 'none', cursor: 'pointer' }}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" title="Live Preview" onClick={() => setViewingItem(item)}><Icon name="eye" /></button>

                      {/* LINK TO EDIT PAGE */}
                      <Link href={route('admin.documents.idcards.edit', item.id)} className="icon-btn" title="Edit">
                        <Icon name="edit" />
                      </Link>

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

      {viewingItem && <IdCardShowModal item={viewingItem} onClose={() => setViewingItem(null)} />}
      {deletingItem && (
        <ConfirmDeleteModal item={{ name: deletingItem.title }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.documents.idcards.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}
