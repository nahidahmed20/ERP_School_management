import { useState, useEffect } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import TranscriptShowModal from './Partials/TranscriptShowModal';
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
    router.get(route('admin.documents.transcripts.index'), { search }, { preserveState: true, replace: true });
  }

  const handleStatusToggle = (item) => {
    router.put(route('admin.documents.transcripts.update', item.id), {
      ...item,
      is_active: !item.is_active
    }, { preserveScroll: true });
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">Documents & Certificates</span><h1>Transcript Templates</h1></div>
          <div className="mm-head-actions">
            {/* LINK TO CREATE PAGE */}
            <Link href={route('admin.documents.transcripts.create')} className="btn">
              <Icon name="plus" /> Create Template
            </Link>
          </div>
        </div>
      }
    >
      <Head title="Transcript Templates" />
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
              <tr><th style={{width: '60px'}}>SL</th><th>Title</th><th>Grading System</th><th>Status</th><th className="mm-actions-col">Actions</th></tr>
            </thead>
            <tbody>
              {templates.data.length === 0 && <tr><td colSpan={5} className="mm-empty">No templates found.</td></tr>}
              {templates.data.map((item, index) => (
                <tr key={item.id}>
                  <td>{(templates.from ?? 1) + index}</td>
                  <td><strong>{item.title}</strong></td>
                  <td><span className="badge-outline">{item.grading_system}</span></td>
                  <td>
                    <button onClick={() => handleStatusToggle(item)} className={`mm-badge ${item.is_active ? 'badge-active' : 'badge-inactive'}`} style={{ border: 'none', cursor: 'pointer' }}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <div className="mm-row-actions">
                      <button className="icon-btn" title="Preview" onClick={() => setViewingItem(item)}><Icon name="eye" /></button>

                      {/* LINK TO EDIT PAGE */}
                      <Link href={route('admin.documents.transcripts.edit', item.id)} className="icon-btn" title="Edit">
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

      {viewingItem && <TranscriptShowModal item={viewingItem} onClose={() => setViewingItem(null)} />}
      {deletingItem && (
        <ConfirmDeleteModal item={{ name: deletingItem.title }} onCancel={() => setDeletingItem(null)} onConfirm={() => {
            router.delete(route('admin.documents.transcripts.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
        }} />
      )}
    </AuthenticatedLayout>
  );
}
