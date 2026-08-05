import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Icon from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import UploadMaterialModal from './Partials/UploadMaterialModal';
import Swal from 'sweetalert2';

export default function Index({ materials, classes, subjects, filters }) {
  const { flash } = usePage().props;
  const [search, setSearch] = useState(filters.search ?? '');
  const [classFilter, setClassFilter] = useState(filters.class_id ?? '');

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    if (flash?.success) Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flash.success, showConfirmButton: false, timer: 3000 });
  }, [flash]);

  function applyFilters() {
    router.get(route('admin.study-materials.index'), { search, class_id: classFilter }, { preserveState: true, replace: true });
  }

  useEffect(() => {
    if (classFilter !== (filters.class_id ?? '')) applyFilters();
  }, [classFilter]);

  const getFileIcon = (ext) => {
    if (['pdf'].includes(ext)) return { name: 'file-text', color: '#dc2626' }; // Red for PDF
    if (['doc', 'docx'].includes(ext)) return { name: 'file-text', color: '#2563eb' }; // Blue for Word
    if (['xls', 'xlsx'].includes(ext)) return { name: 'file-text', color: '#16a34a' }; // Green for Excel
    if (['jpg', 'jpeg', 'png'].includes(ext)) return { name: 'image', color: '#9333ea' };
    return { name: 'file', color: '#64748b' };
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="page-head">
          <div><span className="eyebrow">Academics</span><h1>Study Materials & Downloads</h1></div>
          <div className="mm-head-actions">
            <button className="btn" onClick={() => setIsUploadOpen(true)}>
              <Icon name="upload" /> Upload Material
            </button>
          </div>
        </div>
      }
    >
      <Head title="Study Materials" />
      <div className="card mm-card">

        <div className="mm-filters" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <option value="">Filter by Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="search">
              <Icon name="search" />
              <input placeholder="Search title..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} />
            </div>
            <button className="btn btn-outline" onClick={applyFilters}>Search</button>
          </div>
        </div>

        <div className="mm-table-wrap mt-3">
          <table className="mm-table">
            <thead>
              <tr>
                <th style={{width: '60px'}}>SL</th>
                <th>Title & Details</th>
                <th>Class & Subject</th>
                <th>File Type</th>
                <th>Uploaded Date</th>
                <th className="mm-actions-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {materials.data.length === 0 && <tr><td colSpan={6} className="mm-empty">No study materials uploaded yet.</td></tr>}
              {materials.data.map((item, index) => {
                const iconData = getFileIcon(item.file_type);
                return (
                  <tr key={item.id}>
                    <td>{(materials.from ?? 1) + index}</td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{item.title}</strong>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>By: {item.uploader?.name || 'Admin'}</div>
                    </td>
                    <td>
                      <span className="badge-outline border-indigo-600 text-indigo-600">{item.school_class?.name}</span>
                      {item.subject && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{item.subject.name}</div>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Icon name={iconData.name} style={{ color: iconData.color, width: '16px', height: '16px' }} />
                        <span style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>{item.file_type}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', color: '#334155' }}>{new Date(item.created_at).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <div className="mm-row-actions">
                        <a href={route('admin.study-materials.download', item.id)} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '12px', borderColor: '#4f46e5', color: '#4f46e5' }}>
                          <Icon name="download" style={{ width: '12px', height: '12px' }} /> Download
                        </a>
                        <button className="icon-btn icon-btn-danger" onClick={() => setDeletingItem(item)}><Icon name="trash" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination meta={materials} />
      </div>

      {isUploadOpen && <UploadMaterialModal classes={classes} subjects={subjects} onClose={() => setIsUploadOpen(false)} />}

      {deletingItem && (
        <ConfirmDeleteModal
          item={{ name: deletingItem.title }}
          message="Are you sure you want to delete this material? The file will be permanently removed."
          onCancel={() => setDeletingItem(null)}
          onConfirm={() => {
            router.delete(route('admin.study-materials.destroy', deletingItem.id), { onSuccess: () => setDeletingItem(null) });
          }}
        />
      )}
    </AuthenticatedLayout>
  );
}
